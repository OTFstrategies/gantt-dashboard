# Project Sections

> **Deliverables → Secties → Taken**
> Elke deliverable is opgedeeld in logische secties die samen de deliverable completeren.

---

## Structuur

```
Deliverable (D1-D10, D11-D14, D15-D17, M1-M7, P1-P5)
└── Sectie (S1.1, S1.2, ...)
    └── Taak (T1.1.1, T1.1.2, ...)
```

### Naamgeving Conventie

| Type | Format | Voorbeeld |
|------|--------|-----------|
| Deliverable | D{nummer} | D1, D2, M1, P1 |
| Sectie | S{deliverable}.{nummer} | S1.1, S1.2, S2.1 |
| Taak | T{deliverable}.{sectie}.{nummer} | T1.1.1, T1.1.2 |

---

# CODE MODULES (D1-D10)

---

## D1: Foundation Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S1.1** | Bryntum Setup | Licentie, configuratie, initialisatie | 4 |
| **S1.2** | TypeScript Types | Shared types, interfaces, type guards | 6 |
| **S1.3** | ProjectModel | Model setup, stores, relaties | 5 |
| **S1.4** | CrudManager | Sync configuratie, endpoints, error handling | 4 |
| **S1.5** | Theme System | Light/dark mode, CSS variables, Bryntum overrides | 5 |
| **S1.6** | Shared Components | ErrorBoundary, Loading, Skeleton, Empty states | 4 |
| **S1.7** | Providers | BryntumProvider, ThemeProvider, context setup | 3 |
| **S1.8** | Hooks | useProject, useTheme, useSync, utilities | 4 |
| | | **Totaal D1** | **35** |

### S1.1: Bryntum Setup
```
Doel: Bryntum Suite correct geïnstalleerd en geconfigureerd
Output: Werkende Bryntum import zonder licentie errors

Taken:
├── T1.1.1: Bryntum packages installeren (gantt, calendar, taskboard, grid)
├── T1.1.2: Licentie bestand configureren
├── T1.1.3: Global Bryntum config aanmaken
└── T1.1.4: Bryntum CSS imports opzetten
```

### S1.2: TypeScript Types
```
Doel: Type-safe development voor alle Bryntum entities
Output: Geëxporteerde types voor Project, Task, Resource, etc.

Taken:
├── T1.2.1: Bryntum type augmentations (bryntum.d.ts)
├── T1.2.2: Project interface definiëren
├── T1.2.3: Task interface definiëren (incl. custom fields)
├── T1.2.4: Resource interface definiëren
├── T1.2.5: Calendar/Event interfaces definiëren
└── T1.2.6: Dependency interface definiëren
```

### S1.3: ProjectModel
```
Doel: Centrale data store voor alle views
Output: Geconfigureerde ProjectModel die door alle componenten gedeeld wordt

Taken:
├── T1.3.1: Extended ProjectModel class maken
├── T1.3.2: TaskStore configuratie
├── T1.3.3: ResourceStore configuratie
├── T1.3.4: DependencyStore configuratie
├── T1.3.5: AssignmentStore configuratie
└── T1.3.6: CalendarStore configuratie
```

### S1.4: CrudManager
```
Doel: Data synchronisatie met backend
Output: Werkende sync tussen frontend en Supabase

Taken:
├── T1.4.1: CrudManager base configuratie
├── T1.4.2: Sync URL endpoints definiëren
├── T1.4.3: Request/response transformers
└── T1.4.4: Error handling en retry logic
```

### S1.5: Theme System
```
Doel: Consistente styling met theme switching
Output: Light/dark mode toggle, custom Bryntum theme

Taken:
├── T1.5.1: CSS custom properties definiëren
├── T1.5.2: Light theme variabelen
├── T1.5.3: Dark theme variabelen
├── T1.5.4: Bryntum theme overrides
└── T1.5.5: Theme persistence (localStorage)
```

### S1.6: Shared Components
```
Doel: Herbruikbare UI componenten
Output: Component library voor error/loading states

Taken:
├── T1.6.1: ErrorBoundary component
├── T1.6.2: LoadingSpinner component
├── T1.6.3: Skeleton loaders
└── T1.6.4: EmptyState component
```

### S1.7: Providers
```
Doel: React context voor globale state
Output: Provider hierarchy voor de app

Taken:
├── T1.7.1: BryntumProvider (ProjectModel context)
├── T1.7.2: ThemeProvider (theme context)
└── T1.7.3: Provider composition in app layout
```

### S1.8: Hooks
```
Doel: Custom hooks voor data access
Output: Herbruikbare hooks voor componenten

Taken:
├── T1.8.1: useProject hook
├── T1.8.2: useTheme hook
├── T1.8.3: useSync hook
└── T1.8.4: Utility hooks (useLocalStorage, etc.)
```

---

## D2: Gantt Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S2.1** | Gantt Component | BryntumGantt wrapper, basic rendering | 4 |
| **S2.2** | Gantt Toolbar | Zoom, filters, actions | 6 |
| **S2.3** | Task Management | CRUD, drag & drop, editing | 7 |
| **S2.4** | Dependencies | Dependency lines, types, editing | 5 |
| **S2.5** | Task Editor | Dialog, tabs, validation | 6 |
| **S2.6** | Critical Path | Highlighting, berekening | 3 |
| **S2.7** | Baselines | Vergelijking, toggle, display | 4 |
| **S2.8** | Column Config | Column definitie, reorder, resize | 4 |
| **S2.9** | Gantt Features | Progress line, indicators, labels | 5 |
| | | **Totaal D2** | **44** |

### S2.1: Gantt Component
```
Doel: Basis Gantt chart rendering
Output: Werkende Gantt met data uit ProjectModel

Taken:
├── T2.1.1: BryntumGantt React wrapper
├── T2.1.2: Gantt configuratie object
├── T2.1.3: ProjectModel binding
└── T2.1.4: Gantt page route (/gantt)
```

### S2.2: Gantt Toolbar
```
Doel: Toolbar met alle Gantt acties
Output: Functionele toolbar boven Gantt

Taken:
├── T2.2.1: Toolbar component structuur
├── T2.2.2: Zoom controls (in/out/fit)
├── T2.2.3: View preset selector (dag/week/maand)
├── T2.2.4: Filter dropdown
├── T2.2.5: Export button
└── T2.2.6: Undo/Redo buttons
```

### S2.3: Task Management
```
Doel: Volledige task CRUD functionaliteit
Output: Tasks aanmaken, bewerken, verwijderen, verplaatsen

Taken:
├── T2.3.1: Task create (via toolbar)
├── T2.3.2: Task create (via drag)
├── T2.3.3: Task update (inline edit)
├── T2.3.4: Task delete (context menu)
├── T2.3.5: Task drag & drop (reschedule)
├── T2.3.6: Task resize (duration)
└── T2.3.7: Task indent/outdent (hierarchy)
```

### S2.4: Dependencies
```
Doel: Dependency management tussen taken
Output: Visuele dependency lines met editing

Taken:
├── T2.4.1: Dependency rendering (lines)
├── T2.4.2: Dependency types (FS, FF, SS, SF)
├── T2.4.3: Dependency create (drag)
├── T2.4.4: Dependency edit (lag, type)
└── T2.4.5: Dependency delete
```

### S2.5: Task Editor
```
Doel: Uitgebreide task editing dialog
Output: Multi-tab editor voor task details

Taken:
├── T2.5.1: Task editor dialog component
├── T2.5.2: General tab (naam, dates, progress)
├── T2.5.3: Dependencies tab
├── T2.5.4: Resources tab
├── T2.5.5: Notes tab
└── T2.5.6: Validation en save logic
```

### S2.6: Critical Path
```
Doel: Critical path visualisatie
Output: Highlighted critical path taken

Taken:
├── T2.6.1: Critical path feature activeren
├── T2.6.2: Critical path styling
└── T2.6.3: Critical path toggle
```

### S2.7: Baselines
```
Doel: Baseline vergelijking
Output: Planned vs actual visualisatie

Taken:
├── T2.7.1: Baseline create/save
├── T2.7.2: Baseline toggle visibility
├── T2.7.3: Baseline rendering (achtergrond bars)
└── T2.7.4: Baseline selectie dropdown
```

### S2.8: Column Config
```
Doel: Configureerbare grid kolommen
Output: Aanpasbare kolom layout

Taken:
├── T2.8.1: Column definitions
├── T2.8.2: Column reorder (drag)
├── T2.8.3: Column resize
└── T2.8.4: Column visibility toggle
```

### S2.9: Gantt Features
```
Doel: Extra Gantt visualisaties
Output: Progress line, labels, indicators

Taken:
├── T2.9.1: Progress line feature
├── T2.9.2: Task labels (links/rechts)
├── T2.9.3: Task indicators (icons)
├── T2.9.4: Non-working time highlighting
└── T2.9.5: Time ranges (holidays, etc.)
```

---

## D3: Calendar Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S3.1** | Calendar Component | BryntumCalendar wrapper, basic rendering | 4 |
| **S3.2** | Calendar Toolbar | View switcher, navigation | 5 |
| **S3.3** | View Modes | Day, Week, Month, Year, Agenda | 5 |
| **S3.4** | Event Management | CRUD, drag & drop | 6 |
| **S3.5** | Event Editor | Dialog, recurrence | 5 |
| **S3.6** | Sidebar | Mini calendar, filters | 4 |
| **S3.7** | Resource View | Per-resource calendar | 3 |
| | | **Totaal D3** | **32** |

### S3.1: Calendar Component
```
Taken:
├── T3.1.1: BryntumCalendar React wrapper
├── T3.1.2: Calendar configuratie object
├── T3.1.3: ProjectModel/EventStore binding
└── T3.1.4: Calendar page route (/calendar)
```

### S3.2: Calendar Toolbar
```
Taken:
├── T3.2.1: Toolbar component structuur
├── T3.2.2: View mode switcher
├── T3.2.3: Date navigation (prev/next/today)
├── T3.2.4: Date range display
└── T3.2.5: Create event button
```

### S3.3: View Modes
```
Taken:
├── T3.3.1: Day view configuratie
├── T3.3.2: Week view configuratie
├── T3.3.3: Month view configuratie
├── T3.3.4: Year view configuratie
└── T3.3.5: Agenda view configuratie
```

### S3.4: Event Management
```
Taken:
├── T3.4.1: Event create (click)
├── T3.4.2: Event create (drag)
├── T3.4.3: Event update (inline)
├── T3.4.4: Event delete
├── T3.4.5: Event drag & drop (reschedule)
└── T3.4.6: Event resize
```

### S3.5: Event Editor
```
Taken:
├── T3.5.1: Event editor dialog
├── T3.5.2: Basic fields (naam, tijd, locatie)
├── T3.5.3: All-day event toggle
├── T3.5.4: Recurrence editor
└── T3.5.5: Resource assignment
```

### S3.6: Sidebar
```
Taken:
├── T3.6.1: Sidebar component
├── T3.6.2: Mini calendar (date picker)
├── T3.6.3: Resource filter checkboxes
└── T3.6.4: Calendar filter (show/hide calendars)
```

### S3.7: Resource View
```
Taken:
├── T3.7.1: Resource view mode
├── T3.7.2: Resource grouping
└── T3.7.3: Resource capacity display
```

---

## D4: TaskBoard Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S4.1** | TaskBoard Component | BryntumTaskBoard wrapper | 4 |
| **S4.2** | TaskBoard Toolbar | Filters, actions | 4 |
| **S4.3** | Columns | Column config, CRUD | 5 |
| **S4.4** | Cards | Card rendering, items | 5 |
| **S4.5** | Drag & Drop | Card movement, multi-select | 4 |
| **S4.6** | Card Editor | Edit dialog | 4 |
| **S4.7** | Swimlanes | Grouping, config | 3 |
| **S4.8** | WIP Limits | Limits, warnings | 3 |
| | | **Totaal D4** | **32** |

### S4.1: TaskBoard Component
```
Taken:
├── T4.1.1: BryntumTaskBoard React wrapper
├── T4.1.2: TaskBoard configuratie object
├── T4.1.3: ProjectModel binding
└── T4.1.4: TaskBoard page route (/taskboard)
```

### S4.2: TaskBoard Toolbar
```
Taken:
├── T4.2.1: Toolbar component
├── T4.2.2: Filter bar
├── T4.2.3: Search field
└── T4.2.4: View options (compact/normal)
```

### S4.3: Columns
```
Taken:
├── T4.3.1: Column definitions (status-based)
├── T4.3.2: Column headers
├── T4.3.3: Column collapse/expand
├── T4.3.4: Column add/remove
└── T4.3.5: Column reorder
```

### S4.4: Cards
```
Taken:
├── T4.4.1: Card component template
├── T4.4.2: Card fields (title, assignee, etc.)
├── T4.4.3: Card tags/labels
├── T4.4.4: Card progress indicator
└── T4.4.5: Card color coding
```

### S4.5: Drag & Drop
```
Taken:
├── T4.5.1: Card drag between columns
├── T4.5.2: Card reorder within column
├── T4.5.3: Multi-select drag
└── T4.5.4: Drop validation
```

### S4.6: Card Editor
```
Taken:
├── T4.6.1: Card editor dialog
├── T4.6.2: Field editing
├── T4.6.3: Tag management
└── T4.6.4: Save/cancel logic
```

### S4.7: Swimlanes
```
Taken:
├── T4.7.1: Swimlane configuratie
├── T4.7.2: Swimlane headers
└── T4.7.3: Swimlane collapse
```

### S4.8: WIP Limits
```
Taken:
├── T4.8.1: WIP limit configuratie per column
├── T4.8.2: WIP limit visual indicator
└── T4.8.3: WIP limit warning
```

---

## D5: Grid Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S5.1** | Grid Component | BryntumGrid wrapper | 4 |
| **S5.2** | Grid Toolbar | Actions, export | 4 |
| **S5.3** | Columns | Config, types, renderers | 5 |
| **S5.4** | Sorting & Filtering | Sort, filter builder | 5 |
| **S5.5** | Editing | Cell edit, row edit | 4 |
| **S5.6** | Selection | Single, multi, checkbox | 3 |
| **S5.7** | Grouping | Group by, summaries | 4 |
| **S5.8** | Export | CSV, Excel | 3 |
| | | **Totaal D5** | **32** |

### S5.1: Grid Component
```
Taken:
├── T5.1.1: BryntumGrid React wrapper
├── T5.1.2: Grid configuratie object
├── T5.1.3: Store binding (tasks/resources)
└── T5.1.4: Grid page route (/grid)
```

### S5.2: Grid Toolbar
```
Taken:
├── T5.2.1: Toolbar component
├── T5.2.2: Column picker
├── T5.2.3: Export buttons
└── T5.2.4: Refresh button
```

### S5.3: Columns
```
Taken:
├── T5.3.1: Column definitions
├── T5.3.2: Column types (text, number, date, etc.)
├── T5.3.3: Custom renderers
├── T5.3.4: Column resize
└── T5.3.5: Column reorder
```

### S5.4: Sorting & Filtering
```
Taken:
├── T5.4.1: Single column sort
├── T5.4.2: Multi-column sort
├── T5.4.3: Quick filter (header)
├── T5.4.4: Filter builder UI
└── T5.4.5: Filter presets
```

### S5.5: Editing
```
Taken:
├── T5.5.1: Cell editing
├── T5.5.2: Row editing
├── T5.5.3: Validation
└── T5.5.4: Auto-save
```

### S5.6: Selection
```
Taken:
├── T5.6.1: Single row selection
├── T5.6.2: Multi-row selection
└── T5.6.3: Checkbox column
```

### S5.7: Grouping
```
Taken:
├── T5.7.1: Group by column
├── T5.7.2: Group headers
├── T5.7.3: Group collapse/expand
└── T5.7.4: Group summaries
```

### S5.8: Export
```
Taken:
├── T5.8.1: Export to CSV
├── T5.8.2: Export to Excel
└── T5.8.3: Export configuratie (columns, filters)
```

---

## D6: Dashboard Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S6.1** | Dashboard Layout | Grid layout, containers | 4 |
| **S6.2** | Navigation | Sidebar, breadcrumbs | 5 |
| **S6.3** | View Switcher | Tabs, routing | 4 |
| **S6.4** | Widget System | Widget containers, config | 5 |
| **S6.5** | Quick Actions | Action panel, shortcuts | 4 |
| **S6.6** | Recent Items | History, favorites | 3 |
| **S6.7** | Notifications | Notification center | 3 |
| | | **Totaal D6** | **28** |

### S6.1: Dashboard Layout
```
Taken:
├── T6.1.1: Dashboard layout component
├── T6.1.2: Resizable panels
├── T6.1.3: Layout persistence
└── T6.1.4: Responsive breakpoints
```

### S6.2: Navigation
```
Taken:
├── T6.2.1: Sidebar component
├── T6.2.2: Workspace navigation
├── T6.2.3: Project navigation
├── T6.2.4: Breadcrumb component
└── T6.2.5: Mobile navigation (hamburger)
```

### S6.3: View Switcher
```
Taken:
├── T6.3.1: View tabs component
├── T6.3.2: View routing logic
├── T6.3.3: View state preservation
└── T6.3.4: Default view setting
```

### S6.4: Widget System
```
Taken:
├── T6.4.1: Widget container component
├── T6.4.2: Gantt widget integration
├── T6.4.3: Calendar widget integration
├── T6.4.4: TaskBoard widget integration
└── T6.4.5: Stats widget
```

### S6.5: Quick Actions
```
Taken:
├── T6.5.1: Quick actions panel
├── T6.5.2: Create task shortcut
├── T6.5.3: Create event shortcut
└── T6.5.4: Keyboard shortcuts
```

### S6.6: Recent Items
```
Taken:
├── T6.6.1: Recent items tracking
├── T6.6.2: Recent items display
└── T6.6.3: Favorites system
```

### S6.7: Notifications
```
Taken:
├── T6.7.1: Notification center
├── T6.7.2: Toast notifications
└── T6.7.3: Notification settings
```

---

## D7: Workspace Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S7.1** | Workspace CRUD | Create, read, update, delete | 5 |
| **S7.2** | Workspace Types | Afdeling vs Klant | 3 |
| **S7.3** | Member Management | Add, remove, roles | 5 |
| **S7.4** | Invite System | Email invite, accept flow | 5 |
| **S7.5** | Workspace Settings | Configuration panel | 4 |
| **S7.6** | Workspace Dashboard | Overview, activity | 4 |
| | | **Totaal D7** | **26** |

### S7.1: Workspace CRUD
```
Taken:
├── T7.1.1: Workspace list page
├── T7.1.2: Workspace create dialog
├── T7.1.3: Workspace update
├── T7.1.4: Workspace delete (soft)
└── T7.1.5: Workspace API routes
```

### S7.2: Workspace Types
```
Taken:
├── T7.2.1: Type: Afdeling configuratie
├── T7.2.2: Type: Klant configuratie
└── T7.2.3: Type-specific features toggle
```

### S7.3: Member Management
```
Taken:
├── T7.3.1: Member list component
├── T7.3.2: Add member dialog
├── T7.3.3: Remove member
├── T7.3.4: Role assignment
└── T7.3.5: Member API routes
```

### S7.4: Invite System
```
Taken:
├── T7.4.1: Invite dialog
├── T7.4.2: Email invite sending
├── T7.4.3: Invite token generation
├── T7.4.4: Invite accept page
└── T7.4.5: Invite expiration handling
```

### S7.5: Workspace Settings
```
Taken:
├── T7.5.1: Settings page layout
├── T7.5.2: General settings
├── T7.5.3: Notification settings
└── T7.5.4: Danger zone (archive/delete)
```

### S7.6: Workspace Dashboard
```
Taken:
├── T7.6.1: Workspace overview page
├── T7.6.2: Project list in workspace
├── T7.6.3: Activity feed
└── T7.6.4: Workspace stats
```

---

## D8: Auth/RBAC Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S8.1** | Authentication | Login, logout, session | 5 |
| **S8.2** | Password Management | Reset, change | 3 |
| **S8.3** | Role Definitions | 5 rollen definiëren | 5 |
| **S8.4** | Permissions | Permission matrix | 5 |
| **S8.5** | UI Guards | Route guards, component guards | 4 |
| **S8.6** | API Guards | Middleware, validation | 4 |
| **S8.7** | User Management | Admin panel | 4 |
| | | **Totaal D8** | **30** |

### S8.1: Authentication
```
Taken:
├── T8.1.1: Login page
├── T8.1.2: Login form component
├── T8.1.3: Supabase Auth integration
├── T8.1.4: Session management
└── T8.1.5: Logout functionality
```

### S8.2: Password Management
```
Taken:
├── T8.2.1: Forgot password page
├── T8.2.2: Reset password flow
└── T8.2.3: Change password (in settings)
```

### S8.3: Role Definitions
```
Taken:
├── T8.3.1: Rol: Admin
├── T8.3.2: Rol: Vault Medewerker
├── T8.3.3: Rol: Medewerker
├── T8.3.4: Rol: Klant Editor
└── T8.3.5: Rol: Klant Viewer
```

### S8.4: Permissions
```
Taken:
├── T8.4.1: Permission enum/constants
├── T8.4.2: Role-permission mapping
├── T8.4.3: Permission check utility
├── T8.4.4: usePermissions hook
└── T8.4.5: Permission inheritance logic
```

### S8.5: UI Guards
```
Taken:
├── T8.5.1: ProtectedRoute component
├── T8.5.2: PermissionGate component
├── T8.5.3: withAuth HOC
└── T8.5.4: Redirect logic
```

### S8.6: API Guards
```
Taken:
├── T8.6.1: Auth middleware
├── T8.6.2: Role middleware
├── T8.6.3: Permission middleware
└── T8.6.4: Unauthorized response handling
```

### S8.7: User Management
```
Taken:
├── T8.7.1: User list page (admin)
├── T8.7.2: User detail/edit
├── T8.7.3: Role assignment UI
└── T8.7.4: User deactivation
```

---

## D9: Vault Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S9.1** | Vault Dashboard | Overview, stats | 4 |
| **S9.2** | Vault Kanban | Input, Processing, Done columns | 5 |
| **S9.3** | Vault Items | Item CRUD, detail view | 5 |
| **S9.4** | Processing | Processing workflow, tools | 5 |
| **S9.5** | Retention | 30-day countdown, cleanup | 4 |
| **S9.6** | Vault Export | Export naar permanent | 4 |
| **S9.7** | Audit Trail | Item history, logging | 3 |
| | | **Totaal D9** | **30** |

### S9.1: Vault Dashboard
```
Taken:
├── T9.1.1: Vault dashboard page
├── T9.1.2: Vault stats (items per status)
├── T9.1.3: Expiring items warning
└── T9.1.4: Quick filters
```

### S9.2: Vault Kanban
```
Taken:
├── T9.2.1: Vault TaskBoard instance
├── T9.2.2: Input column
├── T9.2.3: Processing column
├── T9.2.4: Done column
└── T9.2.5: Column transitions logic
```

### S9.3: Vault Items
```
Taken:
├── T9.3.1: Vault item card component
├── T9.3.2: Vault item detail page
├── T9.3.3: Source data preview
├── T9.3.4: Item metadata
└── T9.3.5: Item API routes
```

### S9.4: Processing
```
Taken:
├── T9.4.1: Processing status update
├── T9.4.2: Processing notes field
├── T9.4.3: Processed by tracking
├── T9.4.4: Data transformation tools
└── T9.4.5: Validation checks
```

### S9.5: Retention
```
Taken:
├── T9.5.1: 30-day countdown display
├── T9.5.2: Expiration date tracking
├── T9.5.3: Auto-cleanup job
└── T9.5.4: Manual delete
```

### S9.6: Vault Export
```
Taken:
├── T9.6.1: Export to permanent storage
├── T9.6.2: Export confirmation dialog
├── T9.6.3: Export mapping
└── T9.6.4: Export logging
```

### S9.7: Audit Trail
```
Taken:
├── T9.7.1: Item history component
├── T9.7.2: Action logging
└── T9.7.3: Audit trail API
```

---

## D10: Export Module

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S10.1** | Export UI | Dialog, configuration | 4 |
| **S10.2** | PDF Export | Gantt, Calendar PDF | 5 |
| **S10.3** | Excel Export | Grid, data Excel | 4 |
| **S10.4** | CSV Export | Simple CSV | 3 |
| **S10.5** | Image Export | PNG, SVG | 3 |
| **S10.6** | Export Preview | Preview panel | 3 |
| **S10.7** | Export History | Logging, re-download | 3 |
| | | **Totaal D10** | **25** |

### S10.1: Export UI
```
Taken:
├── T10.1.1: Export button/trigger
├── T10.1.2: Export dialog component
├── T10.1.3: Format selection
└── T10.1.4: Options configuration
```

### S10.2: PDF Export
```
Taken:
├── T10.2.1: Gantt PDF export
├── T10.2.2: Calendar PDF export
├── T10.2.3: PDF layout options
├── T10.2.4: PDF page settings
└── T10.2.5: PDF API route
```

### S10.3: Excel Export
```
Taken:
├── T10.3.1: Grid Excel export
├── T10.3.2: Task list Excel export
├── T10.3.3: Excel formatting
└── T10.3.4: Excel API route
```

### S10.4: CSV Export
```
Taken:
├── T10.4.1: CSV generation
├── T10.4.2: CSV field selection
└── T10.4.3: CSV download
```

### S10.5: Image Export
```
Taken:
├── T10.5.1: PNG export (screenshot)
├── T10.5.2: SVG export
└── T10.5.3: Image resolution options
```

### S10.6: Export Preview
```
Taken:
├── T10.6.1: Preview panel component
├── T10.6.2: Preview rendering
└── T10.6.3: Preview refresh on option change
```

### S10.7: Export History
```
Taken:
├── T10.7.1: Export log database
├── T10.7.2: Export history UI
└── T10.7.3: Re-download functionality
```

---

# INFRASTRUCTURE (D11-D14)

---

## D11: Database Schema

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S11.1** | Core Tables | Profiles, workspaces, projects | 6 |
| **S11.2** | Project Tables | Tasks, dependencies, resources | 6 |
| **S11.3** | Feature Tables | Vault, exports, preferences | 4 |
| **S11.4** | RLS Policies | Row Level Security | 6 |
| **S11.5** | Indexes | Performance indexes | 3 |
| **S11.6** | Triggers | Timestamps, cascades | 3 |
| **S11.7** | Seed Data | Development data | 3 |
| | | **Totaal D11** | **31** |

### S11.1: Core Tables
```
Taken:
├── T11.1.1: profiles table
├── T11.1.2: workspaces table
├── T11.1.3: workspace_members table
├── T11.1.4: workspace_invites table
├── T11.1.5: projects table
└── T11.1.6: Foreign key constraints
```

### S11.2: Project Tables
```
Taken:
├── T11.2.1: tasks table
├── T11.2.2: dependencies table
├── T11.2.3: resources table
├── T11.2.4: assignments table
├── T11.2.5: calendars table
└── T11.2.6: baselines table
```

### S11.3: Feature Tables
```
Taken:
├── T11.3.1: vault_items table
├── T11.3.2: export_logs table
├── T11.3.3: user_preferences table
└── T11.3.4: taskboard_columns table
```

### S11.4: RLS Policies
```
Taken:
├── T11.4.1: profiles RLS
├── T11.4.2: workspaces RLS
├── T11.4.3: projects RLS
├── T11.4.4: tasks RLS
├── T11.4.5: vault_items RLS
└── T11.4.6: RLS policy testing
```

### S11.5: Indexes
```
Taken:
├── T11.5.1: Foreign key indexes
├── T11.5.2: Query optimization indexes
└── T11.5.3: Full-text search indexes
```

### S11.6: Triggers
```
Taken:
├── T11.6.1: updated_at triggers
├── T11.6.2: Cascade delete triggers
└── T11.6.3: Audit triggers
```

### S11.7: Seed Data
```
Taken:
├── T11.7.1: Seed profiles
├── T11.7.2: Seed workspaces & projects
└── T11.7.3: Seed tasks & resources
```

---

## D12: Auth Configuration

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S12.1** | Supabase Auth | Project setup | 4 |
| **S12.2** | Email Templates | Custom emails | 4 |
| **S12.3** | Auth Settings | JWT, session, rate limits | 4 |
| **S12.4** | Redirect URLs | Per environment | 3 |
| | | **Totaal D12** | **15** |

### S12.1: Supabase Auth
```
Taken:
├── T12.1.1: Supabase project setup
├── T12.1.2: Auth provider configuratie
├── T12.1.3: Email provider setup
└── T12.1.4: Auth hooks configuratie
```

### S12.2: Email Templates
```
Taken:
├── T12.2.1: Welcome email template
├── T12.2.2: Password reset template
├── T12.2.3: Invite email template
└── T12.2.4: Email branding
```

### S12.3: Auth Settings
```
Taken:
├── T12.3.1: JWT expiration settings
├── T12.3.2: Session timeout
├── T12.3.3: Rate limiting
└── T12.3.4: Password policy
```

### S12.4: Redirect URLs
```
Taken:
├── T12.4.1: Development URLs
├── T12.4.2: Preview URLs
└── T12.4.3: Production URLs
```

---

## D13: API Routes

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S13.1** | Workspace Routes | CRUD endpoints | 4 |
| **S13.2** | Project Routes | CRUD + sync | 5 |
| **S13.3** | Task Routes | Bulk operations | 3 |
| **S13.4** | Resource Routes | CRUD | 3 |
| **S13.5** | Vault Routes | Vault operations | 4 |
| **S13.6** | Export Routes | PDF, Excel, etc. | 4 |
| **S13.7** | Sync Route | CrudManager endpoint | 3 |
| | | **Totaal D13** | **26** |

### S13.1: Workspace Routes
```
Taken:
├── T13.1.1: GET/POST /api/workspaces
├── T13.1.2: GET/PUT/DELETE /api/workspaces/[id]
├── T13.1.3: /api/workspaces/[id]/members
└── T13.1.4: /api/workspaces/[id]/invites
```

### S13.2: Project Routes
```
Taken:
├── T13.2.1: GET/POST /api/projects
├── T13.2.2: GET/PUT/DELETE /api/projects/[id]
├── T13.2.3: POST /api/projects/[id]/sync
├── T13.2.4: POST /api/projects/[id]/baseline
└── T13.2.5: POST /api/projects/[id]/complete
```

### S13.3: Task Routes
```
Taken:
├── T13.3.1: GET/POST /api/tasks
├── T13.3.2: PUT/DELETE /api/tasks/[id]
└── T13.3.3: POST /api/tasks/bulk
```

### S13.4: Resource Routes
```
Taken:
├── T13.4.1: GET/POST /api/resources
├── T13.4.2: PUT/DELETE /api/resources/[id]
└── T13.4.3: GET /api/resources/availability
```

### S13.5: Vault Routes
```
Taken:
├── T13.5.1: GET /api/vault
├── T13.5.2: GET/PUT /api/vault/[id]
├── T13.5.3: POST /api/vault/[id]/process
└── T13.5.4: POST /api/vault/[id]/export
```

### S13.6: Export Routes
```
Taken:
├── T13.6.1: POST /api/export/pdf
├── T13.6.2: POST /api/export/excel
├── T13.6.3: POST /api/export/csv
└── T13.6.4: POST /api/export/image
```

### S13.7: Sync Route
```
Taken:
├── T13.7.1: POST /api/sync (CrudManager)
├── T13.7.2: Request parsing
└── T13.7.3: Response formatting
```

---

## D14: Deployment

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S14.1** | Vercel Setup | Project, team | 3 |
| **S14.2** | Environment Variables | Per environment | 4 |
| **S14.3** | Domain | Custom domain, SSL | 3 |
| **S14.4** | CI/CD | Build, preview, production | 4 |
| **S14.5** | Monitoring | Analytics, errors | 3 |
| | | **Totaal D14** | **17** |

### S14.1: Vercel Setup
```
Taken:
├── T14.1.1: Vercel project aanmaken
├── T14.1.2: Git repository koppelen
└── T14.1.3: Team settings
```

### S14.2: Environment Variables
```
Taken:
├── T14.2.1: Development env vars
├── T14.2.2: Preview env vars
├── T14.2.3: Production env vars
└── T14.2.4: Env var validation
```

### S14.3: Domain
```
Taken:
├── T14.3.1: Custom domain configuratie
├── T14.3.2: SSL certificate
└── T14.3.3: DNS settings
```

### S14.4: CI/CD
```
Taken:
├── T14.4.1: Build configuratie
├── T14.4.2: Preview deployments
├── T14.4.3: Production deployment
└── T14.4.4: Deployment notifications
```

### S14.5: Monitoring
```
Taken:
├── T14.5.1: Vercel Analytics
├── T14.5.2: Error tracking
└── T14.5.3: Performance monitoring
```

---

# DOCUMENTATION (D15-D17)

---

## D15: ARCHITECTURE.md

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S15.1** | System Overview | High-level architecture | 3 |
| **S15.2** | Tech Stack | Technologies, versions | 2 |
| **S15.3** | Component Architecture | Module structure | 4 |
| **S15.4** | Data Architecture | Models, sync, caching | 4 |
| **S15.5** | Security Architecture | Auth, RBAC, RLS | 4 |
| **S15.6** | Development Guide | Setup, standards | 3 |
| | | **Totaal D15** | **20** |

---

## D16: CONTRACTS.md

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S16.1** | Entity Interfaces | TypeScript interfaces | 4 |
| **S16.2** | API Contracts | Request/response schemas | 4 |
| **S16.3** | Event Payloads | Event definitions | 3 |
| **S16.4** | Validation Schemas | Zod schemas | 3 |
| **S16.5** | Error Codes | Error definitions | 2 |
| | | **Totaal D16** | **16** |

---

## D17: API-DOCS.md

| Sectie | Naam | Beschrijving | Geschatte Taken |
|--------|------|--------------|-----------------|
| **S17.1** | Overview | Base URL, auth, rate limits | 2 |
| **S17.2** | Workspace Endpoints | CRUD docs | 3 |
| **S17.3** | Project Endpoints | CRUD + sync docs | 4 |
| **S17.4** | Vault Endpoints | Vault API docs | 3 |
| **S17.5** | Export Endpoints | Export API docs | 3 |
| **S17.6** | Examples | Code examples | 3 |
| | | **Totaal D17** | **18** |

---

# MIRO BOARDS (M1-M7)

---

## M1-M7: Miro Boards

| Board | Secties | Geschatte Taken |
|-------|---------|-----------------|
| **M1** | 5 frames (KRs, flows, journeys, wireframes, decisions) | 10 |
| **M2** | 7 frames (views, data flow, sync) | 14 |
| **M3** | 7 frames (workspace hierarchy, isolation) | 10 |
| **M4** | 7 frames (RBAC matrix, vault workflow) | 12 |
| **M5** | 6 frames (formats, configuration) | 8 |
| **M6** | 5 frames (meta-board, templates, style guide) | 8 |
| **M7** | 6 frames (org charts, procedure flows) | 10 |
| | **Totaal M1-M7** | **72** |

---

# PROCESS DOCUMENTS (P1-P5)

---

## P1-P5: Process Documents

| Document | Secties | Geschatte Taken |
|----------|---------|-----------------|
| **P1** ROLLEN.md | 7 secties (platform + org rollen) | 12 |
| **P2** PROCEDURES.md | 4 secties (28 procedures) | 30 |
| **P3** GLOSSARY.md | A-Z + afkortingen | 8 |
| **P4** TAXONOMY.md | 5 secties (hiërarchie, classificaties) | 10 |
| **P5** ONBOARDING.md | 6 secties (per-rol flows) | 12 |
| | **Totaal P1-P5** | **72** |

---

# TOTAALOVERZICHT

## Secties per Deliverable

| Deliverable | Secties | Taken |
|-------------|---------|-------|
| D1: Foundation | 8 | 35 |
| D2: Gantt | 9 | 44 |
| D3: Calendar | 7 | 32 |
| D4: TaskBoard | 8 | 32 |
| D5: Grid | 8 | 32 |
| D6: Dashboard | 7 | 28 |
| D7: Workspace | 6 | 26 |
| D8: Auth/RBAC | 7 | 30 |
| D9: Vault | 7 | 30 |
| D10: Export | 7 | 25 |
| **Code Modules** | **74** | **314** |
| D11: Database | 7 | 31 |
| D12: Auth Config | 4 | 15 |
| D13: API Routes | 7 | 26 |
| D14: Deployment | 5 | 17 |
| **Infrastructure** | **23** | **89** |
| D15: ARCHITECTURE | 6 | 20 |
| D16: CONTRACTS | 5 | 16 |
| D17: API-DOCS | 6 | 18 |
| **Documentation** | **17** | **54** |
| M1-M7: Miro Boards | 43 | 72 |
| P1-P5: Process Docs | 29 | 72 |
| **Visual & Process** | **72** | **144** |
| | | |
| **TOTAAL** | **186** | **601** |

## Samenvatting

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT BREAKDOWN                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Outcomes:        9                                                          │
│  Key Results:   231                                                          │
│  Deliverables:   29                                                          │
│  Secties:       186                                                          │
│  Taken:         601                                                          │
│                                                                              │
│  Gemiddeld per deliverable:                                                  │
│  ├── Secties:    6.4                                                         │
│  └── Taken:     20.7                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document versie: 1.0*
*Laatst bijgewerkt: 29 December 2024*
*Outcomes: 9 | Key Results: 231 | Deliverables: 29 | Secties: 186 | Taken: 601*
