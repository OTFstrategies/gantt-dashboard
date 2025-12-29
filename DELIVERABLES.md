# DELIVERABLES - Gantt Dashboard Project

> Versie: 1.0.0
> Laatste update: 2024-12-29
> Status: Complete Deliverable Specifications

## Overzicht

Dit document bevat alle gedetailleerde specificaties voor de 29 deliverables van het Gantt Dashboard project.

### Categorieën

| Categorie | Deliverables | Codes |
|-----------|--------------|-------|
| Code Modules | 10 | D1-D10 |
| Infrastructure | 4 | D11-D14 |
| Documentation | 3 | D15-D17 |
| Miro Boards | 7 | M1-M7 |
| Process Documents | 5 | P1-P5 |
| **TOTAAL** | **29** | |

### Deliverable Status

| Code | Naam | Status | Dependencies |
|------|------|--------|--------------|
| D1 | Foundation Module | Pending | - |
| D2 | Gantt Module | Pending | D1 |
| D3 | Calendar Module | Pending | D1 |
| D4 | TaskBoard Module | Pending | D1 |
| D5 | Grid Module | Pending | D1 |
| D6 | Dashboard Module | Pending | D1, D2-D5 |
| D7 | Workspace Module | Pending | D1 |
| D8 | Auth/RBAC Module | Pending | D1, D11 |
| D9 | Vault Module | Pending | D1, D8 |
| D10 | Export Module | Pending | D1, D2-D5 |
| D11 | Database Schema | Pending | - |
| D12 | Auth Configuration | Pending | D11 |
| D13 | API Routes | Pending | D11, D12 |
| D14 | Deployment | Pending | D11-D13 |
| D15 | ARCHITECTURE.md | Pending | - |
| D16 | CONTRACTS.md | Pending | D15 |
| D17 | API-DOCS.md | Pending | D13 |
| M1 | O1 Samenwerking Board | Pending | - |
| M2 | O2 Unified View Board | Pending | - |
| M3 | O3-O4 Toegang Board | Pending | - |
| M4 | O5-O6 Security Board | Pending | - |
| M5 | O7 Export Board | Pending | - |
| M6 | O8 Visual Docs Board | Pending | M1-M5 |
| M7 | O9 Rollen Board | Pending | - |
| P1 | ROLLEN.md | Pending | - |
| P2 | PROCEDURES.md | Pending | P1 |
| P3 | GLOSSARY.md | Pending | - |
| P4 | TAXONOMY.md | Pending | P3 |
| P5 | ONBOARDING.md | Pending | P1, P2 |

---

# CODE MODULES (D1-D10)

---

## D1: Foundation Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Het fundament leggen voor alle Bryntum componenten door een gedeelde infrastructuur te bouwen die consistente styling, theming, data management en utilities biedt.

#### 1.2 Wat is dit wel?
- Bryntum licentie configuratie en initialisatie
- Gedeelde TypeScript types en interfaces
- ProjectModel als single source of truth
- CrudManager configuratie voor data sync
- Theme system (light/dark mode)
- Shared utilities en helpers
- Error boundary components
- Loading states en skeletons

#### 1.3 Wat is dit niet?
- Geen specifieke view implementaties (die komen in D2-D5)
- Geen business logic voor workspaces of projecten
- Geen authenticatie (zie D8)
- Geen database schema (zie D11)

#### 1.4 Premortem
- Bryntum licentie niet correct geconfigureerd → build failures
- TypeScript types niet strikt genoeg → runtime errors
- ProjectModel niet flexibel genoeg voor alle views
- Theme switching breekt component styling
- CrudManager sync conflicten bij concurrent edits

#### 1.5 Postmortem
- Validate Bryntum licentie tijdens CI/CD
- Unit tests voor alle type guards
- Integration tests voor ProjectModel CRUD
- Visual regression tests voor theming

### 2. Definition of Done
- [ ] Bryntum licentie gevalideerd en werkend
- [ ] Alle shared types gedefinieerd en geëxporteerd
- [ ] ProjectModel wrapper met TypeScript generics
- [ ] CrudManager configuratie met error handling
- [ ] Theme provider met light/dark support
- [ ] Minimaal 80% code coverage
- [ ] Geen TypeScript errors (strict mode)
- [ ] Performance baseline vastgelegd

### 3. RACI Matrix
| Activiteit | A1 (Architect) | B0 (Builder) | R0 (Reviewer) | T0 (Tester) |
|------------|----------------|--------------|---------------|-------------|
| Types ontwerpen | A | R | C | I |
| ProjectModel implementatie | C | R | A | I |
| CrudManager setup | C | R | A | I |
| Theme system | I | R | A | C |
| Unit tests schrijven | I | R | C | A |
| Code review | C | I | R | A |

### 4. Artefacts
```
src/
├── lib/
│   └── bryntum/
│       ├── license.ts           # Licentie configuratie
│       ├── config.ts            # Globale Bryntum config
│       └── index.ts             # Barrel export
├── types/
│   ├── bryntum.d.ts            # Bryntum type augmentations
│   ├── project.ts              # Project & Task types
│   ├── resource.ts             # Resource types
│   ├── calendar.ts             # Calendar types
│   └── index.ts                # Barrel export
├── models/
│   ├── ProjectModel.ts         # Extended ProjectModel
│   ├── TaskModel.ts            # Extended TaskModel
│   ├── ResourceModel.ts        # Extended ResourceModel
│   └── index.ts
├── services/
│   ├── CrudManager.ts          # Configured CrudManager
│   ├── SyncService.ts          # Sync orchestration
│   └── index.ts
├── providers/
│   ├── BryntumProvider.tsx     # Context provider
│   ├── ThemeProvider.tsx       # Theme context
│   └── index.ts
├── hooks/
│   ├── useProject.ts           # Project data hook
│   ├── useTheme.ts             # Theme hook
│   └── index.ts
├── components/
│   └── shared/
│       ├── ErrorBoundary.tsx
│       ├── LoadingState.tsx
│       ├── Skeleton.tsx
│       └── index.ts
└── styles/
    ├── bryntum-theme.css       # Custom theme overrides
    ├── variables.css           # CSS custom properties
    └── index.css
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O1: Gestandaardiseerde Samenwerking
- O2: Unified Project View

#### 5.2 Parents
- KR2.1-2.7: ProjectModel requirements
- KR2.22-2.28: Styling requirements

#### 5.3 Children
- D2: Gantt Module
- D3: Calendar Module
- D4: TaskBoard Module
- D5: Grid Module
- D6: Dashboard Module

#### 5.4 Grandchildren
- Alle view-specifieke componenten
- Alle feature modules

---

## D2: Gantt Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van een volledig functionele Gantt chart view met alle projectmanagement features, geïntegreerd met de shared ProjectModel.

#### 1.2 Wat is dit wel?
- BryntumGantt React wrapper component
- Gantt-specifieke toolbar (zoom, filters, critical path)
- Task editing (inline en popup)
- Dependency management (FS, FF, SS, SF)
- Resource assignment panel
- Baseline vergelijking
- Timeline navigatie en zoom
- Column configuratie en persistentie

#### 1.3 Wat is dit niet?
- Geen standalone data management (gebruikt D1)
- Geen multi-project view (zie D6)
- Geen resource capacity planning (zie D3/Grid)
- Geen print/export (zie D10)

#### 1.4 Premortem
- Gantt performance issues bij 1000+ taken
- Dependency cycles niet gedetecteerd
- Critical path berekening incorrect
- Baseline diff niet zichtbaar bij veel wijzigingen
- Column state niet bewaard na refresh

#### 1.5 Postmortem
- Performance tests met realistische datasets
- Dependency validation voor save
- Critical path unit tests
- E2E tests voor baseline flows
- LocalStorage voor column preferences

### 2. Definition of Done
- [ ] BryntumGantt component geïntegreerd
- [ ] Toolbar met alle zoom levels
- [ ] Task CRUD volledig werkend
- [ ] Dependencies visueel en functioneel
- [ ] Resource assignments werkend
- [ ] Baseline toggle en vergelijking
- [ ] Column drag/resize persistent
- [ ] Performance < 3s initial load (1000 tasks)
- [ ] Keyboard navigatie werkend

### 3. RACI Matrix
| Activiteit | A1 | B1 (Builder-Gantt) | R1 (Reviewer) | T1 (Tester) |
|------------|----|--------------------|---------------|-------------|
| Component architectuur | A | R | C | I |
| Gantt implementatie | C | R | A | I |
| Toolbar features | I | R | A | C |
| Dependency logic | C | R | A | I |
| Unit tests | I | R | C | A |
| Integration tests | I | C | C | R |

### 4. Artefacts
```
src/
├── features/
│   └── gantt/
│       ├── components/
│       │   ├── GanttChart.tsx        # Main Gantt wrapper
│       │   ├── GanttToolbar.tsx      # Toolbar component
│       │   ├── TaskEditor.tsx        # Task edit popup
│       │   ├── DependencyEditor.tsx  # Dependency popup
│       │   ├── ResourcePanel.tsx     # Resource assignment
│       │   ├── BaselinePanel.tsx     # Baseline comparison
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useGanttConfig.ts     # Gantt configuration
│       │   ├── useGanttFeatures.ts   # Feature toggles
│       │   ├── useColumnState.ts     # Column persistence
│       │   └── index.ts
│       ├── config/
│       │   ├── columns.ts            # Column definitions
│       │   ├── features.ts           # Feature config
│       │   ├── toolbar.ts            # Toolbar items
│       │   └── index.ts
│       ├── utils/
│       │   ├── criticalPath.ts       # Critical path helpers
│       │   ├── dependencies.ts       # Dependency validation
│       │   └── index.ts
│       └── index.ts                  # Public API
└── app/
    └── (dashboard)/
        └── [workspaceId]/
            └── [projectId]/
                └── gantt/
                    └── page.tsx      # Gantt route
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O2: Unified Project View

#### 5.2 Parents
- D1: Foundation Module
- KR2.8-2.14: Gantt requirements

#### 5.3 Children
- D6: Dashboard Module (gebruikt Gantt)
- D10: Export Module (exporteert Gantt)

#### 5.4 Grandchildren
- Print layouts
- PDF export templates

---

## D3: Calendar Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van een kalender view die taken en resources in tijd weergeeft, met ondersteuning voor meerdere view modes (dag, week, maand).

#### 1.2 Wat is dit wel?
- BryntumCalendar React wrapper
- Dag/Week/Maand view modes
- Resource calendar sidebar
- Event drag & drop scheduling
- Recurring events ondersteuning
- Working time highlighting
- Event filtering en zoeken
- Calendar overlay (meerdere calendars)

#### 1.3 Wat is dit niet?
- Geen externe calendar sync (Google, Outlook)
- Geen time tracking
- Geen availability management UI
- Geen meeting scheduling

#### 1.4 Premortem
- Calendar sync issues met ProjectModel
- Recurring events performance probleem
- Timezone issues bij display
- Resource calendar filter complex
- Event overlap niet duidelijk zichtbaar

#### 1.5 Postmortem
- Bidirectionele sync tests
- Performance test recurring events
- Timezone unit tests
- UX review voor overlapping events

### 2. Definition of Done
- [ ] BryntumCalendar geïntegreerd
- [ ] Alle 3 view modes werkend
- [ ] Event CRUD volledig
- [ ] Drag & drop scheduling
- [ ] Resource filtering
- [ ] Working time correct
- [ ] Sync met ProjectModel verified
- [ ] Responsive op tablet

### 3. RACI Matrix
| Activiteit | A1 | B2 (Builder-Calendar) | R2 (Reviewer) | T2 (Tester) |
|------------|----|-----------------------|---------------|-------------|
| Component architectuur | A | R | C | I |
| Calendar implementatie | C | R | A | I |
| View modes | I | R | A | C |
| Resource integration | C | R | A | I |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── calendar/
│       ├── components/
│       │   ├── CalendarView.tsx      # Main Calendar wrapper
│       │   ├── CalendarToolbar.tsx   # View mode switcher
│       │   ├── EventEditor.tsx       # Event edit popup
│       │   ├── ResourceSidebar.tsx   # Resource calendars
│       │   ├── MiniCalendar.tsx      # Date navigation
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useCalendarConfig.ts
│       │   ├── useCalendarSync.ts    # ProjectModel sync
│       │   ├── useViewMode.ts
│       │   └── index.ts
│       ├── config/
│       │   ├── modes.ts              # View mode configs
│       │   ├── features.ts
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        └── [workspaceId]/
            └── [projectId]/
                └── calendar/
                    └── page.tsx
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O2: Unified Project View

#### 5.2 Parents
- D1: Foundation Module
- KR2.15-2.21: Calendar requirements

#### 5.3 Children
- D6: Dashboard Module
- D10: Export Module

#### 5.4 Grandchildren
- iCal export feature

---

## D4: TaskBoard Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van een Kanban-style TaskBoard voor visueel taakbeheer met drag & drop, swimlanes en WIP limits.

#### 1.2 Wat is dit wel?
- BryntumTaskBoard React wrapper
- Configureerbare kolommen (statussen)
- Swimlanes (per resource, prioriteit, etc.)
- WIP (Work In Progress) limits
- Task cards met aanpasbare velden
- Drag & drop tussen kolommen
- Quick add task functionaliteit
- Filtering en zoeken

#### 1.3 Wat is dit niet?
- Geen sprint planning (future feature)
- Geen burndown charts
- Geen velocity tracking
- Geen standalone Kanban (altijd project-linked)

#### 1.4 Premortem
- WIP limit enforcement onduidelijk
- Swimlane performance bij veel resources
- Task card te vol met informatie
- Drag & drop conflicts met touch
- Status mapping naar Gantt incorrect

#### 1.5 Postmortem
- Visual feedback voor WIP violations
- Virtualization voor swimlanes
- Card density options (compact/normal/expanded)
- Touch gesture tests

### 2. Definition of Done
- [ ] BryntumTaskBoard geïntegreerd
- [ ] Kolommen CRUD werkend
- [ ] Swimlanes configureerbaar
- [ ] WIP limits met visuele feedback
- [ ] Drag & drop smooth (60fps)
- [ ] Quick add task
- [ ] Sync met ProjectModel
- [ ] Touch support verified

### 3. RACI Matrix
| Activiteit | A1 | B3 (Builder-TaskBoard) | R3 (Reviewer) | T3 (Tester) |
|------------|----|-----------------------|---------------|-------------|
| Component architectuur | A | R | C | I |
| TaskBoard implementatie | C | R | A | I |
| Swimlane logic | C | R | A | I |
| WIP enforcement | I | R | A | C |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── taskboard/
│       ├── components/
│       │   ├── TaskBoard.tsx         # Main TaskBoard wrapper
│       │   ├── TaskBoardToolbar.tsx
│       │   ├── TaskColumn.tsx        # Column component
│       │   ├── TaskCard.tsx          # Card component
│       │   ├── TaskCardEditor.tsx    # Card edit popup
│       │   ├── SwimlaneHeader.tsx
│       │   ├── QuickAddTask.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useTaskBoardConfig.ts
│       │   ├── useColumnState.ts
│       │   ├── useSwimlanes.ts
│       │   ├── useWipLimits.ts
│       │   └── index.ts
│       ├── config/
│       │   ├── columns.ts            # Default columns
│       │   ├── swimlanes.ts          # Swimlane options
│       │   ├── cardFields.ts         # Card field config
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        └── [workspaceId]/
            └── [projectId]/
                └── taskboard/
                    └── page.tsx
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O2: Unified Project View

#### 5.2 Parents
- D1: Foundation Module
- KR2.29-2.35: TaskBoard requirements

#### 5.3 Children
- D6: Dashboard Module
- D9: Vault Module (Vault TaskBoard)

#### 5.4 Grandchildren
- Vault processing workflow

---

## D5: Grid Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van een krachtige data grid voor tabulaire weergave van taken en resources met geavanceerde filtering, sortering en groupering.

#### 1.2 Wat is dit wel?
- BryntumGrid React wrapper
- Configureerbare kolommen
- Multi-level sortering
- Geavanceerde filtering
- Groupering met aggregaties
- Inline editing
- Column reordering en resizing
- Export naar CSV/Excel
- Row selection (single/multi)

#### 1.3 Wat is dit niet?
- Geen spreadsheet functionaliteit
- Geen pivot tables
- Geen formule ondersteuning
- Geen cross-project data

#### 1.4 Premortem
- Grid traag bij 10.000+ rows
- Filter combinaties complex voor users
- Grouping levels te diep
- Export verliest formatting
- Column state niet persistent

#### 1.5 Postmortem
- Virtual scrolling valideren
- Filter builder UX review
- Max 3 grouping levels
- Export preview toevoegen

### 2. Definition of Done
- [ ] BryntumGrid geïntegreerd
- [ ] Alle CRUD operaties werkend
- [ ] Filter builder volledig
- [ ] Sortering multi-column
- [ ] Groupering met collapse
- [ ] Export CSV/Excel
- [ ] Virtual scrolling werkend
- [ ] Column state persistent

### 3. RACI Matrix
| Activiteit | A1 | B1 (Builder) | R1 (Reviewer) | T1 (Tester) |
|------------|----|-----------------------|---------------|-------------|
| Component architectuur | A | R | C | I |
| Grid implementatie | C | R | A | I |
| Filter system | C | R | A | I |
| Export feature | I | R | A | C |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── grid/
│       ├── components/
│       │   ├── DataGrid.tsx          # Main Grid wrapper
│       │   ├── GridToolbar.tsx
│       │   ├── FilterBuilder.tsx     # Advanced filter UI
│       │   ├── ColumnPicker.tsx      # Column visibility
│       │   ├── GroupHeader.tsx       # Group row
│       │   ├── CellEditor.tsx        # Inline edit
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useGridConfig.ts
│       │   ├── useGridState.ts       # Sort, filter, group state
│       │   ├── useExport.ts
│       │   └── index.ts
│       ├── config/
│       │   ├── columns.ts
│       │   ├── filters.ts
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        └── [workspaceId]/
            └── [projectId]/
                └── grid/
                    └── page.tsx
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O2: Unified Project View

#### 5.2 Parents
- D1: Foundation Module
- KR2.36-2.42: Grid requirements

#### 5.3 Children
- D6: Dashboard Module
- D10: Export Module

#### 5.4 Grandchildren
- Report generation features

---

## D6: Dashboard Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Creëren van een unified dashboard dat alle views (Gantt, Calendar, TaskBoard, Grid) combineert met project switching en workspace navigation.

#### 1.2 Wat is dit wel?
- Unified layout met sidebar navigation
- View switcher (tabs of dropdown)
- Project selector binnen workspace
- Breadcrumb navigation
- Quick actions panel
- Recent projects/items
- Notification center
- User preferences panel

#### 1.3 Wat is dit niet?
- Geen analytics dashboard (future feature)
- Geen cross-project reporting
- Geen home page (is workspace list)
- Geen admin dashboard (zie D8)

#### 1.4 Premortem
- View switching te traag
- Navigation confusing voor nieuwe users
- Quick actions niet ontdekt
- Recent items niet nuttig
- State verloren bij view switch

#### 1.5 Postmortem
- View prefetching implementeren
- Navigation user testing
- Onboarding tooltips
- Meaningful recent items algoritme
- Strict state management

### 2. Definition of Done
- [ ] Unified layout component
- [ ] Sidebar met workspace/project nav
- [ ] View tabs werkend
- [ ] Project switcher smooth
- [ ] Breadcrumbs correct
- [ ] Quick actions panel
- [ ] Recent items tracked
- [ ] Preferences persistent
- [ ] Mobile responsive sidebar

### 3. RACI Matrix
| Activiteit | A1 | B4 (Builder-Dashboard) | R4 (Reviewer) | T4 (Tester) |
|------------|----|-----------------------|---------------|-------------|
| Layout architectuur | A | R | C | I |
| Navigation implementatie | C | R | A | I |
| View integration | C | R | A | I |
| State management | A | R | C | I |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardLayout.tsx   # Main layout
│       │   ├── Sidebar.tsx           # Navigation sidebar
│       │   ├── WorkspaceNav.tsx      # Workspace list
│       │   ├── ProjectNav.tsx        # Project list
│       │   ├── ViewSwitcher.tsx      # Tab/dropdown
│       │   ├── Breadcrumbs.tsx
│       │   ├── QuickActions.tsx
│       │   ├── RecentItems.tsx
│       │   ├── NotificationCenter.tsx
│       │   ├── UserMenu.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useNavigation.ts
│       │   ├── useRecentItems.ts
│       │   ├── useQuickActions.ts
│       │   └── index.ts
│       ├── context/
│       │   ├── DashboardContext.tsx
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        ├── layout.tsx                # Dashboard layout
        └── [workspaceId]/
            ├── layout.tsx            # Workspace layout
            └── [projectId]/
                ├── layout.tsx        # Project layout
                ├── page.tsx          # Default view
                ├── gantt/
                ├── calendar/
                ├── taskboard/
                └── grid/
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O2: Unified Project View
- O1: Gestandaardiseerde Samenwerking

#### 5.2 Parents
- D1: Foundation Module
- D2-D5: View Modules
- KR2.43-2.49: Dashboard requirements

#### 5.3 Children
- D7: Workspace Module (workspace pages)
- Alle view pages

#### 5.4 Grandchildren
- User onboarding flows
- Help system integration

---

## D7: Workspace Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van workspace management met ondersteuning voor afdelingsworkspaces en tijdelijke klantworkspaces.

#### 1.2 Wat is dit wel?
- Workspace CRUD operaties
- Workspace type management (Afdeling, Klant)
- Member management (invite, remove, roles)
- Workspace settings panel
- Project creation binnen workspace
- Workspace dashboard/overview
- Activity feed per workspace

#### 1.3 Wat is dit niet?
- Geen cross-workspace features
- Geen workspace templates
- Geen workspace archiving (delete only)
- Geen billing/subscription

#### 1.4 Premortem
- Workspace type wijzigen na creatie problematisch
- Member invite flow confusing
- Settings te verspreid
- Activity feed te noisy
- Klant workspace niet goed geïsoleerd

#### 1.5 Postmortem
- Immutable workspace type na creatie
- Invite preview en confirmation
- Settings in logical groups
- Activity filtering options
- RLS audit voor klant isolation

### 2. Definition of Done
- [ ] Workspace CRUD API en UI
- [ ] Type selection bij creatie
- [ ] Member invite via email
- [ ] Role assignment werkend
- [ ] Settings panel compleet
- [ ] Project creation in workspace
- [ ] Activity feed met filtering
- [ ] RLS isolation verified

### 3. RACI Matrix
| Activiteit | A1 | B0/B4 (Builders) | R0/R4 (Reviewers) | T0/T4 (Testers) |
|------------|----|-----------------------|-------------------|-----------------|
| Workspace architecture | A | R | C | I |
| API implementatie | C | R | A | I |
| UI implementatie | C | R | A | I |
| Member management | C | R | A | I |
| RLS policies | A | R | C | I |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── workspace/
│       ├── components/
│       │   ├── WorkspaceList.tsx     # All workspaces
│       │   ├── WorkspaceCard.tsx     # Workspace preview
│       │   ├── WorkspaceCreate.tsx   # Create dialog
│       │   ├── WorkspaceSettings.tsx # Settings panel
│       │   ├── MemberList.tsx        # Member management
│       │   ├── MemberInvite.tsx      # Invite dialog
│       │   ├── ProjectList.tsx       # Projects in workspace
│       │   ├── ActivityFeed.tsx      # Workspace activity
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useWorkspace.ts
│       │   ├── useWorkspaces.ts
│       │   ├── useMembers.ts
│       │   ├── useInvites.ts
│       │   └── index.ts
│       ├── api/
│       │   ├── workspaces.ts         # API calls
│       │   ├── members.ts
│       │   ├── invites.ts
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        ├── workspaces/
        │   └── page.tsx              # Workspace list
        └── [workspaceId]/
            ├── page.tsx              # Workspace overview
            └── settings/
                └── page.tsx          # Workspace settings
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O3: Afdelingsscheiding
- O4: Veilige Klantsamenwerking

#### 5.2 Parents
- D1: Foundation Module
- D8: Auth/RBAC Module
- KR3.1-3.9: Afdelingsscheiding
- KR4.1-4.11: Klantsamenwerking

#### 5.3 Children
- Alle project pages
- D9: Vault Module (voor klant workspaces)

#### 5.4 Grandchildren
- Klant onboarding flow
- Workspace analytics (future)

---

## D8: Auth/RBAC Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van authenticatie en role-based access control met ondersteuning voor 5 rollen en workspace-scoped permissions.

#### 1.2 Wat is dit wel?
- Supabase Auth integratie
- Login/logout flows
- Role definitions (Admin, Vault Medewerker, Medewerker, Klant Editor, Klant Viewer)
- Permission guards (UI en API)
- Workspace-scoped role assignment
- Session management
- Password reset flow
- Invite acceptance flow

#### 1.3 Wat is dit niet?
- Geen SSO/OAuth (tenzij via Supabase)
- Geen 2FA (Supabase limitation)
- Geen audit logging (separate concern)
- Geen IP whitelisting

#### 1.4 Premortem
- Permission checks inconsistent (UI vs API)
- Role escalation vulnerability
- Session niet correct geïnvalideerd
- Invite tokens te lang geldig
- Klant kan buiten workspace zien

#### 1.5 Postmortem
- Centralized permission checker
- Security audit voor role logic
- Session timeout tests
- Invite expiration (24h)
- RLS audit voor klant isolation

### 2. Definition of Done
- [ ] Supabase Auth geconfigureerd
- [ ] Login/logout werkend
- [ ] Alle 5 rollen gedefinieerd
- [ ] Permission guards in UI
- [ ] Permission checks in API
- [ ] Role assignment per workspace
- [ ] Password reset flow
- [ ] Invite flow compleet
- [ ] Security audit passed

### 3. RACI Matrix
| Activiteit | A1 | B0 (Builder) | R0 (Reviewer) | Security |
|------------|----|-----------------------|---------------|----------|
| Auth architecture | A | R | C | C |
| Role definitions | A | R | C | C |
| Permission system | A | R | C | C |
| UI guards | I | R | A | C |
| API guards | I | R | A | C |
| Security review | I | I | C | R |

### 4. Artefacts
```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── LogoutButton.tsx
│       │   ├── PasswordReset.tsx
│       │   ├── InviteAccept.tsx
│       │   ├── ProtectedRoute.tsx    # Route guard
│       │   ├── PermissionGate.tsx    # Component guard
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useAuth.ts            # Auth state
│       │   ├── useUser.ts            # Current user
│       │   ├── usePermissions.ts     # Permission checks
│       │   ├── useRole.ts            # Current role
│       │   └── index.ts
│       ├── guards/
│       │   ├── withAuth.tsx          # HOC guard
│       │   ├── requireRole.ts        # API middleware
│       │   ├── requirePermission.ts  # API middleware
│       │   └── index.ts
│       ├── config/
│       │   ├── roles.ts              # Role definitions
│       │   ├── permissions.ts        # Permission matrix
│       │   └── index.ts
│       ├── api/
│       │   ├── auth.ts
│       │   ├── roles.ts
│       │   └── index.ts
│       └── index.ts
├── lib/
│   └── supabase/
│       ├── client.ts                 # Browser client
│       ├── server.ts                 # Server client
│       ├── middleware.ts             # Auth middleware
│       └── index.ts
└── app/
    ├── (auth)/
    │   ├── login/
    │   │   └── page.tsx
    │   ├── reset-password/
    │   │   └── page.tsx
    │   └── invite/
    │       └── [token]/
    │           └── page.tsx
    └── api/
        └── auth/
            └── [...supabase]/
                └── route.ts
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O5: Toegangscontrole (RBAC)

#### 5.2 Parents
- D1: Foundation Module
- D11: Database Schema (roles table)
- KR5.1-5.20: RBAC requirements

#### 5.3 Children
- D7: Workspace Module (member roles)
- D9: Vault Module (Vault Medewerker role)
- Alle protected routes

#### 5.4 Grandchildren
- Audit logging (future)
- Activity tracking

---

## D9: Vault Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van het Vault systeem voor gecontroleerde dataverwerking van klantprojecten naar permanente opslag, met Kanban workflow en 30-dagen retentie.

#### 1.2 Wat is dit wel?
- Vault dashboard (alleen voor Vault Medewerkers)
- Kanban board (Input → Processing → Done)
- Item detail view met klantdata preview
- Data transformatie tools
- Export naar permanente opslag
- 30-dagen retentie countdown
- Audit trail per item
- Batch processing support

#### 1.3 Wat is dit niet?
- Geen automatische processing
- Geen AI/ML data transformatie
- Geen klant toegang tot Vault
- Geen direct database editing

#### 1.4 Premortem
- Data verloren voor 30 dagen voorbij
- Vault Medewerker ziet verkeerde items
- Processing status onduidelijk
- Export naar verkeerde locatie
- Audit trail incompleet

#### 1.5 Postmortem
- Automatische reminders voor expiring items
- Strict RLS voor Vault access
- Clear status indicators
- Export confirmation en preview
- Comprehensive audit logging

### 2. Definition of Done
- [ ] Vault dashboard alleen voor Vault Medewerkers
- [ ] Kanban met 3 kolommen werkend
- [ ] Item CRUD en status transitions
- [ ] Data preview werkend
- [ ] Export functionaliteit
- [ ] 30-dagen retentie enforced
- [ ] Audit trail compleet
- [ ] RLS policies verified

### 3. RACI Matrix
| Activiteit | A1 | B0/B3 (Builders) | R0/R3 (Reviewers) | Vault Medewerker |
|------------|----|-----------------------|-------------------|------------------|
| Vault architecture | A | R | C | I |
| Kanban implementatie | C | R | A | I |
| Processing workflow | A | R | C | C |
| Export feature | C | R | A | C |
| RLS policies | A | R | C | I |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── vault/
│       ├── components/
│       │   ├── VaultDashboard.tsx    # Main dashboard
│       │   ├── VaultKanban.tsx       # TaskBoard instance
│       │   ├── VaultItemCard.tsx     # Item card
│       │   ├── VaultItemDetail.tsx   # Detail view
│       │   ├── DataPreview.tsx       # Client data preview
│       │   ├── ProcessingTools.tsx   # Transform tools
│       │   ├── ExportDialog.tsx      # Export to permanent
│       │   ├── RetentionBadge.tsx    # Days remaining
│       │   ├── AuditTrail.tsx        # Item history
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useVaultItems.ts
│       │   ├── useVaultItem.ts
│       │   ├── useProcessing.ts
│       │   ├── useExport.ts
│       │   └── index.ts
│       ├── api/
│       │   ├── vault.ts
│       │   ├── processing.ts
│       │   ├── export.ts
│       │   └── index.ts
│       ├── utils/
│       │   ├── retention.ts          # Retention calculations
│       │   ├── transforms.ts         # Data transforms
│       │   └── index.ts
│       └── index.ts
└── app/
    └── (dashboard)/
        └── vault/
            ├── page.tsx              # Vault dashboard
            └── [itemId]/
                └── page.tsx          # Item detail
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O6: Gecontroleerde Dataverwerking (Vault)

#### 5.2 Parents
- D1: Foundation Module
- D4: TaskBoard Module (Kanban base)
- D8: Auth/RBAC Module
- KR6.1-6.19: Vault requirements

#### 5.3 Children
- Export logs
- Audit reports

#### 5.4 Grandchildren
- Compliance reports
- Data lineage tracking

---

## D10: Export Module

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van export functionaliteit voor projectdata naar verschillende formaten met ondersteuning voor alle views en configureerbare opties.

#### 1.2 Wat is dit wel?
- Export naar PDF (Gantt, Calendar)
- Export naar Excel/CSV (Grid, Tasks)
- Export naar PNG/SVG (Charts)
- Export configuratie (columns, date range, filters)
- Export preview
- Scheduled exports
- Export history/logging

#### 1.3 Wat is dit niet?
- Geen import functionaliteit
- Geen real-time sync naar externe systemen
- Geen email delivery (manual download)
- Geen template designer

#### 1.4 Premortem
- PDF layout breekt bij veel data
- Excel formulas niet correct
- Export timeout bij grote projecten
- Preview niet representatief
- Export logs verloren

#### 1.5 Postmortem
- Pagination in PDF exports
- Excel export unit tests
- Background job voor grote exports
- Accurate preview rendering
- Persistent export logs

### 2. Definition of Done
- [ ] PDF export voor Gantt en Calendar
- [ ] Excel/CSV export voor Grid
- [ ] PNG export voor views
- [ ] Configuratie opties werkend
- [ ] Preview accurate
- [ ] Large dataset handling
- [ ] Export logging compleet
- [ ] Download reliable

### 3. RACI Matrix
| Activiteit | A1 | B1/B4 (Builders) | R1/R4 (Reviewers) | T1/T4 (Testers) |
|------------|----|-----------------------|-------------------|-----------------|
| Export architecture | A | R | C | I |
| PDF export | C | R | A | I |
| Excel export | C | R | A | I |
| Preview feature | I | R | A | C |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/
├── features/
│   └── export/
│       ├── components/
│       │   ├── ExportButton.tsx      # Trigger button
│       │   ├── ExportDialog.tsx      # Config dialog
│       │   ├── ExportPreview.tsx     # Preview panel
│       │   ├── ExportProgress.tsx    # Progress indicator
│       │   ├── ExportHistory.tsx     # Past exports
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useExport.ts
│       │   ├── useExportConfig.ts
│       │   ├── useExportHistory.ts
│       │   └── index.ts
│       ├── exporters/
│       │   ├── pdf.ts                # PDF generation
│       │   ├── excel.ts              # Excel generation
│       │   ├── csv.ts                # CSV generation
│       │   ├── image.ts              # PNG/SVG export
│       │   └── index.ts
│       ├── config/
│       │   ├── formats.ts            # Format definitions
│       │   ├── templates.ts          # Export templates
│       │   └── index.ts
│       ├── api/
│       │   ├── export.ts
│       │   └── index.ts
│       └── index.ts
└── app/
    └── api/
        └── export/
            ├── pdf/
            │   └── route.ts
            ├── excel/
            │   └── route.ts
            └── image/
                └── route.ts
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O7: Data Export

#### 5.2 Parents
- D1: Foundation Module
- D2-D5: View Modules (exportable views)
- KR7.1-7.12: Export requirements

#### 5.3 Children
- Export templates
- Scheduled export jobs

#### 5.4 Grandchildren
- Report generation
- Data archiving

---

# INFRASTRUCTURE (D11-D14)

---

## D11: Database Schema

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Ontwerpen en implementeren van het complete database schema in Supabase PostgreSQL, inclusief RLS policies voor alle tabellen.

#### 1.2 Wat is dit wel?
- Alle tabellen voor workspaces, projects, tasks, resources
- Foreign key relaties en constraints
- Row Level Security policies per tabel
- Indexes voor performance
- Triggers voor updated_at en audit
- Seed data voor development

#### 1.3 Wat is dit niet?
- Geen stored procedures (business logic in app)
- Geen views (queries in app)
- Geen materialized views
- Geen database functions (behalve triggers)

#### 1.4 Premortem
- RLS policies te restrictief/permissief
- Missing indexes voor common queries
- Foreign key violations bij deletes
- Seed data inconsistent
- Migration order problemen

#### 1.5 Postmortem
- RLS policy unit tests
- Query performance profiling
- Cascade delete strategy
- Idempotent seed scripts
- Migration dependency graph

### 2. Definition of Done
- [ ] Alle tabellen gedefinieerd
- [ ] FK relaties correct
- [ ] RLS policies voor elke tabel
- [ ] Indexes voor elke FK en common filter
- [ ] Triggers voor timestamps
- [ ] Seed data voor alle tables
- [ ] Migrations versioned
- [ ] Performance baseline vastgelegd

### 3. RACI Matrix
| Activiteit | A1 | B0 (Builder) | DBA | Security |
|------------|----|-----------------------|-----|----------|
| Schema design | A | R | C | I |
| RLS policies | A | R | C | R |
| Indexes | C | R | A | I |
| Migrations | I | R | A | I |
| Security review | I | I | C | R |

### 4. Artefacts
```
supabase/
├── migrations/
│   ├── 00001_create_profiles.sql
│   ├── 00002_create_workspaces.sql
│   ├── 00003_create_workspace_members.sql
│   ├── 00004_create_workspace_invites.sql
│   ├── 00005_create_projects.sql
│   ├── 00006_create_tasks.sql
│   ├── 00007_create_dependencies.sql
│   ├── 00008_create_resources.sql
│   ├── 00009_create_assignments.sql
│   ├── 00010_create_calendars.sql
│   ├── 00011_create_calendar_events.sql
│   ├── 00012_create_baselines.sql
│   ├── 00013_create_taskboard_columns.sql
│   ├── 00014_create_vault_items.sql
│   ├── 00015_create_export_logs.sql
│   ├── 00016_create_user_preferences.sql
│   ├── 00017_create_rls_policies.sql
│   └── 00018_create_indexes.sql
├── seed/
│   ├── 01_profiles.sql
│   ├── 02_workspaces.sql
│   ├── 03_projects.sql
│   └── 04_tasks.sql
└── types/
    └── database.types.ts            # Generated types
```

**Schema Overview:**
```sql
-- Core tables
profiles (id, email, full_name, avatar_url, created_at, updated_at)
workspaces (id, name, type, settings, created_by, created_at, updated_at)
workspace_members (workspace_id, user_id, role, joined_at)
workspace_invites (id, workspace_id, email, role, token, expires_at, created_at)

-- Project tables
projects (id, workspace_id, name, description, start_date, end_date, settings, created_at, updated_at)
tasks (id, project_id, parent_id, name, start_date, end_date, duration, percent_done, status, priority, created_at, updated_at)
dependencies (id, from_task_id, to_task_id, type, lag, created_at)
resources (id, workspace_id, name, type, calendar_id, created_at, updated_at)
assignments (id, task_id, resource_id, units, created_at)
calendars (id, workspace_id, name, is_default, created_at, updated_at)
calendar_events (id, calendar_id, name, start_date, end_date, is_working, recurrence_rule)
baselines (id, project_id, name, data, created_at)

-- Feature tables
taskboard_columns (id, workspace_id, name, order, wip_limit, created_at)
vault_items (id, source_workspace_id, data, status, expires_at, processed_by, created_at, updated_at)
export_logs (id, user_id, project_id, format, config, file_url, created_at)
user_preferences (user_id, preferences, updated_at)
```

### 5. Gerelateerd

#### 5.1 Grandparents
- Alle Outcomes (data storage)

#### 5.2 Parents
- P4: TAXONOMY.md (entity definitions)
- D15: ARCHITECTURE.md

#### 5.3 Children
- D8: Auth/RBAC Module (uses profiles, roles)
- D1-D10: All code modules

#### 5.4 Grandchildren
- API routes
- Supabase client calls

---

## D12: Auth Configuration

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Configureren van Supabase Auth met email/password authenticatie, email templates en security settings.

#### 1.2 Wat is dit wel?
- Supabase Auth project configuratie
- Email provider setup
- Email templates (welcome, reset, invite)
- JWT configuration
- Session settings
- Redirect URLs configuratie
- Rate limiting settings

#### 1.3 Wat is dit niet?
- Geen OAuth providers (future)
- Geen 2FA (Supabase limitation)
- Geen custom auth flows
- Geen passwordless (magic link only backup)

#### 1.4 Premortem
- Email delivery failures
- JWT tokens te lang geldig
- Redirect URLs niet correct per environment
- Rate limiting te strict
- Session timeout te kort voor users

#### 1.5 Postmortem
- Email delivery monitoring
- JWT expiry testing
- Environment-specific URL config
- Rate limit tuning na launch
- Session UX testing

### 2. Definition of Done
- [ ] Supabase Auth enabled
- [ ] Email templates customized
- [ ] JWT settings configured
- [ ] Session timeout appropriate
- [ ] Redirect URLs per environment
- [ ] Rate limiting configured
- [ ] Password policy set
- [ ] Email delivery tested

### 3. RACI Matrix
| Activiteit | A1 | B0 (Builder) | DevOps | Security |
|------------|----|-----------------------|--------|----------|
| Auth config | A | R | C | C |
| Email templates | I | R | A | I |
| Security settings | A | R | C | R |
| Environment config | C | R | A | I |

### 4. Artefacts
```
supabase/
├── config.toml                      # Auth configuration
└── templates/
    ├── confirm_signup.html          # Welcome email
    ├── reset_password.html          # Password reset
    ├── magic_link.html              # Magic link (backup)
    └── invite.html                  # Workspace invite

.env.local                           # Local auth URLs
.env.production                      # Production auth URLs
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O5: Toegangscontrole (RBAC)

#### 5.2 Parents
- D11: Database Schema (profiles table)

#### 5.3 Children
- D8: Auth/RBAC Module

#### 5.4 Grandchildren
- Login/logout flows
- Password reset flow

---

## D13: API Routes

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Implementeren van alle Next.js API routes voor data operations, Bryntum CrudManager sync, en third-party integrations.

#### 1.2 Wat is dit wel?
- RESTful API routes voor alle entities
- CrudManager sync endpoint
- Export generation endpoints
- Webhook handlers
- Rate limiting per route
- Error handling en logging
- Request validation

#### 1.3 Wat is dit niet?
- Geen GraphQL
- Geen real-time subscriptions (Supabase handles)
- Geen API versioning (v1 implicit)
- Geen public API documentation (internal only)

#### 1.4 Premortem
- CrudManager sync conflicts
- Rate limiting blocks legitimate users
- Error messages expose internals
- Validation inconsistent
- Large payloads timeout

#### 1.5 Postmortem
- Conflict resolution strategy
- Rate limit monitoring
- Error message sanitization
- Shared validation schemas
- Payload size limits

### 2. Definition of Done
- [ ] All CRUD routes implemented
- [ ] CrudManager sync working
- [ ] Export routes working
- [ ] Rate limiting configured
- [ ] Error handling consistent
- [ ] Request validation complete
- [ ] API tests passing
- [ ] Performance acceptable

### 3. RACI Matrix
| Activiteit | A1 | Builders | Reviewers | Testers |
|------------|----|-----------------------|-----------|---------|
| Route design | A | R | C | I |
| Implementation | C | R | A | I |
| Validation | C | R | A | I |
| Tests | I | R | C | A |

### 4. Artefacts
```
src/app/api/
├── workspaces/
│   ├── route.ts                     # GET, POST workspaces
│   └── [id]/
│       ├── route.ts                 # GET, PUT, DELETE workspace
│       ├── members/
│       │   └── route.ts             # GET, POST members
│       └── invites/
│           └── route.ts             # POST invite
├── projects/
│   ├── route.ts                     # GET, POST projects
│   └── [id]/
│       ├── route.ts                 # GET, PUT, DELETE project
│       └── sync/
│           └── route.ts             # POST CrudManager sync
├── tasks/
│   └── route.ts                     # Bulk operations
├── resources/
│   └── route.ts                     # Resource operations
├── vault/
│   ├── route.ts                     # GET vault items
│   └── [id]/
│       ├── route.ts                 # Item operations
│       └── process/
│           └── route.ts             # Process item
├── export/
│   ├── pdf/
│   │   └── route.ts
│   ├── excel/
│   │   └── route.ts
│   └── image/
│       └── route.ts
└── sync/
    └── route.ts                     # Generic CrudManager endpoint
```

### 5. Gerelateerd

#### 5.1 Grandparents
- Alle Outcomes (data access)

#### 5.2 Parents
- D11: Database Schema
- D12: Auth Configuration

#### 5.3 Children
- D1-D10: All code modules (consume APIs)

#### 5.4 Grandchildren
- Frontend data fetching
- CrudManager integration

---

## D14: Deployment

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Configureren van Vercel deployment met environment management, CI/CD pipeline en monitoring.

#### 1.2 Wat is dit wel?
- Vercel project configuratie
- Environment variables management
- Preview deployments
- Production deployment
- Domain configuration
- Build optimizations
- Error monitoring (Vercel Analytics)
- Performance monitoring

#### 1.3 Wat is dit niet?
- Geen custom server (Vercel serverless)
- Geen Docker containers
- Geen multi-region deployment
- Geen custom CDN

#### 1.4 Premortem
- Environment variables niet correct
- Build failures niet gedetecteerd
- Preview URL niet werkend
- Domain SSL issues
- Performance regression niet opgemerkt

#### 1.5 Postmortem
- Env var validation script
- Build notification setup
- Preview URL testing
- SSL certificate monitoring
- Performance budgets

### 2. Definition of Done
- [ ] Vercel project created
- [ ] All env vars configured
- [ ] Preview deployments working
- [ ] Production domain configured
- [ ] SSL certificate valid
- [ ] Build pipeline passing
- [ ] Monitoring enabled
- [ ] Performance baseline met

### 3. RACI Matrix
| Activiteit | A1 | B0 (Builder) | DevOps | PM |
|------------|----|-----------------------|--------|-----|
| Vercel setup | C | R | A | I |
| Env config | C | R | A | I |
| Domain setup | I | C | R | A |
| Monitoring | C | R | A | I |

### 4. Artefacts
```
vercel.json                          # Vercel configuration
.env.example                         # Env var template
.env.local                           # Local development
.env.production                      # Production values (in Vercel)

# Vercel Dashboard Configuration
- Project settings
- Environment variables (dev, preview, production)
- Domain settings
- Analytics settings
- Build & Output settings
```

### 5. Gerelateerd

#### 5.1 Grandparents
- All Outcomes (production access)

#### 5.2 Parents
- D11-D13: All infrastructure

#### 5.3 Children
- Production environment
- Preview environments

#### 5.4 Grandchildren
- User access
- Monitoring alerts

---

# DOCUMENTATION (D15-D17)

---

## D15: ARCHITECTURE.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Documenteren van de complete technische architectuur van het systeem voor ontwikkelaars en onderhouders.

#### 1.2 Wat is dit wel?
- System overview en diagrams
- Component architectuur
- Data flow diagrams
- Technology stack beschrijving
- Security architecture
- Performance considerations
- Scalability approach
- Development guidelines

#### 1.3 Wat is dit niet?
- Geen user documentation
- Geen API reference (zie D17)
- Geen procedures (zie P2)
- Geen deployment guide

#### 1.4 Premortem
- Architectuur doc verouderd na wijzigingen
- Diagrams niet up-to-date
- Te technisch voor nieuwe developers
- Security details exposed publicly

#### 1.5 Postmortem
- Architecture decision records (ADRs)
- Automated diagram generation waar mogelijk
- Onboarding sectie voor nieuwe devs
- Security sectie in private repo

### 2. Definition of Done
- [ ] System overview compleet
- [ ] All major diagrams included
- [ ] Tech stack documented
- [ ] Security architecture beschreven
- [ ] Performance guidelines included
- [ ] Development setup guide
- [ ] Review door senior developers

### 3. RACI Matrix
| Activiteit | A1 | Senior Dev | Tech Writer | PM |
|------------|----|-----------------------|-------------|-----|
| Content schrijven | R | C | A | I |
| Diagrams maken | R | C | A | I |
| Review | C | R | A | I |
| Maintenance | R | C | A | I |

### 4. Artefacts
```
docs/
└── ARCHITECTURE.md
    ├── 1. Overview
    │   ├── 1.1 System Context
    │   ├── 1.2 High-Level Architecture
    │   └── 1.3 Key Design Decisions
    ├── 2. Technology Stack
    │   ├── 2.1 Frontend (Next.js, React, Bryntum)
    │   ├── 2.2 Backend (Supabase, PostgreSQL)
    │   ├── 2.3 Infrastructure (Vercel)
    │   └── 2.4 Development Tools
    ├── 3. Component Architecture
    │   ├── 3.1 Module Structure
    │   ├── 3.2 State Management
    │   ├── 3.3 Data Flow
    │   └── 3.4 Component Hierarchy
    ├── 4. Data Architecture
    │   ├── 4.1 Database Schema Overview
    │   ├── 4.2 Data Models
    │   ├── 4.3 Sync Strategy
    │   └── 4.4 Caching
    ├── 5. Security Architecture
    │   ├── 5.1 Authentication
    │   ├── 5.2 Authorization (RBAC)
    │   ├── 5.3 Data Protection
    │   └── 5.4 RLS Policies
    ├── 6. Performance
    │   ├── 6.1 Optimization Strategies
    │   ├── 6.2 Caching Layers
    │   └── 6.3 Performance Budgets
    ├── 7. Scalability
    │   ├── 7.1 Current Limits
    │   └── 7.2 Scaling Strategy
    └── 8. Development Guide
        ├── 8.1 Setup Instructions
        ├── 8.2 Coding Standards
        └── 8.3 Testing Strategy
```

### 5. Gerelateerd

#### 5.1 Grandparents
- All Outcomes

#### 5.2 Parents
- A1: Architect work
- All design decisions

#### 5.3 Children
- D16: CONTRACTS.md
- D17: API-DOCS.md
- Developer onboarding

#### 5.4 Grandchildren
- Code implementation
- Architecture reviews

---

## D16: CONTRACTS.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Definiëren van alle interfaces, data contracts en API schemas voor consistente communicatie tussen systeem componenten.

#### 1.2 Wat is dit wel?
- TypeScript interfaces voor alle entities
- API request/response schemas
- Event payload definitions
- State shape definitions
- Validation schemas (Zod)
- Error code definitions

#### 1.3 Wat is dit niet?
- Geen implementatie details
- Geen API endpoint documentation (zie D17)
- Geen database schema (zie D11)

#### 1.4 Premortem
- Contracts verouderen sneller dan code
- Breaking changes niet gedetecteerd
- Validation niet consistent met contracts
- Optional vs required onduidelijk

#### 1.5 Postmortem
- Generate contracts from TypeScript
- CI check voor contract violations
- Validation derived from contracts
- Clear nullability documentation

### 2. Definition of Done
- [ ] All entity interfaces defined
- [ ] All API schemas documented
- [ ] Validation schemas created
- [ ] Error codes catalogued
- [ ] Generated from source where possible
- [ ] Versioning strategy defined

### 3. RACI Matrix
| Activiteit | A1 | Builders | Tech Writer | QA |
|------------|----|-----------------------|-------------|-----|
| Interface design | R | C | A | I |
| Documentation | C | R | A | I |
| Validation | C | R | A | C |
| Review | R | C | A | C |

### 4. Artefacts
```
docs/
└── CONTRACTS.md
    ├── 1. Entity Interfaces
    │   ├── 1.1 Workspace
    │   ├── 1.2 Project
    │   ├── 1.3 Task
    │   ├── 1.4 Resource
    │   ├── 1.5 Calendar
    │   ├── 1.6 VaultItem
    │   └── 1.7 User/Profile
    ├── 2. API Contracts
    │   ├── 2.1 Request Schemas
    │   ├── 2.2 Response Schemas
    │   └── 2.3 Error Responses
    ├── 3. Event Payloads
    │   ├── 3.1 CrudManager Events
    │   ├── 3.2 Realtime Events
    │   └── 3.3 UI Events
    ├── 4. Validation Schemas
    │   ├── 4.1 Zod Schemas
    │   └── 4.2 Custom Validators
    └── 5. Error Codes
        ├── 5.1 Client Errors (4xx)
        └── 5.2 Server Errors (5xx)
```

### 5. Gerelateerd

#### 5.1 Grandparents
- All Outcomes

#### 5.2 Parents
- D15: ARCHITECTURE.md
- D11: Database Schema

#### 5.3 Children
- D17: API-DOCS.md
- All code implementations

#### 5.4 Grandchildren
- API validation
- Type checking

---

## D17: API-DOCS.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Documenteren van alle API endpoints met request/response voorbeelden, authenticatie requirements en error handling.

#### 1.2 Wat is dit wel?
- Complete endpoint reference
- Request/response examples
- Authentication requirements per endpoint
- Rate limiting information
- Error response documentation
- Code examples (curl, JavaScript)

#### 1.3 Wat is dit niet?
- Geen architectural overview (zie D15)
- Geen type definitions (zie D16)
- Geen public API (internal only)

#### 1.4 Premortem
- Docs niet gesyncet met implementatie
- Examples outdated
- Missing authentication details
- Error codes incomplete

#### 1.5 Postmortem
- Generate docs from route handlers
- Automated example validation
- Auth requirements in code annotations
- Error catalog maintenance

### 2. Definition of Done
- [ ] All endpoints documented
- [ ] Examples for each endpoint
- [ ] Auth requirements clear
- [ ] Rate limits documented
- [ ] Error responses listed
- [ ] Code examples working

### 3. RACI Matrix
| Activiteit | A1 | Builders | Tech Writer | QA |
|------------|----|-----------------------|-------------|-----|
| Content | C | R | A | I |
| Examples | I | R | A | C |
| Validation | I | R | C | A |
| Maintenance | C | R | A | I |

### 4. Artefacts
```
docs/
└── API-DOCS.md
    ├── 1. Overview
    │   ├── 1.1 Base URL
    │   ├── 1.2 Authentication
    │   ├── 1.3 Rate Limiting
    │   └── 1.4 Error Handling
    ├── 2. Workspaces
    │   ├── GET /api/workspaces
    │   ├── POST /api/workspaces
    │   ├── GET /api/workspaces/:id
    │   ├── PUT /api/workspaces/:id
    │   └── DELETE /api/workspaces/:id
    ├── 3. Projects
    │   ├── CRUD operations
    │   └── POST /api/projects/:id/sync
    ├── 4. Tasks
    │   └── Bulk operations
    ├── 5. Resources
    │   └── CRUD operations
    ├── 6. Vault
    │   ├── GET /api/vault
    │   ├── Vault item operations
    │   └── Processing endpoints
    ├── 7. Export
    │   ├── POST /api/export/pdf
    │   ├── POST /api/export/excel
    │   └── POST /api/export/image
    └── 8. Sync
        └── POST /api/sync (CrudManager)
```

### 5. Gerelateerd

#### 5.1 Grandparents
- All Outcomes

#### 5.2 Parents
- D13: API Routes
- D16: CONTRACTS.md

#### 5.3 Children
- Frontend API calls
- Integration testing

#### 5.4 Grandchildren
- Developer experience
- Debugging support

---

# MIRO BOARDS (M1-M7)

---

## M1: O1 Samenwerking Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 1 (Gestandaardiseerde Samenwerking) met alle gerelateerde KRs, flows en architectuur.

#### 1.2 Wat is dit wel?
- Visuele representatie van O1 KRs
- Workflow diagrammen voor samenwerking
- User journey maps
- Component wireframes
- Architecture beslissingen

#### 1.3 Wat is dit niet?
- Geen implementatie details
- Geen code voorbeelden
- Geen complete UI mockups

#### 1.4 Premortem
- Board te druk/onoverzichtelijk
- Frames niet logisch georganiseerd
- Links naar andere boards ontbreken
- Niet up-to-date met requirements

#### 1.5 Postmortem
- Frame templates gebruiken
- Clear naming convention
- Cross-board linking
- Regular sync met OUTCOMES.md

### 2. Definition of Done
- [ ] Alle O1 KRs visueel uitgewerkt
- [ ] Workflow diagrams compleet
- [ ] User journeys gedocumenteerd
- [ ] Links naar gerelateerde boards
- [ ] Review met stakeholders

### 3. RACI Matrix
| Activiteit | A1 | Designer | PM | Stakeholders |
|------------|----|-----------------------|-----|--------------|
| Content creatie | R | A | C | I |
| Visual design | C | R | A | I |
| Review | C | C | R | A |

### 4. Artefacts
```
Miro Board: O1-Samenwerking
├── Frame 1: KR Overview
│   └── KR1.1-1.7 cards
├── Frame 2: Collaboration Flows
│   ├── Project creation flow
│   ├── Task assignment flow
│   └── Status update flow
├── Frame 3: User Journeys
│   ├── Project Manager journey
│   └── Team Member journey
├── Frame 4: Component Wireframes
│   └── Key UI components
└── Frame 5: Architecture Decisions
    └── Collaboration patterns
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O1: Gestandaardiseerde Samenwerking
- KR8.1-8.9: Visual documentation requirements

#### 5.3 Children
- D1: Foundation Module (implements)
- D6: Dashboard Module (implements)

#### 5.4 Grandchildren
- UI implementation
- User testing

---

## M2: O2 Unified View Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 2 (Unified Project View) met alle Bryntum component wireframes, data flows en integratie architectuur.

#### 1.2 Wat is dit wel?
- Wireframes voor Gantt, Calendar, TaskBoard, Grid
- Data flow tussen views
- State synchronization diagrams
- Component interaction patterns
- Responsive layout designs

#### 1.3 Wat is dit niet?
- Geen pixel-perfect designs
- Geen Bryntum configuratie details
- Geen code

#### 1.4 Premortem
- Wireframes niet realistisch met Bryntum constraints
- Data flow te complex
- Responsive design niet uitvoerbaar
- Component interacties onduidelijk

#### 1.5 Postmortem
- Validate wireframes tegen Bryntum docs
- Simplify data flow waar mogelijk
- Mobile-first design review
- Interaction specification document

### 2. Definition of Done
- [ ] Wireframes voor alle 4 views
- [ ] Data flow diagrams compleet
- [ ] Sync architecture gedocumenteerd
- [ ] Responsive breakpoints gedefinieerd
- [ ] Review met development team

### 3. RACI Matrix
| Activiteit | A1 | Designer | Dev Team | PM |
|------------|----|-----------------------|----------|-----|
| Wireframes | R | A | C | I |
| Data flows | R | C | A | I |
| Responsive | C | R | A | I |
| Review | C | C | R | A |

### 4. Artefacts
```
Miro Board: O2-UnifiedView
├── Frame 1: KR Overview (KR2.1-2.74)
├── Frame 2: Gantt Wireframes
│   ├── Desktop layout
│   ├── Tablet layout
│   └── Feature details
├── Frame 3: Calendar Wireframes
│   ├── Day/Week/Month views
│   └── Resource sidebar
├── Frame 4: TaskBoard Wireframes
│   ├── Kanban layout
│   ├── Swimlanes
│   └── Card designs
├── Frame 5: Grid Wireframes
│   ├── Column configurations
│   └── Filter builder
├── Frame 6: Data Flow
│   ├── ProjectModel structure
│   ├── CrudManager flow
│   └── Real-time sync
└── Frame 7: View Switching
    └── State preservation
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O2: Unified Project View
- KR8.1-8.9: Visual documentation requirements

#### 5.3 Children
- D2-D5: View Modules
- D6: Dashboard Module

#### 5.4 Grandchildren
- Component implementation
- E2E testing

---

## M3: O3-O4 Toegang Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 3 (Afdelingsscheiding) en Outcome 4 (Veilige Klantsamenwerking) met workspace architectuur en access flows.

#### 1.2 Wat is dit wel?
- Workspace hiërarchie visualisatie
- Afdeling vs Klant workspace differences
- Member management flows
- Invite flows
- Data isolation diagrams

#### 1.3 Wat is dit niet?
- Geen RLS policy details
- Geen database schema
- Geen security implementation

#### 1.4 Premortem
- Workspace types verwarrend
- Isolation niet duidelijk
- Invite flow te complex
- Klant vs medewerker UX onduidelijk

#### 1.5 Postmortem
- Clear workspace type indicators
- Isolation testing scenarios
- Simplified invite flow
- Role-based UI variations

### 2. Definition of Done
- [ ] Workspace hiërarchie gedocumenteerd
- [ ] Type differences visueel duidelijk
- [ ] Member flows compleet
- [ ] Invite flows gedocumenteerd
- [ ] Isolation diagram reviewed

### 3. RACI Matrix
| Activiteit | A1 | Designer | Security | PM |
|------------|----|-----------------------|----------|-----|
| Architecture | R | C | A | I |
| Flows | C | R | A | I |
| Security review | C | I | R | A |

### 4. Artefacts
```
Miro Board: O3O4-Toegang
├── Frame 1: KR Overview (O3: 1-9, O4: 1-11)
├── Frame 2: Workspace Hierarchy
│   ├── Platform level
│   ├── Workspace types
│   └── Project level
├── Frame 3: Afdeling Workspace
│   ├── Features
│   ├── Member types
│   └── Data scope
├── Frame 4: Klant Workspace
│   ├── Temporary nature
│   ├── Limited features
│   └── Isolation requirements
├── Frame 5: Member Management
│   ├── Add member flow
│   ├── Role assignment
│   └── Remove member flow
├── Frame 6: Invite Flow
│   ├── Email invite
│   ├── Accept invite
│   └── Expired invite
└── Frame 7: Data Isolation
    └── RLS visual representation
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O3: Afdelingsscheiding
- O4: Veilige Klantsamenwerking

#### 5.3 Children
- D7: Workspace Module
- D8: Auth/RBAC Module

#### 5.4 Grandchildren
- RLS implementation
- Isolation testing

---

## M4: O5-O6 Security Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 5 (Toegangscontrole/RBAC) en Outcome 6 (Vault) met permission matrix en data processing flows.

#### 1.2 Wat is dit wel?
- Role permission matrix visualisatie
- Authentication flows
- Vault workflow (Input → Processing → Done)
- Data lifecycle diagrams
- Security boundaries

#### 1.3 Wat is dit niet?
- Geen implementation details
- Geen code
- Geen penetration test scenarios

#### 1.4 Premortem
- Permission matrix te complex
- Vault flow onduidelijk
- Security boundaries niet compleet
- Role overlap confusing

#### 1.5 Postmortem
- Simplified permission views
- Step-by-step Vault guide
- Complete boundary documentation
- Clear role differentiation

### 2. Definition of Done
- [ ] All 5 roles gedocumenteerd
- [ ] Permission matrix compleet
- [ ] Auth flows visueel
- [ ] Vault workflow duidelijk
- [ ] Security review passed

### 3. RACI Matrix
| Activiteit | A1 | Designer | Security | Vault Team |
|------------|----|-----------------------|----------|------------|
| RBAC design | R | C | A | I |
| Vault flow | R | C | I | A |
| Security review | C | I | R | C |

### 4. Artefacts
```
Miro Board: O5O6-Security
├── Frame 1: KR Overview (O5: 1-20, O6: 1-19)
├── Frame 2: Role Definitions
│   ├── Admin
│   ├── Vault Medewerker
│   ├── Medewerker
│   ├── Klant Editor
│   └── Klant Viewer
├── Frame 3: Permission Matrix
│   └── Feature × Role grid
├── Frame 4: Auth Flows
│   ├── Login
│   ├── Logout
│   ├── Password reset
│   └── Session management
├── Frame 5: Vault Workflow
│   ├── Input stage
│   ├── Processing stage
│   ├── Done stage
│   └── 30-day retention
├── Frame 6: Data Lifecycle
│   ├── Client data in
│   ├── Vault processing
│   └── Permanent storage
└── Frame 7: Security Boundaries
    └── Access control points
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O5: Toegangscontrole (RBAC)
- O6: Gecontroleerde Dataverwerking (Vault)

#### 5.3 Children
- D8: Auth/RBAC Module
- D9: Vault Module

#### 5.4 Grandchildren
- Permission implementation
- Vault UI

---

## M5: O7 Export Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 7 (Data Export) met export formats, configuration options en output previews.

#### 1.2 Wat is dit wel?
- Export format visualisaties
- Configuration UI wireframes
- Output preview mockups
- Export flow diagrams
- Format comparison

#### 1.3 Wat is dit niet?
- Geen file format specifications
- Geen generation code
- Geen template design tool

#### 1.4 Premortem
- Too many format options
- Configuration overwhelming
- Preview not accurate
- Export flow confusing

#### 1.5 Postmortem
- Prioritize common formats
- Progressive disclosure
- Preview accuracy validation
- Simplified flow

### 2. Definition of Done
- [ ] All export formats documented
- [ ] Configuration wireframes complete
- [ ] Preview mockups created
- [ ] Flow diagrams clear
- [ ] User testing feedback incorporated

### 3. RACI Matrix
| Activiteit | A1 | Designer | Dev | Users |
|------------|----|-----------------------|-----|-------|
| Format design | R | A | C | I |
| UI wireframes | C | R | A | I |
| User testing | I | C | I | R |

### 4. Artefacts
```
Miro Board: O7-Export
├── Frame 1: KR Overview (KR7.1-7.12)
├── Frame 2: Export Formats
│   ├── PDF (Gantt, Calendar)
│   ├── Excel/CSV (Grid)
│   └── Image (PNG, SVG)
├── Frame 3: Configuration UI
│   ├── Column selection
│   ├── Date range
│   ├── Filters
│   └── Styling options
├── Frame 4: Preview
│   ├── PDF preview
│   ├── Excel preview
│   └── Image preview
├── Frame 5: Export Flow
│   ├── Initiate export
│   ├── Configure
│   ├── Preview
│   └── Download
└── Frame 6: Format Comparison
    └── Feature matrix
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O7: Data Export

#### 5.3 Children
- D10: Export Module

#### 5.4 Grandchildren
- Export UI implementation
- Format testing

---

## M6: O8 Visual Docs Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Meta-board die de complete visuele documentatie structuur toont en alle boards verbindt.

#### 1.2 Wat is dit wel?
- Overview van alle Miro boards
- Navigation tussen boards
- Visual documentation standards
- Template library
- Style guide voor boards

#### 1.3 Wat is dit niet?
- Geen content duplicatie
- Geen implementatie details
- Geen standalone documentatie

#### 1.4 Premortem
- Meta-board wordt niet gebruikt
- Links broken
- Standards niet gevolgd
- Templates outdated

#### 1.5 Postmortem
- Regular link validation
- Template usage tracking
- Standards enforcement
- Quarterly review

### 2. Definition of Done
- [ ] All board links working
- [ ] Navigation clear
- [ ] Standards documented
- [ ] Templates available
- [ ] Style guide complete

### 3. RACI Matrix
| Activiteit | A1 | Designer | PM | All |
|------------|----|-----------------------|-----|-----|
| Structure | R | A | C | I |
| Templates | C | R | A | I |
| Maintenance | C | R | A | C |

### 4. Artefacts
```
Miro Board: O8-VisualDocs
├── Frame 1: Board Overview
│   ├── M1: Samenwerking
│   ├── M2: Unified View
│   ├── M3: Toegang
│   ├── M4: Security
│   ├── M5: Export
│   ├── M6: This board
│   └── M7: Rollen
├── Frame 2: Navigation Map
│   └── Board relationships
├── Frame 3: Standards
│   ├── Naming conventions
│   ├── Frame structure
│   └── Color coding
├── Frame 4: Templates
│   ├── KR overview template
│   ├── Flow diagram template
│   ├── Wireframe template
│   └── Decision template
└── Frame 5: Style Guide
    ├── Colors
    ├── Typography
    ├── Icons
    └── Connectors
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- KR8.20-8.29: Board standards

#### 5.3 Children
- M1-M5, M7: All other boards

#### 5.4 Grandchildren
- All visual artifacts

---

## M7: O9 Rollen Board

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Visueel uitwerken van Outcome 9 (Rollen & Procedures) met organizational charts, procedure flows en glossary/taxonomy visualisaties.

#### 1.2 Wat is dit wel?
- Organizational role charts
- Procedure flowcharts
- Glossary visual index
- Taxonomy hierarchy diagrams
- Onboarding journey maps

#### 1.3 Wat is dit niet?
- Geen HR documentation
- Geen full glossary content
- Geen complete procedures text

#### 1.4 Premortem
- Role chart too complex
- Procedure flows too detailed
- Glossary not findable
- Taxonomy confusing

#### 1.5 Postmortem
- Simplified role views
- High-level procedure flows
- Searchable glossary index
- Clear taxonomy levels

### 2. Definition of Done
- [ ] Role charts complete
- [ ] Procedure flows documented
- [ ] Glossary index created
- [ ] Taxonomy visualized
- [ ] Onboarding journey mapped

### 3. RACI Matrix
| Activiteit | A1 | Designer | HR | PM |
|------------|----|-----------------------|-----|-----|
| Roles | C | A | R | I |
| Procedures | C | A | R | I |
| Glossary | R | A | C | I |
| Taxonomy | R | A | C | I |

### 4. Artefacts
```
Miro Board: O9-Rollen
├── Frame 1: KR Overview (KR9.1-9.50)
├── Frame 2: Organizational Roles
│   ├── Platform roles (5)
│   ├── Organization roles
│   └── Role relationships
├── Frame 3: Procedure Index
│   ├── Platform procedures
│   ├── Organization procedures
│   └── Client procedures
├── Frame 4: Glossary Index
│   ├── A-Z navigation
│   └── Category grouping
├── Frame 5: Taxonomy Hierarchy
│   ├── Entity levels
│   ├── Classification types
│   └── Relationship types
└── Frame 6: Onboarding Journeys
    ├── New employee
    ├── New admin
    └── New client
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O8: Visuele Documentatie

#### 5.2 Parents
- O9: Rollen & Procedures

#### 5.3 Children
- P1-P5: All process documents

#### 5.4 Grandchildren
- Training materials
- Quick reference cards

---

# PROCESS DOCUMENTS (P1-P5)

---

## P1: ROLLEN.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Documenteren van alle platform- en organisatierollen met hun verantwoordelijkheden, bevoegdheden en toegangsrechten.

#### 1.2 Wat is dit wel?
- Rolbeschrijvingen voor alle 5 platformrollen
- Rolbeschrijvingen voor organisatierollen (afdelingen)
- Verantwoordelijkheidsmatrices per rol
- Escalatiepaden en rapportagelijnen
- Toegangsrechten overzicht per rol

#### 1.3 Wat is dit niet?
- Geen individuele gebruikersaccounts
- Geen HR-documentatie of arbeidsvoorwaarden
- Geen technische implementatiedetails (zie D8)
- Geen procedures (zie P2)

#### 1.4 Premortem
- Rollen overlappen waardoor verwarring ontstaat
- Rechten te breed of te restrictief gedefinieerd
- Escalatiepaden onduidelijk bij conflicten
- Document raakt verouderd na organisatiewijzigingen

#### 1.5 Postmortem
- Kwartaal review van rolbeschrijvingen
- Feedback sessies met rolhouders
- Audit trail van rolwijzigingen bijhouden

### 2. Definition of Done
- [ ] Alle 5 platformrollen gedocumenteerd
- [ ] Alle 4 afdelingsrollen gedocumenteerd
- [ ] Verantwoordelijkheidsmatrix per rol compleet
- [ ] Toegangsrechten matrix gevalideerd tegen D8
- [ ] Escalatiepaden gedefinieerd
- [ ] Review door stakeholders afgerond

### 3. RACI Matrix
| Activiteit | A1 | PM | Afdelingshoofd | HR |
|------------|----|----|----------------|-----|
| Platformrollen definiëren | R | A | C | I |
| Organisatierollen definiëren | C | R | A | C |
| Rechtenmatrix opstellen | R | A | C | I |
| Review en goedkeuring | I | R | A | C |

### 4. Artefacts
```
docs/
└── processes/
    └── ROLLEN.md
        ├── 1. Inleiding
        ├── 2. Platformrollen
        │   ├── 2.1 Admin
        │   ├── 2.2 Vault Medewerker
        │   ├── 2.3 Medewerker
        │   ├── 2.4 Klant Editor
        │   └── 2.5 Klant Viewer
        ├── 3. Organisatierollen
        │   ├── 3.1 Afdelingshoofd
        │   ├── 3.2 Projectleider
        │   ├── 3.3 Teamlid
        │   └── 3.4 Externe medewerker
        ├── 4. Verantwoordelijkheidsmatrix
        ├── 5. Toegangsrechten Overzicht
        ├── 6. Escalatiepaden
        └── 7. Wijzigingshistorie
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O5: Toegangscontrole (RBAC)
- O9: Rollen & Procedures

#### 5.2 Parents
- KR9.1-9.9: Rol definities
- D8: Auth/RBAC Module

#### 5.3 Children
- P2: PROCEDURES.md
- P5: ONBOARDING.md

#### 5.4 Grandchildren
- User stories per rol
- Acceptatiecriteria per feature

---

## P2: PROCEDURES.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Vastleggen van alle werkprocessen en procedures voor het gebruik van het platform binnen de organisatie.

#### 1.2 Wat is dit wel?
- Platform procedures (login, projectaanmaak, etc.)
- Organisatie procedures (goedkeuringsflows)
- Klant procedures (onboarding, toegang)
- ISO-conforme werkprocessen
- Escalatie- en incidentprocedures

#### 1.3 Wat is dit niet?
- Geen technische handleidingen (zie D17)
- Geen rolbeschrijvingen (zie P1)
- Geen code documentatie

#### 1.4 Premortem
- Procedures te complex voor dagelijks gebruik
- Afwijkingen van procedures niet gedetecteerd
- Procedures conflicteren met werkelijkheid
- Updates niet doorgevoerd na platformwijzigingen

#### 1.5 Postmortem
- Procedure audits per kwartaal
- Gebruikersfeedback verzamelen
- Afwijkingen documenteren en analyseren

### 2. Definition of Done
- [ ] Alle platform procedures gedocumenteerd
- [ ] Alle organisatie procedures gedocumenteerd
- [ ] Alle klant procedures gedocumenteerd
- [ ] Flowcharts per procedure
- [ ] Checklists per procedure
- [ ] Review door procesverantwoordelijken

### 3. RACI Matrix
| Activiteit | A1 | PM | Procesowner | Gebruiker |
|------------|----|----|-------------|-----------|
| Platform procedures | R | A | C | I |
| Organisatie procedures | C | A | R | I |
| Klant procedures | C | A | R | I |
| Flowcharts maken | R | A | C | I |
| Validatie | I | A | R | C |

### 4. Artefacts
```
docs/
└── processes/
    └── PROCEDURES.md
        ├── 1. Platform Procedures
        │   ├── 1.1 Inloggen en Authenticatie
        │   ├── 1.2 Workspace Aanmaken
        │   ├── 1.3 Project Aanmaken
        │   ├── 1.4 Taak Beheer
        │   ├── 1.5 View Wisselen
        │   ├── 1.6 Resource Planning
        │   ├── 1.7 Baseline Beheer
        │   ├── 1.8 Data Export
        │   └── 1.9 Probleemmelding
        ├── 2. Organisatie Procedures
        │   ├── 2.1 Nieuw Project Goedkeuring
        │   ├── 2.2 Toegangsverzoek
        │   ├── 2.3 Data naar Vault
        │   ├── 2.4 Vault Verwerking
        │   ├── 2.5 Afdelingsoverdracht
        │   ├── 2.6 Escalatie
        │   ├── 2.7 Periodieke Review
        │   ├── 2.8 Archivering
        │   └── 2.9 Audit Trail Review
        ├── 3. Klant Procedures
        │   ├── 3.1 Klant Uitnodigen
        │   ├── 3.2 Klant Onboarding
        │   ├── 3.3 Klant Project Setup
        │   ├── 3.4 Klant Rechten Wijzigen
        │   ├── 3.5 Klant Communicatie
        │   ├── 3.6 Klant Project Afsluiten
        │   ├── 3.7 Klant Data Overdracht
        │   ├── 3.8 Klant Toegang Intrekken
        │   ├── 3.9 Klant Feedback
        │   └── 3.10 Klant Incident
        └── 4. Flowcharts
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O1: Gestandaardiseerde Samenwerking
- O9: Rollen & Procedures

#### 5.2 Parents
- KR9.10-9.37: Procedure definities
- P1: ROLLEN.md

#### 5.3 Children
- P5: ONBOARDING.md
- M6: Process Flows

#### 5.4 Grandchildren
- Training materiaal
- Quick reference cards

---

## P3: GLOSSARY.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Creëren van een eenduidig vocabulaire voor alle termen, concepten en afkortingen gebruikt binnen het platform en de organisatie.

#### 1.2 Wat is dit wel?
- Platform-specifieke termen
- Bryntum component terminologie
- Organisatie-specifieke begrippen
- ISO/projectmanagement termen
- Afkortingenlijst

#### 1.3 Wat is dit niet?
- Geen uitgebreide handleiding (zie D17)
- Geen taxonomie of hiërarchie (zie P4)
- Geen procedures (zie P2)

#### 1.4 Premortem
- Inconsistent taalgebruik ondanks glossary
- Glossary niet vindbaar of toegankelijk
- Termen niet geüpdatet bij nieuwe features
- Vertalingen (NL/EN) inconsistent

#### 1.5 Postmortem
- Glossary integreren in zoekfunctie
- Automatische term highlighting in docs
- Maandelijkse term review bij releases

### 2. Definition of Done
- [ ] Alle platform termen gedefinieerd
- [ ] Alle Bryntum termen vertaald/uitgelegd
- [ ] Alle organisatie termen gedefinieerd
- [ ] Afkortingenlijst compleet
- [ ] Cross-references naar documentatie
- [ ] Alfabetisch gesorteerd en doorzoekbaar

### 3. RACI Matrix
| Activiteit | A1 | PM | Tech Writer | SME |
|------------|----|----|-------------|-----|
| Platform termen | R | A | C | I |
| Bryntum termen | R | I | A | C |
| Organisatie termen | C | A | R | C |
| Review | C | A | R | C |

### 4. Artefacts
```
docs/
└── reference/
    └── GLOSSARY.md
        ├── A
        │   ├── Admin (rol)
        │   ├── Assignment (resource toewijzing)
        │   └── ...
        ├── B
        │   ├── Baseline (project snapshot)
        │   ├── Bryntum (vendor)
        │   └── ...
        ├── C-Z...
        └── Afkortingen
            ├── CRUD
            ├── RLS
            ├── RBAC
            └── ...
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O9: Rollen & Procedures

#### 5.2 Parents
- KR9.38-9.42: Glossary requirements
- D15: ARCHITECTURE.md

#### 5.3 Children
- P4: TAXONOMY.md
- Alle documentatie

#### 5.4 Grandchildren
- Tooltips in UI
- Contextual help

---

## P4: TAXONOMY.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Definiëren van de hiërarchische structuur en classificatiesystemen voor alle entiteiten binnen het platform.

#### 1.2 Wat is dit wel?
- Entity hiërarchie (Workspace → Project → Task)
- Classificatie systemen (status, prioriteit, type)
- Relatie types tussen entiteiten
- Naamgevingsconventies
- Categorisering structuren

#### 1.3 Wat is dit niet?
- Geen term definities (zie P3)
- Geen database schema (zie D11)
- Geen UI structuur

#### 1.4 Premortem
- Taxonomie te rigide voor praktijk
- Inconsistente toepassing door gebruikers
- Hiërarchie levels onduidelijk
- Categorieën overlappen

#### 1.5 Postmortem
- Taxonomie valideren tegen daadwerkelijk gebruik
- Flexibiliteit inbouwen waar nodig
- Duidelijke voorbeelden per categorie

### 2. Definition of Done
- [ ] Entity hiërarchie gedocumenteerd
- [ ] Alle classificaties gedefinieerd
- [ ] Relatie types beschreven
- [ ] Naamgevingsconventies vastgelegd
- [ ] Visuele taxonomie diagram
- [ ] Validatieregels per niveau

### 3. RACI Matrix
| Activiteit | A1 | PM | Domain Expert | User |
|------------|----|----|---------------|------|
| Entity hiërarchie | R | A | C | I |
| Classificaties | C | A | R | C |
| Naamgeving | R | A | C | I |
| Validatie | C | A | R | C |

### 4. Artefacts
```
docs/
└── reference/
    └── TAXONOMY.md
        ├── 1. Entity Hiërarchie
        │   ├── Level 0: Platform
        │   ├── Level 1: Workspace
        │   ├── Level 2: Project
        │   ├── Level 3: Task/Resource/Calendar
        │   └── Level 4: Subtask/Assignment/Event
        ├── 2. Classificaties
        │   ├── 2.1 Workspace Types
        │   ├── 2.2 Project Status
        │   ├── 2.3 Task Status
        │   ├── 2.4 Task Priority
        │   ├── 2.5 Task Type
        │   ├── 2.6 Resource Type
        │   └── 2.7 Vault Status
        ├── 3. Relatie Types
        │   ├── 3.1 Hiërarchisch
        │   ├── 3.2 Dependencies
        │   ├── 3.3 Assignments
        │   └── 3.4 Membership
        ├── 4. Naamgevingsconventies
        └── 5. Validatieregels
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O9: Rollen & Procedures

#### 5.2 Parents
- KR9.43-9.50: Taxonomy requirements
- P3: GLOSSARY.md

#### 5.3 Children
- D11: Database Schema
- UI components

#### 5.4 Grandchildren
- Data validatie regels
- Form constraints

---

## P5: ONBOARDING.md

### 1. Doelstelling en Scope

#### 1.1 Doelstelling
Beschrijven van het complete onboarding proces voor nieuwe gebruikers, per rol en gebruikerstype.

#### 1.2 Wat is dit wel?
- Stap-voor-stap onboarding flows
- Rol-specifieke checklists
- Training materiaal overzicht
- Eerste-dag procedures
- Mentor/buddy toewijzing

#### 1.3 Wat is dit niet?
- Geen volledige handleiding (zie D17)
- Geen HR onboarding (buiten scope)
- Geen technische setup docs

#### 1.4 Premortem
- Onboarding te lang/complex
- Essentiële stappen overgeslagen
- Geen feedback loop voor verbetering
- Verschillende onboarding ervaringen

#### 1.5 Postmortem
- Onboarding feedback na 1 week
- Time-to-productivity meten
- Continuous improvement cyclus

### 2. Definition of Done
- [ ] Onboarding flow per platformrol
- [ ] Onboarding flow voor klanten
- [ ] Checklists per rol compleet
- [ ] Training materiaal gekoppeld
- [ ] Buddy systeem beschreven
- [ ] Feedback mechanisme gedefinieerd

### 3. RACI Matrix
| Activiteit | A1 | PM | HR | Manager |
|------------|----|----|-----|---------|
| Flow ontwerp | C | A | R | C |
| Checklists | C | A | R | C |
| Training content | R | A | C | I |
| Implementatie | C | A | R | C |

### 4. Artefacts
```
docs/
└── processes/
    └── ONBOARDING.md
        ├── 1. Interne Medewerker Onboarding
        │   ├── 1.1 Pre-boarding
        │   ├── 1.2 Dag 1
        │   ├── 1.3 Week 1
        │   ├── 1.4 Maand 1
        │   └── 1.5 Checklist Medewerker
        ├── 2. Admin Onboarding
        │   └── 2.1-2.4 Extended flow
        ├── 3. Vault Medewerker Onboarding
        │   └── 3.1-3.4 Extended flow
        ├── 4. Klant Onboarding
        │   └── 4.1-4.5 Client flow
        ├── 5. Training Materiaal
        └── 6. Feedback & Evaluatie
```

### 5. Gerelateerd

#### 5.1 Grandparents
- O9: Rollen & Procedures

#### 5.2 Parents
- KR9.25: Onboarding procedure
- P1: ROLLEN.md
- P2: PROCEDURES.md

#### 5.3 Children
- Training materialen
- Quick start guides

#### 5.4 Grandchildren
- User satisfaction scores
- Time-to-productivity metrics

---

# Appendix

## Dependency Graph

```
                    ┌─────────────────────────────────────────────┐
                    │              DOCUMENTATION                   │
                    │  D15 (ARCH) ─► D16 (CONTRACTS) ─► D17 (API) │
                    └─────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │              INFRASTRUCTURE                │
                    │  D11 (DB) ─► D12 (Auth) ─► D13 (API) ─► D14│
                    └─────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │              FOUNDATION                    │
                    │                   D1                       │
                    └─────────────────────────────────────────────┘
                                          │
           ┌──────────────┬───────────────┼───────────────┬──────────────┐
           ▼              ▼               ▼               ▼              ▼
        ┌─────┐       ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐
        │ D2  │       │ D3  │        │ D4  │        │ D5  │        │ D7  │
        │Gantt│       │ Cal │        │Board│        │Grid │        │ WS  │
        └──┬──┘       └──┬──┘        └──┬──┘        └──┬──┘        └──┬──┘
           │             │              │              │              │
           └──────────┬──┴──────────────┴──────────────┘              │
                      │                                               │
                      ▼                                               ▼
                   ┌─────┐                                        ┌─────┐
                   │ D6  │                                        │ D8  │
                   │Dash │                                        │Auth │
                   └──┬──┘                                        └──┬──┘
                      │                                               │
                      ▼                                               ▼
                   ┌─────┐                                        ┌─────┐
                   │ D10 │                                        │ D9  │
                   │Export│                                       │Vault│
                   └─────┘                                        └─────┘

                    ┌─────────────────────────────────────────────┐
                    │              MIRO BOARDS                     │
                    │  M1 ─► M2 ─► M3 ─► M4 ─► M5 ─► M6 ─► M7    │
                    └─────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │           PROCESS DOCUMENTS                  │
                    │  P1 (Rollen) ─► P2 (Procedures) ─► P5       │
                    │  P3 (Glossary) ─► P4 (Taxonomy)             │
                    └─────────────────────────────────────────────┘
```

## Version History

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-29 | A1 | Initiële versie met alle 29 deliverables |
