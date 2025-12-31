# Project Tasks

> **Alle taken per sectie** - de laagste niveau van de project hiërarchie.

---

## Structuur

```
Outcome → Key Result → Deliverable → Sectie → Taak
   O1   →    KR1.1   →     D1      →  S1.1  → T1.1.1
```

### Taak Definitie

Elke taak bevat:
- **ID**: Unieke identifier (T{deliverable}.{sectie}.{taak})
- **Naam**: Korte beschrijving
- **Beschrijving**: Wat moet er gebeuren
- **Acceptatiecriteria**: Wanneer is de taak klaar

### Status Legenda

| Status | Symbool | Beschrijving |
|--------|---------|--------------|
| Pending | ⬜ | Nog niet gestart |
| In Progress | 🔄 | Mee bezig |
| Done | ✅ | Afgerond |
| Blocked | 🚫 | Geblokkeerd |

---

# D1: FOUNDATION MODULE

## S1.1: Bryntum Setup

| ID | Taak | Status |
|----|------|--------|
| T1.1.1 | Bryntum packages installeren | ⬜ |
| T1.1.2 | Licentie configureren | ⬜ |
| T1.1.3 | Global config aanmaken | ⬜ |
| T1.1.4 | CSS imports opzetten | ⬜ |

### T1.1.1: Bryntum packages installeren
```
Beschrijving:
Installeer alle benodigde Bryntum packages via npm/yarn met de trial versie.

Acceptatiecriteria:
- [ ] @bryntum/gantt geïnstalleerd
- [ ] @bryntum/calendar geïnstalleerd
- [ ] @bryntum/taskboard geïnstalleerd
- [ ] @bryntum/grid geïnstalleerd
- [ ] @bryntum/core geïnstalleerd
- [ ] Geen npm install errors
- [ ] Package versions aligned (7.1.0)
```

### T1.1.2: Licentie configureren
```
Beschrijving:
Configureer de Bryntum licentie zodat er geen trial watermarks zijn.

Acceptatiecriteria:
- [ ] License key in environment variable
- [ ] License file in src/lib/bryntum/
- [ ] Geen "Trial" watermark in UI
- [ ] Licentie werkt in dev en prod
```

### T1.1.3: Global config aanmaken
```
Beschrijving:
Maak een centrale configuratie file voor Bryntum settings.

Acceptatiecriteria:
- [ ] src/lib/bryntum/config.ts bestaat
- [ ] Default locale ingesteld (nl)
- [ ] Default date format ingesteld
- [ ] Exporteerbare config object
```

### T1.1.4: CSS imports opzetten
```
Beschrijving:
Configureer de Bryntum CSS imports correct voor Next.js.

Acceptatiecriteria:
- [ ] Bryntum CSS geïmporteerd in globals
- [ ] Geen CSS conflicten
- [ ] Theme CSS laadt correct
- [ ] Fonts laden correct
```

---

## S1.2: TypeScript Types

| ID | Taak | Status |
|----|------|--------|
| T1.2.1 | Bryntum type augmentations | ⬜ |
| T1.2.2 | Project interface | ⬜ |
| T1.2.3 | Task interface | ⬜ |
| T1.2.4 | Resource interface | ⬜ |
| T1.2.5 | Calendar/Event interfaces | ⬜ |
| T1.2.6 | Dependency interface | ⬜ |

### T1.2.1: Bryntum type augmentations
```
Beschrijving:
Maak type augmentations voor Bryntum types die custom fields toevoegen.

Acceptatiecriteria:
- [ ] src/types/bryntum.d.ts bestaat
- [ ] Module augmentation voor TaskModel
- [ ] Module augmentation voor ResourceModel
- [ ] Geen TypeScript errors
```

### T1.2.2: Project interface
```
Beschrijving:
Definieer de Project interface met alle velden.

Acceptatiecriteria:
- [ ] Project interface in src/types/project.ts
- [ ] id, name, description velden
- [ ] startDate, endDate velden
- [ ] workspaceId relatie
- [ ] settings object type
- [ ] Timestamps (createdAt, updatedAt)
```

### T1.2.3: Task interface
```
Beschrijving:
Definieer de Task interface inclusief custom fields.

Acceptatiecriteria:
- [ ] Task interface in src/types/task.ts
- [ ] Standaard Bryntum velden (name, startDate, duration, etc.)
- [ ] Custom velden (priority, tags, etc.)
- [ ] parentId voor hiërarchie
- [ ] percentDone voor progress
- [ ] Constraint velden
```

### T1.2.4: Resource interface
```
Beschrijving:
Definieer de Resource interface.

Acceptatiecriteria:
- [ ] Resource interface in src/types/resource.ts
- [ ] id, name velden
- [ ] type (human, material, equipment)
- [ ] calendarId relatie
- [ ] Capacity/availability velden
```

### T1.2.5: Calendar/Event interfaces
```
Beschrijving:
Definieer Calendar en Event interfaces.

Acceptatiecriteria:
- [ ] Calendar interface (id, name, isDefault)
- [ ] CalendarEvent interface (working time intervals)
- [ ] Event interface voor Calendar view
- [ ] Recurrence rule type
```

### T1.2.6: Dependency interface
```
Beschrijving:
Definieer de Dependency interface.

Acceptatiecriteria:
- [ ] Dependency interface in src/types/dependency.ts
- [ ] fromTask, toTask relaties
- [ ] type (FS, FF, SS, SF)
- [ ] lag veld
- [ ] lagUnit veld
```

---

## S1.3: ProjectModel

| ID | Taak | Status |
|----|------|--------|
| T1.3.1 | Extended ProjectModel class | ⬜ |
| T1.3.2 | TaskStore configuratie | ⬜ |
| T1.3.3 | ResourceStore configuratie | ⬜ |
| T1.3.4 | DependencyStore configuratie | ⬜ |
| T1.3.5 | AssignmentStore configuratie | ⬜ |
| T1.3.6 | CalendarStore configuratie | ⬜ |

### T1.3.1: Extended ProjectModel class
```
Beschrijving:
Maak een extended ProjectModel class met custom configuratie.

Acceptatiecriteria:
- [ ] src/models/ProjectModel.ts bestaat
- [ ] Extends Bryntum ProjectModel
- [ ] TypeScript generics voor stores
- [ ] Default configuratie
- [ ] Singleton of factory pattern
```

### T1.3.2: TaskStore configuratie
```
Beschrijving:
Configureer de TaskStore met custom fields en tree structuur.

Acceptatiecriteria:
- [ ] TaskStore configuratie in ProjectModel
- [ ] Tree: true voor hiërarchie
- [ ] Custom fields geregistreerd
- [ ] Sortering configuratie
```

### T1.3.3: ResourceStore configuratie
```
Beschrijving:
Configureer de ResourceStore.

Acceptatiecriteria:
- [ ] ResourceStore configuratie
- [ ] Custom fields geregistreerd
- [ ] Grouping by type mogelijk
```

### T1.3.4: DependencyStore configuratie
```
Beschrijving:
Configureer de DependencyStore.

Acceptatiecriteria:
- [ ] DependencyStore configuratie
- [ ] Alle dependency types ondersteund
- [ ] Validation voor cycles
```

### T1.3.5: AssignmentStore configuratie
```
Beschrijving:
Configureer de AssignmentStore voor resource assignments.

Acceptatiecriteria:
- [ ] AssignmentStore configuratie
- [ ] Units veld ondersteund
- [ ] Multi-assignment mogelijk
```

### T1.3.6: CalendarStore configuratie
```
Beschrijving:
Configureer de CalendarStore voor working time.

Acceptatiecriteria:
- [ ] CalendarStore configuratie
- [ ] Default calendar ingesteld
- [ ] Non-working days configureerbaar
```

---

## S1.4: CrudManager

| ID | Taak | Status |
|----|------|--------|
| T1.4.1 | CrudManager base configuratie | ⬜ |
| T1.4.2 | Sync URL endpoints | ⬜ |
| T1.4.3 | Request/response transformers | ⬜ |
| T1.4.4 | Error handling | ⬜ |

### T1.4.1: CrudManager base configuratie
```
Beschrijving:
Configureer de CrudManager voor data synchronisatie.

Acceptatiecriteria:
- [ ] src/services/CrudManager.ts bestaat
- [ ] Transport configuratie (fetch)
- [ ] Auto-sync disabled (manual control)
- [ ] Batch updates enabled
```

### T1.4.2: Sync URL endpoints
```
Beschrijving:
Definieer de sync endpoints voor CrudManager.

Acceptatiecriteria:
- [ ] Load URL: /api/sync
- [ ] Sync URL: /api/sync
- [ ] Per-store URLs indien nodig
- [ ] Environment-aware URLs
```

### T1.4.3: Request/response transformers
```
Beschrijving:
Maak transformers voor request/response data formatting.

Acceptatiecriteria:
- [ ] Request encoder (camelCase → snake_case)
- [ ] Response decoder (snake_case → camelCase)
- [ ] Date formatting
- [ ] Null handling
```

### T1.4.4: Error handling
```
Beschrijving:
Implementeer error handling voor sync operaties.

Acceptatiecriteria:
- [ ] Sync error events afgevangen
- [ ] User-friendly error messages
- [ ] Retry logic voor timeouts
- [ ] Conflict resolution strategy
```

---

## S1.5: Theme System

| ID | Taak | Status |
|----|------|--------|
| T1.5.1 | CSS custom properties | ⬜ |
| T1.5.2 | Light theme | ⬜ |
| T1.5.3 | Dark theme | ⬜ |
| T1.5.4 | Bryntum overrides | ⬜ |
| T1.5.5 | Theme persistence | ⬜ |

### T1.5.1: CSS custom properties
```
Beschrijving:
Definieer CSS custom properties voor theming.

Acceptatiecriteria:
- [ ] src/styles/variables.css bestaat
- [ ] Color variables (primary, secondary, etc.)
- [ ] Spacing variables
- [ ] Typography variables
- [ ] Border/shadow variables
```

### T1.5.2: Light theme
```
Beschrijving:
Definieer light theme variabelen.

Acceptatiecriteria:
- [ ] Light color palette
- [ ] Background colors
- [ ] Text colors
- [ ] Border colors
- [ ] data-theme="light" selector
```

### T1.5.3: Dark theme
```
Beschrijving:
Definieer dark theme variabelen.

Acceptatiecriteria:
- [ ] Dark color palette
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Background colors
- [ ] Text colors
- [ ] data-theme="dark" selector
```

### T1.5.4: Bryntum overrides
```
Beschrijving:
Override Bryntum styling om te matchen met theme.

Acceptatiecriteria:
- [ ] src/styles/bryntum-overrides.css bestaat
- [ ] Toolbar styling matched
- [ ] Grid styling matched
- [ ] Event/task colors configurable
- [ ] No !important waar mogelijk
```

### T1.5.5: Theme persistence
```
Beschrijving:
Persist theme keuze in localStorage.

Acceptatiecriteria:
- [ ] Theme saved to localStorage
- [ ] Theme loaded on page load
- [ ] System preference detection
- [ ] No flash of wrong theme
```

---

## S1.6: Shared Components

| ID | Taak | Status |
|----|------|--------|
| T1.6.1 | ErrorBoundary | ⬜ |
| T1.6.2 | LoadingSpinner | ⬜ |
| T1.6.3 | Skeleton loaders | ⬜ |
| T1.6.4 | EmptyState | ⬜ |

### T1.6.1: ErrorBoundary
```
Beschrijving:
React Error Boundary component voor error catching.

Acceptatiecriteria:
- [ ] src/components/shared/ErrorBoundary.tsx
- [ ] Catches render errors
- [ ] Displays fallback UI
- [ ] Error logging
- [ ] Reset functionality
```

### T1.6.2: LoadingSpinner
```
Beschrijving:
Loading spinner component.

Acceptatiecriteria:
- [ ] src/components/shared/LoadingSpinner.tsx
- [ ] Multiple sizes (sm, md, lg)
- [ ] Customizable color
- [ ] Accessible (aria-label)
```

### T1.6.3: Skeleton loaders
```
Beschrijving:
Skeleton loader components voor loading states.

Acceptatiecriteria:
- [ ] src/components/shared/Skeleton.tsx
- [ ] Text skeleton
- [ ] Card skeleton
- [ ] Table skeleton
- [ ] Animation
```

### T1.6.4: EmptyState
```
Beschrijving:
Empty state component voor lege lijsten.

Acceptatiecriteria:
- [ ] src/components/shared/EmptyState.tsx
- [ ] Icon prop
- [ ] Title prop
- [ ] Description prop
- [ ] Action button prop
```

---

## S1.7: Providers

| ID | Taak | Status |
|----|------|--------|
| T1.7.1 | BryntumProvider | ⬜ |
| T1.7.2 | ThemeProvider | ⬜ |
| T1.7.3 | Provider composition | ⬜ |

### T1.7.1: BryntumProvider
```
Beschrijving:
React context provider voor ProjectModel.

Acceptatiecriteria:
- [ ] src/providers/BryntumProvider.tsx
- [ ] ProjectModel in context
- [ ] Loading state management
- [ ] Error state management
- [ ] Re-render optimization
```

### T1.7.2: ThemeProvider
```
Beschrijving:
Theme context provider.

Acceptatiecriteria:
- [ ] src/providers/ThemeProvider.tsx
- [ ] Current theme in context
- [ ] Toggle function
- [ ] System preference sync
```

### T1.7.3: Provider composition
```
Beschrijving:
Compose all providers in app layout.

Acceptatiecriteria:
- [ ] Providers in correct order
- [ ] app/providers.tsx of layout.tsx
- [ ] Client component waar nodig
- [ ] Server/client boundary correct
```

---

## S1.8: Hooks

| ID | Taak | Status |
|----|------|--------|
| T1.8.1 | useProject hook | ⬜ |
| T1.8.2 | useTheme hook | ⬜ |
| T1.8.3 | useSync hook | ⬜ |
| T1.8.4 | Utility hooks | ⬜ |

### T1.8.1: useProject hook
```
Beschrijving:
Hook voor toegang tot ProjectModel.

Acceptatiecriteria:
- [ ] src/hooks/useProject.ts
- [ ] Returns project, tasks, resources
- [ ] Loading state
- [ ] Error state
- [ ] Refetch function
```

### T1.8.2: useTheme hook
```
Beschrijving:
Hook voor theme toegang en toggle.

Acceptatiecriteria:
- [ ] src/hooks/useTheme.ts
- [ ] Returns theme value
- [ ] Toggle function
- [ ] setTheme function
```

### T1.8.3: useSync hook
```
Beschrijving:
Hook voor data synchronisatie.

Acceptatiecriteria:
- [ ] src/hooks/useSync.ts
- [ ] Sync function
- [ ] isSyncing state
- [ ] Last sync timestamp
- [ ] Sync error state
```

### T1.8.4: Utility hooks
```
Beschrijving:
Algemene utility hooks.

Acceptatiecriteria:
- [ ] useLocalStorage hook
- [ ] useDebounce hook
- [ ] useMediaQuery hook
- [ ] usePrevious hook
```

---

# D2: GANTT MODULE

## S2.1: Gantt Component

| ID | Taak | Status |
|----|------|--------|
| T2.1.1 | BryntumGantt wrapper | ⬜ |
| T2.1.2 | Gantt configuratie | ⬜ |
| T2.1.3 | ProjectModel binding | ⬜ |
| T2.1.4 | Gantt page route | ⬜ |

### T2.1.1: BryntumGantt wrapper
```
Beschrijving:
React wrapper component voor BryntumGantt.

Acceptatiecriteria:
- [ ] src/features/gantt/components/GanttChart.tsx
- [ ] Forwarded ref voor Gantt instance
- [ ] Props interface gedefinieerd
- [ ] Cleanup op unmount
- [ ] TypeScript types correct
```

### T2.1.2: Gantt configuratie
```
Beschrijving:
Configuratie object voor Gantt.

Acceptatiecriteria:
- [ ] src/features/gantt/config/gantt.ts
- [ ] Features configuratie
- [ ] Column configuratie
- [ ] View preset configuratie
- [ ] Toolbar items
```

### T2.1.3: ProjectModel binding
```
Beschrijving:
Bind ProjectModel aan Gantt component.

Acceptatiecriteria:
- [ ] Project prop op GanttChart
- [ ] Auto-update bij data changes
- [ ] Bi-directional sync
- [ ] Performance optimized
```

### T2.1.4: Gantt page route
```
Beschrijving:
Next.js page voor Gantt view.

Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/[projectId]/gantt/page.tsx
- [ ] Server component waar mogelijk
- [ ] Loading state
- [ ] Error handling
```

---

## S2.2: Gantt Toolbar

| ID | Taak | Status |
|----|------|--------|
| T2.2.1 | Toolbar component | ⬜ |
| T2.2.2 | Zoom controls | ⬜ |
| T2.2.3 | View preset selector | ⬜ |
| T2.2.4 | Filter dropdown | ⬜ |
| T2.2.5 | Export button | ⬜ |
| T2.2.6 | Undo/Redo buttons | ⬜ |

### T2.2.1: Toolbar component
```
Beschrijving:
Toolbar component boven Gantt.

Acceptatiecriteria:
- [ ] src/features/gantt/components/GanttToolbar.tsx
- [ ] Responsive layout
- [ ] Grouped actions
- [ ] Keyboard accessible
```

### T2.2.2: Zoom controls
```
Beschrijving:
Zoom in/out/fit controls.

Acceptatiecriteria:
- [ ] Zoom in button (+)
- [ ] Zoom out button (-)
- [ ] Zoom to fit button
- [ ] Zoom level indicator
- [ ] Keyboard shortcuts (Ctrl+/-)
```

### T2.2.3: View preset selector
```
Beschrijving:
Dropdown voor view presets (dag/week/maand).

Acceptatiecriteria:
- [ ] Dropdown component
- [ ] Presets: hourAndDay, weekAndDay, monthAndYear
- [ ] Current selection shown
- [ ] Smooth transition
```

### T2.2.4: Filter dropdown
```
Beschrijving:
Filter taken op status/assignee/etc.

Acceptatiecriteria:
- [ ] Filter dropdown component
- [ ] Filter by status
- [ ] Filter by assignee
- [ ] Filter by date range
- [ ] Clear filters button
```

### T2.2.5: Export button
```
Beschrijving:
Export button met format opties.

Acceptatiecriteria:
- [ ] Export dropdown
- [ ] PDF optie
- [ ] Excel optie
- [ ] PNG optie
- [ ] Opens export dialog
```

### T2.2.6: Undo/Redo buttons
```
Beschrijving:
Undo en Redo buttons voor STM.

Acceptatiecriteria:
- [ ] Undo button
- [ ] Redo button
- [ ] Disabled state wanneer niet beschikbaar
- [ ] Keyboard shortcuts (Ctrl+Z/Y)
```

---

## S2.3: Task Management

| ID | Taak | Status |
|----|------|--------|
| T2.3.1 | Task create (toolbar) | ⬜ |
| T2.3.2 | Task create (drag) | ⬜ |
| T2.3.3 | Task update (inline) | ⬜ |
| T2.3.4 | Task delete | ⬜ |
| T2.3.5 | Task drag & drop | ⬜ |
| T2.3.6 | Task resize | ⬜ |
| T2.3.7 | Task indent/outdent | ⬜ |

### T2.3.1: Task create (toolbar)
```
Beschrijving:
Nieuwe taak aanmaken via toolbar button.

Acceptatiecriteria:
- [ ] Add task button in toolbar
- [ ] Opens task editor dialog
- [ ] Default values ingevuld
- [ ] Taak toegevoegd aan store
```

### T2.3.2: Task create (drag)
```
Beschrijving:
Nieuwe taak aanmaken door te draggen in timeline.

Acceptatiecriteria:
- [ ] TaskDragCreate feature enabled
- [ ] Drag in empty area creates task
- [ ] Start/end date van drag positie
- [ ] Opens editor na create
```

### T2.3.3: Task update (inline)
```
Beschrijving:
Inline editing van task velden in grid.

Acceptatiecriteria:
- [ ] CellEdit feature enabled
- [ ] Double-click to edit
- [ ] Tab to next cell
- [ ] Enter to confirm
- [ ] Escape to cancel
```

### T2.3.4: Task delete
```
Beschrijving:
Taak verwijderen via context menu of keyboard.

Acceptatiecriteria:
- [ ] Delete in context menu
- [ ] Delete key shortcut
- [ ] Confirmation dialog
- [ ] Cascade delete children (optioneel)
```

### T2.3.5: Task drag & drop
```
Beschrijving:
Taak verplaatsen door te draggen.

Acceptatiecriteria:
- [ ] TaskDrag feature enabled
- [ ] Drag in timeline = reschedule
- [ ] Drag in grid = reorder
- [ ] Visual feedback tijdens drag
- [ ] Constraints respected
```

### T2.3.6: Task resize
```
Beschrijving:
Task duration aanpassen door te resizen.

Acceptatiecriteria:
- [ ] TaskResize feature enabled
- [ ] Resize van links = start date
- [ ] Resize van rechts = end date/duration
- [ ] Minimum duration enforced
```

### T2.3.7: Task indent/outdent
```
Beschrijving:
Task hiërarchie aanpassen.

Acceptatiecriteria:
- [ ] Indent button/shortcut
- [ ] Outdent button/shortcut
- [ ] Context menu options
- [ ] Parent-child relationship updated
```

---

## S2.4: Dependencies

| ID | Taak | Status |
|----|------|--------|
| T2.4.1 | Dependency rendering | ⬜ |
| T2.4.2 | Dependency types | ⬜ |
| T2.4.3 | Dependency create | ⬜ |
| T2.4.4 | Dependency edit | ⬜ |
| T2.4.5 | Dependency delete | ⬜ |

### T2.4.1: Dependency rendering
```
Beschrijving:
Render dependency lines tussen tasks.

Acceptatiecriteria:
- [ ] Dependencies feature enabled
- [ ] Lines correct gepositioneerd
- [ ] Arrow heads tonen richting
- [ ] Styling configureerbaar
- [ ] Hover effect
```

### T2.4.2: Dependency types
```
Beschrijving:
Ondersteuning voor alle dependency types.

Acceptatiecriteria:
- [ ] FS (Finish-to-Start) - default
- [ ] FF (Finish-to-Finish)
- [ ] SS (Start-to-Start)
- [ ] SF (Start-to-Finish)
- [ ] Visueel onderscheid per type
```

### T2.4.3: Dependency create
```
Beschrijving:
Nieuwe dependency aanmaken door te draggen.

Acceptatiecriteria:
- [ ] Drag from task terminal
- [ ] Drop op andere task
- [ ] Visual feedback tijdens drag
- [ ] Default type FS
- [ ] Cycle detection
```

### T2.4.4: Dependency edit
```
Beschrijving:
Dependency properties bewerken.

Acceptatiecriteria:
- [ ] Double-click dependency line
- [ ] Edit dialog opent
- [ ] Type wijzigen
- [ ] Lag wijzigen
- [ ] Save/cancel
```

### T2.4.5: Dependency delete
```
Beschrijving:
Dependency verwijderen.

Acceptatiecriteria:
- [ ] Right-click dependency line
- [ ] Delete option in menu
- [ ] Keyboard shortcut
- [ ] No confirmation (snel te herstellen)
```

---

## S2.5: Task Editor

| ID | Taak | Status |
|----|------|--------|
| T2.5.1 | Task editor dialog | ⬜ |
| T2.5.2 | General tab | ⬜ |
| T2.5.3 | Dependencies tab | ⬜ |
| T2.5.4 | Resources tab | ⬜ |
| T2.5.5 | Notes tab | ⬜ |
| T2.5.6 | Validation | ⬜ |

### T2.5.1: Task editor dialog
```
Beschrijving:
Modal dialog voor task editing.

Acceptatiecriteria:
- [ ] src/features/gantt/components/TaskEditor.tsx
- [ ] Tabbed interface
- [ ] Close button
- [ ] Save/Cancel buttons
- [ ] Keyboard navigation
```

### T2.5.2: General tab
```
Beschrijving:
Algemene task properties.

Acceptatiecriteria:
- [ ] Name field
- [ ] Start date picker
- [ ] End date picker
- [ ] Duration field
- [ ] Progress slider
- [ ] Priority dropdown
- [ ] Status dropdown
```

### T2.5.3: Dependencies tab
```
Beschrijving:
Dependency management in editor.

Acceptatiecriteria:
- [ ] List of predecessors
- [ ] List of successors
- [ ] Add dependency button
- [ ] Remove dependency button
- [ ] Edit dependency inline
```

### T2.5.4: Resources tab
```
Beschrijving:
Resource assignment in editor.

Acceptatiecriteria:
- [ ] Assigned resources list
- [ ] Add resource dropdown
- [ ] Units percentage
- [ ] Remove assignment
```

### T2.5.5: Notes tab
```
Beschrijving:
Notities en beschrijving.

Acceptatiecriteria:
- [ ] Description textarea
- [ ] Rich text editor (optioneel)
- [ ] Auto-save
```

### T2.5.6: Validation
```
Beschrijving:
Form validatie voor task editor.

Acceptatiecriteria:
- [ ] Required fields validation
- [ ] Date range validation
- [ ] Duration > 0 validation
- [ ] Error messages tonen
- [ ] Prevent save on errors
```

---

## S2.6: Critical Path

| ID | Taak | Status |
|----|------|--------|
| T2.6.1 | Critical path feature | ⬜ |
| T2.6.2 | Critical path styling | ⬜ |
| T2.6.3 | Critical path toggle | ⬜ |

### T2.6.1: Critical path feature
```
Beschrijving:
Enable critical path berekening.

Acceptatiecriteria:
- [ ] CriticalPaths feature enabled
- [ ] Automatic calculation
- [ ] Updates on changes
- [ ] Performance acceptable
```

### T2.6.2: Critical path styling
```
Beschrijving:
Styling voor critical path tasks.

Acceptatiecriteria:
- [ ] Distinct color voor critical tasks
- [ ] Border of fill style
- [ ] Legend item
- [ ] Configurable colors
```

### T2.6.3: Critical path toggle
```
Beschrijving:
Toggle button voor critical path visibility.

Acceptatiecriteria:
- [ ] Toggle button in toolbar
- [ ] State persisted
- [ ] Visual feedback
- [ ] Keyboard shortcut
```

---

## S2.7: Baselines

| ID | Taak | Status |
|----|------|--------|
| T2.7.1 | Baseline create | ⬜ |
| T2.7.2 | Baseline toggle | ⬜ |
| T2.7.3 | Baseline rendering | ⬜ |
| T2.7.4 | Baseline selection | ⬜ |

### T2.7.1: Baseline create
```
Beschrijving:
Nieuwe baseline aanmaken.

Acceptatiecriteria:
- [ ] Save baseline button
- [ ] Baseline name input
- [ ] Snapshot van current data
- [ ] Stored in database
```

### T2.7.2: Baseline toggle
```
Beschrijving:
Toggle baseline visibility.

Acceptatiecriteria:
- [ ] Show/hide baseline toggle
- [ ] In toolbar
- [ ] State persisted
```

### T2.7.3: Baseline rendering
```
Beschrijving:
Render baseline bars achter actual bars.

Acceptatiecriteria:
- [ ] Baselines feature enabled
- [ ] Different color dan actual
- [ ] Semi-transparent
- [ ] Tooltip met baseline data
```

### T2.7.4: Baseline selection
```
Beschrijving:
Selecteer welke baseline te tonen.

Acceptatiecriteria:
- [ ] Dropdown met saved baselines
- [ ] Baseline date shown
- [ ] Quick switch mogelijk
```

---

## S2.8: Column Config

| ID | Taak | Status |
|----|------|--------|
| T2.8.1 | Column definitions | ⬜ |
| T2.8.2 | Column reorder | ⬜ |
| T2.8.3 | Column resize | ⬜ |
| T2.8.4 | Column visibility | ⬜ |

### T2.8.1: Column definitions
```
Beschrijving:
Definieer alle grid columns.

Acceptatiecriteria:
- [ ] src/features/gantt/config/columns.ts
- [ ] Name column
- [ ] Start date column
- [ ] End date column
- [ ] Duration column
- [ ] Progress column
- [ ] Resource column
- [ ] Custom columns support
```

### T2.8.2: Column reorder
```
Beschrijving:
Columns herordenen door te draggen.

Acceptatiecriteria:
- [ ] ColumnReorder feature enabled
- [ ] Drag column header
- [ ] Visual drop indicator
- [ ] Order persisted
```

### T2.8.3: Column resize
```
Beschrijving:
Column breedte aanpassen.

Acceptatiecriteria:
- [ ] ColumnResize feature enabled
- [ ] Drag column edge
- [ ] Double-click auto-fit
- [ ] Minimum width
- [ ] Width persisted
```

### T2.8.4: Column visibility
```
Beschrijving:
Columns tonen/verbergen.

Acceptatiecriteria:
- [ ] Column picker button
- [ ] Checkbox list
- [ ] Show/hide per column
- [ ] State persisted
```

---

## S2.9: Gantt Features

| ID | Taak | Status |
|----|------|--------|
| T2.9.1 | Progress line | ⬜ |
| T2.9.2 | Task labels | ⬜ |
| T2.9.3 | Task indicators | ⬜ |
| T2.9.4 | Non-working time | ⬜ |
| T2.9.5 | Time ranges | ⬜ |

### T2.9.1: Progress line
```
Beschrijving:
Verticale lijn voor huidige datum/progress.

Acceptatiecriteria:
- [ ] ProgressLine feature enabled
- [ ] Line op current date
- [ ] Configurable style
- [ ] Toggle visibility
```

### T2.9.2: Task labels
```
Beschrijving:
Labels op task bars.

Acceptatiecriteria:
- [ ] Labels feature enabled
- [ ] Left label (task name)
- [ ] Right label (duration/progress)
- [ ] Label templates
- [ ] Configurable positions
```

### T2.9.3: Task indicators
```
Beschrijving:
Icons op task bars voor status.

Acceptatiecriteria:
- [ ] Indicators feature enabled
- [ ] Late task indicator
- [ ] Constraint indicator
- [ ] Note indicator
- [ ] Custom indicators
```

### T2.9.4: Non-working time
```
Beschrijving:
Visualisatie van non-working time.

Acceptatiecriteria:
- [ ] NonWorkingTime feature enabled
- [ ] Weekends highlighted
- [ ] Holidays highlighted
- [ ] Configurable colors
```

### T2.9.5: Time ranges
```
Beschrijving:
Highlight specifieke periodes.

Acceptatiecriteria:
- [ ] TimeRanges feature enabled
- [ ] Named ranges (sprints, phases)
- [ ] Visual highlighting
- [ ] Header labels
```

---

# D3: CALENDAR MODULE

## S3.1: Calendar Component

| ID | Taak | Status |
|----|------|--------|
| T3.1.1 | BryntumCalendar wrapper | ⬜ |
| T3.1.2 | Calendar configuratie | ⬜ |
| T3.1.3 | EventStore binding | ⬜ |
| T3.1.4 | Calendar page route | ⬜ |

### T3.1.1: BryntumCalendar wrapper
```
Acceptatiecriteria:
- [ ] src/features/calendar/components/CalendarView.tsx
- [ ] Forwarded ref
- [ ] Props interface
- [ ] Cleanup op unmount
```

### T3.1.2: Calendar configuratie
```
Acceptatiecriteria:
- [ ] src/features/calendar/config/calendar.ts
- [ ] Default view mode
- [ ] Date format
- [ ] Time format
- [ ] First day of week
```

### T3.1.3: EventStore binding
```
Acceptatiecriteria:
- [ ] Events from ProjectModel
- [ ] Bi-directional sync
- [ ] Resource filtering
```

### T3.1.4: Calendar page route
```
Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/[projectId]/calendar/page.tsx
- [ ] Loading state
- [ ] Error handling
```

---

## S3.2: Calendar Toolbar

| ID | Taak | Status |
|----|------|--------|
| T3.2.1 | Toolbar component | ⬜ |
| T3.2.2 | View mode switcher | ⬜ |
| T3.2.3 | Date navigation | ⬜ |
| T3.2.4 | Date range display | ⬜ |
| T3.2.5 | Create event button | ⬜ |

### T3.2.1: Toolbar component
```
Acceptatiecriteria:
- [ ] src/features/calendar/components/CalendarToolbar.tsx
- [ ] Responsive layout
- [ ] Consistent styling
```

### T3.2.2: View mode switcher
```
Acceptatiecriteria:
- [ ] Day/Week/Month/Year buttons
- [ ] Agenda view button
- [ ] Active state styling
- [ ] Keyboard shortcuts
```

### T3.2.3: Date navigation
```
Acceptatiecriteria:
- [ ] Previous button
- [ ] Next button
- [ ] Today button
- [ ] Navigate to specific date
```

### T3.2.4: Date range display
```
Acceptatiecriteria:
- [ ] Current date/range shown
- [ ] Formatted per view mode
- [ ] Clickable for date picker
```

### T3.2.5: Create event button
```
Acceptatiecriteria:
- [ ] + button prominent
- [ ] Opens event editor
- [ ] Default to current date
```

---

## S3.3: View Modes

| ID | Taak | Status |
|----|------|--------|
| T3.3.1 | Day view | ⬜ |
| T3.3.2 | Week view | ⬜ |
| T3.3.3 | Month view | ⬜ |
| T3.3.4 | Year view | ⬜ |
| T3.3.5 | Agenda view | ⬜ |

### T3.3.1: Day view
```
Acceptatiecriteria:
- [ ] 24-hour timeline
- [ ] Hour slots
- [ ] Events positioned by time
- [ ] All-day section
- [ ] Current time indicator
```

### T3.3.2: Week view
```
Acceptatiecriteria:
- [ ] 7 day columns
- [ ] Hour rows
- [ ] Events span correct days
- [ ] Week number shown
```

### T3.3.3: Month view
```
Acceptatiecriteria:
- [ ] Calendar grid
- [ ] Events as pills
- [ ] +N more indicator
- [ ] Click to expand day
```

### T3.3.4: Year view
```
Acceptatiecriteria:
- [ ] 12 month grid
- [ ] Events indicated
- [ ] Click to drill down
```

### T3.3.5: Agenda view
```
Acceptatiecriteria:
- [ ] List of events
- [ ] Grouped by date
- [ ] Scrollable
- [ ] Click to edit
```

---

## S3.4: Event Management

| ID | Taak | Status |
|----|------|--------|
| T3.4.1 | Event create (click) | ⬜ |
| T3.4.2 | Event create (drag) | ⬜ |
| T3.4.3 | Event update (inline) | ⬜ |
| T3.4.4 | Event delete | ⬜ |
| T3.4.5 | Event drag & drop | ⬜ |
| T3.4.6 | Event resize | ⬜ |

### T3.4.1: Event create (click)
```
Acceptatiecriteria:
- [ ] Click empty slot creates event
- [ ] Time based on click position
- [ ] Opens editor
```

### T3.4.2: Event create (drag)
```
Acceptatiecriteria:
- [ ] Drag to select time range
- [ ] Visual feedback
- [ ] Creates event with duration
```

### T3.4.3: Event update (inline)
```
Acceptatiecriteria:
- [ ] Click event to select
- [ ] Quick edit popup
- [ ] Double-click for full editor
```

### T3.4.4: Event delete
```
Acceptatiecriteria:
- [ ] Delete key shortcut
- [ ] Context menu option
- [ ] Recurrence handling
```

### T3.4.5: Event drag & drop
```
Acceptatiecriteria:
- [ ] Drag to reschedule
- [ ] Drag between days
- [ ] Visual feedback
- [ ] Constraints respected
```

### T3.4.6: Event resize
```
Acceptatiecriteria:
- [ ] Drag edges to resize
- [ ] Minimum duration
- [ ] Snap to intervals
```

---

## S3.5: Event Editor

| ID | Taak | Status |
|----|------|--------|
| T3.5.1 | Event editor dialog | ⬜ |
| T3.5.2 | Basic fields | ⬜ |
| T3.5.3 | All-day toggle | ⬜ |
| T3.5.4 | Recurrence editor | ⬜ |
| T3.5.5 | Resource assignment | ⬜ |

### T3.5.1: Event editor dialog
```
Acceptatiecriteria:
- [ ] src/features/calendar/components/EventEditor.tsx
- [ ] Modal dialog
- [ ] Save/Cancel/Delete buttons
```

### T3.5.2: Basic fields
```
Acceptatiecriteria:
- [ ] Event name
- [ ] Start date/time
- [ ] End date/time
- [ ] Location
- [ ] Description
- [ ] Color picker
```

### T3.5.3: All-day toggle
```
Acceptatiecriteria:
- [ ] All-day checkbox
- [ ] Hides time pickers when checked
- [ ] Duration in days
```

### T3.5.4: Recurrence editor
```
Acceptatiecriteria:
- [ ] Repeat dropdown
- [ ] Daily/Weekly/Monthly/Yearly
- [ ] End conditions (count, until)
- [ ] Exception handling
```

### T3.5.5: Resource assignment
```
Acceptatiecriteria:
- [ ] Resource dropdown
- [ ] Multi-select
- [ ] Resource availability check
```

---

## S3.6: Sidebar

| ID | Taak | Status |
|----|------|--------|
| T3.6.1 | Sidebar component | ⬜ |
| T3.6.2 | Mini calendar | ⬜ |
| T3.6.3 | Resource filter | ⬜ |
| T3.6.4 | Calendar filter | ⬜ |

### T3.6.1: Sidebar component
```
Acceptatiecriteria:
- [ ] src/features/calendar/components/CalendarSidebar.tsx
- [ ] Collapsible
- [ ] Responsive
```

### T3.6.2: Mini calendar
```
Acceptatiecriteria:
- [ ] Small month view
- [ ] Click date to navigate
- [ ] Highlight days with events
- [ ] Current date indicator
```

### T3.6.3: Resource filter
```
Acceptatiecriteria:
- [ ] Checkbox list
- [ ] Resource colors
- [ ] Select all/none
- [ ] Filter persisted
```

### T3.6.4: Calendar filter
```
Acceptatiecriteria:
- [ ] Multiple calendars support
- [ ] Show/hide per calendar
- [ ] Calendar colors
```

---

## S3.7: Resource View

| ID | Taak | Status |
|----|------|--------|
| T3.7.1 | Resource view mode | ⬜ |
| T3.7.2 | Resource grouping | ⬜ |
| T3.7.3 | Resource capacity | ⬜ |

### T3.7.1: Resource view mode
```
Acceptatiecriteria:
- [ ] Horizontal resource layout
- [ ] Resource column/row
- [ ] Events per resource
```

### T3.7.2: Resource grouping
```
Acceptatiecriteria:
- [ ] Group by resource type
- [ ] Collapsible groups
```

### T3.7.3: Resource capacity
```
Acceptatiecriteria:
- [ ] Capacity indicator
- [ ] Overallocation warning
- [ ] Availability display
```

---

# D4: TASKBOARD MODULE

## S4.1: TaskBoard Component

| ID | Taak | Status |
|----|------|--------|
| T4.1.1 | BryntumTaskBoard wrapper | ⬜ |
| T4.1.2 | TaskBoard configuratie | ⬜ |
| T4.1.3 | ProjectModel binding | ⬜ |
| T4.1.4 | TaskBoard page route | ⬜ |

### T4.1.1: BryntumTaskBoard wrapper
```
Acceptatiecriteria:
- [ ] src/features/taskboard/components/TaskBoard.tsx
- [ ] Forwarded ref
- [ ] Props interface
```

### T4.1.2: TaskBoard configuratie
```
Acceptatiecriteria:
- [ ] src/features/taskboard/config/taskboard.ts
- [ ] Column definitions
- [ ] Card fields
- [ ] Features
```

### T4.1.3: ProjectModel binding
```
Acceptatiecriteria:
- [ ] Tasks from ProjectModel
- [ ] Status → column mapping
- [ ] Bi-directional sync
```

### T4.1.4: TaskBoard page route
```
Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/[projectId]/taskboard/page.tsx
- [ ] Loading/error states
```

---

## S4.2: TaskBoard Toolbar

| ID | Taak | Status |
|----|------|--------|
| T4.2.1 | Toolbar component | ⬜ |
| T4.2.2 | Filter bar | ⬜ |
| T4.2.3 | Search field | ⬜ |
| T4.2.4 | View options | ⬜ |

### T4.2.1: Toolbar component
```
Acceptatiecriteria:
- [ ] src/features/taskboard/components/TaskBoardToolbar.tsx
- [ ] Above board layout
```

### T4.2.2: Filter bar
```
Acceptatiecriteria:
- [ ] Filter by assignee
- [ ] Filter by priority
- [ ] Filter by tags
- [ ] Active filters shown
```

### T4.2.3: Search field
```
Acceptatiecriteria:
- [ ] Search input
- [ ] Search by task name
- [ ] Real-time filtering
- [ ] Clear button
```

### T4.2.4: View options
```
Acceptatiecriteria:
- [ ] Compact/Normal toggle
- [ ] Show/hide fields toggle
- [ ] Board density options
```

---

## S4.3: Columns

| ID | Taak | Status |
|----|------|--------|
| T4.3.1 | Column definitions | ⬜ |
| T4.3.2 | Column headers | ⬜ |
| T4.3.3 | Column collapse | ⬜ |
| T4.3.4 | Column add/remove | ⬜ |
| T4.3.5 | Column reorder | ⬜ |

### T4.3.1: Column definitions
```
Acceptatiecriteria:
- [ ] src/features/taskboard/config/columns.ts
- [ ] Default columns (To Do, In Progress, Done)
- [ ] Status mapping
- [ ] Colors per column
```

### T4.3.2: Column headers
```
Acceptatiecriteria:
- [ ] Column title
- [ ] Task count
- [ ] WIP indicator
- [ ] Column menu
```

### T4.3.3: Column collapse
```
Acceptatiecriteria:
- [ ] Collapse button
- [ ] Collapsed state saved
- [ ] Show count when collapsed
```

### T4.3.4: Column add/remove
```
Acceptatiecriteria:
- [ ] Add column button
- [ ] Column configuration dialog
- [ ] Delete column (with tasks move)
```

### T4.3.5: Column reorder
```
Acceptatiecriteria:
- [ ] Drag column header
- [ ] Reorder columns
- [ ] Save order
```

---

## S4.4: Cards

| ID | Taak | Status |
|----|------|--------|
| T4.4.1 | Card template | ⬜ |
| T4.4.2 | Card fields | ⬜ |
| T4.4.3 | Card tags | ⬜ |
| T4.4.4 | Card progress | ⬜ |
| T4.4.5 | Card colors | ⬜ |

### T4.4.1: Card template
```
Acceptatiecriteria:
- [ ] src/features/taskboard/components/TaskCard.tsx
- [ ] Card layout
- [ ] Hover state
- [ ] Selected state
```

### T4.4.2: Card fields
```
Acceptatiecriteria:
- [ ] Task name (title)
- [ ] Assignee avatar
- [ ] Due date
- [ ] Priority indicator
```

### T4.4.3: Card tags
```
Acceptatiecriteria:
- [ ] Tags display
- [ ] Tag colors
- [ ] Max tags shown
- [ ] +N more indicator
```

### T4.4.4: Card progress
```
Acceptatiecriteria:
- [ ] Progress bar
- [ ] Percentage display
- [ ] Color based on progress
```

### T4.4.5: Card colors
```
Acceptatiecriteria:
- [ ] Color strip/border
- [ ] Based on priority
- [ ] Or custom color
```

---

## S4.5: Drag & Drop

| ID | Taak | Status |
|----|------|--------|
| T4.5.1 | Card drag between columns | ⬜ |
| T4.5.2 | Card reorder in column | ⬜ |
| T4.5.3 | Multi-select drag | ⬜ |
| T4.5.4 | Drop validation | ⬜ |

### T4.5.1: Card drag between columns
```
Acceptatiecriteria:
- [ ] Drag card to other column
- [ ] Updates task status
- [ ] Visual drop indicator
- [ ] Smooth animation
```

### T4.5.2: Card reorder in column
```
Acceptatiecriteria:
- [ ] Drag within column
- [ ] Sort order updated
- [ ] Saved to database
```

### T4.5.3: Multi-select drag
```
Acceptatiecriteria:
- [ ] Ctrl+click select multiple
- [ ] Drag all selected
- [ ] Move all to target column
```

### T4.5.4: Drop validation
```
Acceptatiecriteria:
- [ ] WIP limit check
- [ ] Constraint check
- [ ] Visual feedback for invalid
```

---

## S4.6: Card Editor

| ID | Taak | Status |
|----|------|--------|
| T4.6.1 | Card editor dialog | ⬜ |
| T4.6.2 | Field editing | ⬜ |
| T4.6.3 | Tag management | ⬜ |
| T4.6.4 | Save/cancel | ⬜ |

### T4.6.1: Card editor dialog
```
Acceptatiecriteria:
- [ ] src/features/taskboard/components/CardEditor.tsx
- [ ] Modal or sidebar
- [ ] All task fields
```

### T4.6.2: Field editing
```
Acceptatiecriteria:
- [ ] All editable fields
- [ ] Date pickers
- [ ] Dropdowns
- [ ] Validation
```

### T4.6.3: Tag management
```
Acceptatiecriteria:
- [ ] Add tag
- [ ] Remove tag
- [ ] Create new tag
- [ ] Tag autocomplete
```

### T4.6.4: Save/cancel
```
Acceptatiecriteria:
- [ ] Save button
- [ ] Cancel button
- [ ] Auto-save option
- [ ] Dirty state warning
```

---

## S4.7: Swimlanes

| ID | Taak | Status |
|----|------|--------|
| T4.7.1 | Swimlane config | ⬜ |
| T4.7.2 | Swimlane headers | ⬜ |
| T4.7.3 | Swimlane collapse | ⬜ |

### T4.7.1: Swimlane config
```
Acceptatiecriteria:
- [ ] Group by assignee
- [ ] Group by priority
- [ ] Group by custom field
- [ ] No swimlanes option
```

### T4.7.2: Swimlane headers
```
Acceptatiecriteria:
- [ ] Swimlane title
- [ ] Task count
- [ ] Collapse control
```

### T4.7.3: Swimlane collapse
```
Acceptatiecriteria:
- [ ] Collapse/expand
- [ ] State saved
- [ ] Collapsed height minimal
```

---

## S4.8: WIP Limits

| ID | Taak | Status |
|----|------|--------|
| T4.8.1 | WIP limit config | ⬜ |
| T4.8.2 | WIP indicator | ⬜ |
| T4.8.3 | WIP warning | ⬜ |

### T4.8.1: WIP limit config
```
Acceptatiecriteria:
- [ ] Set limit per column
- [ ] In column settings
- [ ] 0 = no limit
```

### T4.8.2: WIP indicator
```
Acceptatiecriteria:
- [ ] Count / Limit display
- [ ] Color coding
- [ ] In column header
```

### T4.8.3: WIP warning
```
Acceptatiecriteria:
- [ ] Warning when at limit
- [ ] Block or allow over limit
- [ ] Visual warning state
```

---

# D5: GRID MODULE

## S5.1: Grid Component

| ID | Taak | Status |
|----|------|--------|
| T5.1.1 | BryntumGrid wrapper | ⬜ |
| T5.1.2 | Grid configuratie | ⬜ |
| T5.1.3 | Store binding | ⬜ |
| T5.1.4 | Grid page route | ⬜ |

### T5.1.1: BryntumGrid wrapper
```
Acceptatiecriteria:
- [ ] src/features/grid/components/DataGrid.tsx
- [ ] Forwarded ref
- [ ] Props interface
```

### T5.1.2: Grid configuratie
```
Acceptatiecriteria:
- [ ] src/features/grid/config/grid.ts
- [ ] Column definitions
- [ ] Features enabled
```

### T5.1.3: Store binding
```
Acceptatiecriteria:
- [ ] Tasks store
- [ ] Resources store
- [ ] Switchable store
```

### T5.1.4: Grid page route
```
Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/[projectId]/grid/page.tsx
```

---

## S5.2: Grid Toolbar

| ID | Taak | Status |
|----|------|--------|
| T5.2.1 | Toolbar component | ⬜ |
| T5.2.2 | Column picker | ⬜ |
| T5.2.3 | Export buttons | ⬜ |
| T5.2.4 | Refresh button | ⬜ |

### T5.2.1: Toolbar component
```
Acceptatiecriteria:
- [ ] src/features/grid/components/GridToolbar.tsx
```

### T5.2.2: Column picker
```
Acceptatiecriteria:
- [ ] Column visibility toggle
- [ ] Checkbox list
- [ ] Show all/Hide all
```

### T5.2.3: Export buttons
```
Acceptatiecriteria:
- [ ] Export to Excel
- [ ] Export to CSV
- [ ] Export current view
```

### T5.2.4: Refresh button
```
Acceptatiecriteria:
- [ ] Reload data button
- [ ] Loading indicator
```

---

## S5.3: Columns

| ID | Taak | Status |
|----|------|--------|
| T5.3.1 | Column definitions | ⬜ |
| T5.3.2 | Column types | ⬜ |
| T5.3.3 | Custom renderers | ⬜ |
| T5.3.4 | Column resize | ⬜ |
| T5.3.5 | Column reorder | ⬜ |

### T5.3.1: Column definitions
```
Acceptatiecriteria:
- [ ] src/features/grid/config/columns.ts
- [ ] All task/resource fields
- [ ] Default visible columns
```

### T5.3.2: Column types
```
Acceptatiecriteria:
- [ ] Text column
- [ ] Number column
- [ ] Date column
- [ ] Boolean column
- [ ] Rating column
- [ ] Action column
```

### T5.3.3: Custom renderers
```
Acceptatiecriteria:
- [ ] Progress bar renderer
- [ ] Status badge renderer
- [ ] Avatar renderer
- [ ] Tag list renderer
```

### T5.3.4: Column resize
```
Acceptatiecriteria:
- [ ] Drag to resize
- [ ] Min/max width
- [ ] Auto-fit content
```

### T5.3.5: Column reorder
```
Acceptatiecriteria:
- [ ] Drag header to reorder
- [ ] Order persisted
```

---

## S5.4: Sorting & Filtering

| ID | Taak | Status |
|----|------|--------|
| T5.4.1 | Single sort | ⬜ |
| T5.4.2 | Multi-column sort | ⬜ |
| T5.4.3 | Quick filter | ⬜ |
| T5.4.4 | Filter builder | ⬜ |
| T5.4.5 | Filter presets | ⬜ |

### T5.4.1: Single sort
```
Acceptatiecriteria:
- [ ] Click header to sort
- [ ] Asc/Desc toggle
- [ ] Sort indicator
```

### T5.4.2: Multi-column sort
```
Acceptatiecriteria:
- [ ] Shift+click for multi
- [ ] Sort priority shown
- [ ] Clear all sorts
```

### T5.4.3: Quick filter
```
Acceptatiecriteria:
- [ ] Filter row in header
- [ ] Type to filter
- [ ] Per-column filters
```

### T5.4.4: Filter builder
```
Acceptatiecriteria:
- [ ] Advanced filter UI
- [ ] Multiple conditions
- [ ] AND/OR logic
- [ ] All operators
```

### T5.4.5: Filter presets
```
Acceptatiecriteria:
- [ ] Save filter preset
- [ ] Load preset
- [ ] Share presets
```

---

## S5.5: Editing

| ID | Taak | Status |
|----|------|--------|
| T5.5.1 | Cell editing | ⬜ |
| T5.5.2 | Row editing | ⬜ |
| T5.5.3 | Validation | ⬜ |
| T5.5.4 | Auto-save | ⬜ |

### T5.5.1: Cell editing
```
Acceptatiecriteria:
- [ ] CellEdit feature
- [ ] Double-click to edit
- [ ] Enter to confirm
- [ ] Tab to next
```

### T5.5.2: Row editing
```
Acceptatiecriteria:
- [ ] RowEdit feature (optioneel)
- [ ] Edit entire row
- [ ] Save/Cancel buttons
```

### T5.5.3: Validation
```
Acceptatiecriteria:
- [ ] Required field validation
- [ ] Type validation
- [ ] Custom validators
- [ ] Error display
```

### T5.5.4: Auto-save
```
Acceptatiecriteria:
- [ ] Save on cell exit
- [ ] Debounced save
- [ ] Dirty indicator
```

---

## S5.6: Selection

| ID | Taak | Status |
|----|------|--------|
| T5.6.1 | Single selection | ⬜ |
| T5.6.2 | Multi selection | ⬜ |
| T5.6.3 | Checkbox column | ⬜ |

### T5.6.1: Single selection
```
Acceptatiecriteria:
- [ ] Click to select row
- [ ] Highlight selected
- [ ] Selection events
```

### T5.6.2: Multi selection
```
Acceptatiecriteria:
- [ ] Ctrl+click
- [ ] Shift+click range
- [ ] Selection count
```

### T5.6.3: Checkbox column
```
Acceptatiecriteria:
- [ ] Checkbox column
- [ ] Select all header
- [ ] Batch actions
```

---

## S5.7: Grouping

| ID | Taak | Status |
|----|------|--------|
| T5.7.1 | Group by column | ⬜ |
| T5.7.2 | Group headers | ⬜ |
| T5.7.3 | Group collapse | ⬜ |
| T5.7.4 | Group summaries | ⬜ |

### T5.7.1: Group by column
```
Acceptatiecriteria:
- [ ] Group feature enabled
- [ ] Drag column to group
- [ ] Group dropdown
```

### T5.7.2: Group headers
```
Acceptatiecriteria:
- [ ] Group name
- [ ] Row count
- [ ] Custom renderer
```

### T5.7.3: Group collapse
```
Acceptatiecriteria:
- [ ] Expand/collapse group
- [ ] Collapse all
- [ ] Expand all
```

### T5.7.4: Group summaries
```
Acceptatiecriteria:
- [ ] Sum/Avg/Count per group
- [ ] In group footer
- [ ] Custom aggregates
```

---

## S5.8: Export

| ID | Taak | Status |
|----|------|--------|
| T5.8.1 | CSV export | ⬜ |
| T5.8.2 | Excel export | ⬜ |
| T5.8.3 | Export config | ⬜ |

### T5.8.1: CSV export
```
Acceptatiecriteria:
- [ ] Export to CSV file
- [ ] Include headers
- [ ] Respect filters
```

### T5.8.2: Excel export
```
Acceptatiecriteria:
- [ ] Export to .xlsx
- [ ] Formatting preserved
- [ ] Multiple sheets
```

### T5.8.3: Export config
```
Acceptatiecriteria:
- [ ] Select columns
- [ ] Include/exclude filtered
- [ ] Date format option
```

---

# D6: DASHBOARD MODULE

## S6.1: Dashboard Layout

| ID | Taak | Status |
|----|------|--------|
| T6.1.1 | Dashboard layout component | ⬜ |
| T6.1.2 | Resizable panels | ⬜ |
| T6.1.3 | Layout persistence | ⬜ |
| T6.1.4 | Responsive breakpoints | ⬜ |

### T6.1.1: Dashboard layout component
```
Beschrijving:
Maak het basis dashboard layout component met grid/flex structuur.

Acceptatiecriteria:
- [ ] src/components/dashboard/DashboardLayout.tsx
- [ ] Header, sidebar, main content areas
- [ ] Flexibele grid structuur
- [ ] TypeScript props interface
```

### T6.1.2: Resizable panels
```
Beschrijving:
Implementeer resizable panels voor dashboard widgets.

Acceptatiecriteria:
- [ ] Drag-to-resize functionaliteit
- [ ] Minimum/maximum panel sizes
- [ ] Visual resize handles
- [ ] Smooth resizing
```

### T6.1.3: Layout persistence
```
Beschrijving:
Sla layout configuratie op in localStorage/database.

Acceptatiecriteria:
- [ ] Layout state saved on change
- [ ] Layout restored on page load
- [ ] Reset to default option
- [ ] Per-user layout storage
```

### T6.1.4: Responsive breakpoints
```
Beschrijving:
Responsive layout voor verschillende schermgroottes.

Acceptatiecriteria:
- [ ] Desktop layout (>1200px)
- [ ] Tablet layout (768-1200px)
- [ ] Mobile layout (<768px)
- [ ] Smooth transitions
```

---

## S6.2: Navigation

| ID | Taak | Status |
|----|------|--------|
| T6.2.1 | Sidebar component | ⬜ |
| T6.2.2 | Workspace navigation | ⬜ |
| T6.2.3 | Project navigation | ⬜ |
| T6.2.4 | Breadcrumb component | ⬜ |
| T6.2.5 | Mobile navigation | ⬜ |

### T6.2.1: Sidebar component
```
Beschrijving:
Collapsible sidebar met navigatie items.

Acceptatiecriteria:
- [ ] src/components/navigation/Sidebar.tsx
- [ ] Collapse/expand functionaliteit
- [ ] Active state highlighting
- [ ] Icon + label layout
- [ ] Keyboard accessible
```

### T6.2.2: Workspace navigation
```
Beschrijving:
Navigatie tussen workspaces.

Acceptatiecriteria:
- [ ] Workspace dropdown/selector
- [ ] Recent workspaces list
- [ ] Create workspace button
- [ ] Workspace search
```

### T6.2.3: Project navigation
```
Beschrijving:
Navigatie binnen workspace naar projecten.

Acceptatiecriteria:
- [ ] Project list in sidebar
- [ ] Active project indicator
- [ ] Project quick actions
- [ ] Favorites/pinned projects
```

### T6.2.4: Breadcrumb component
```
Beschrijving:
Breadcrumb navigatie component.

Acceptatiecriteria:
- [ ] src/components/navigation/Breadcrumb.tsx
- [ ] Dynamic path generation
- [ ] Clickable segments
- [ ] Current page non-clickable
- [ ] Overflow handling
```

### T6.2.5: Mobile navigation
```
Beschrijving:
Hamburger menu voor mobiele apparaten.

Acceptatiecriteria:
- [ ] Hamburger icon toggle
- [ ] Full-screen overlay menu
- [ ] Touch-friendly tap targets
- [ ] Close on navigation
```

---

## S6.3: View Switcher

| ID | Taak | Status |
|----|------|--------|
| T6.3.1 | View tabs component | ⬜ |
| T6.3.2 | View routing logic | ⬜ |
| T6.3.3 | View state preservation | ⬜ |
| T6.3.4 | Default view setting | ⬜ |

### T6.3.1: View tabs component
```
Beschrijving:
Tab bar om te wisselen tussen Gantt/Calendar/TaskBoard/Grid.

Acceptatiecriteria:
- [ ] src/components/navigation/ViewTabs.tsx
- [ ] Tab voor elke view
- [ ] Active tab styling
- [ ] Icons + labels
- [ ] Keyboard navigation
```

### T6.3.2: View routing logic
```
Beschrijving:
URL routing naar correcte view.

Acceptatiecriteria:
- [ ] Route parameters voor view
- [ ] URL reflects current view
- [ ] Browser back/forward works
- [ ] Deep linking support
```

### T6.3.3: View state preservation
```
Beschrijving:
Behoud view state bij wisselen.

Acceptatiecriteria:
- [ ] Zoom level preserved
- [ ] Scroll position preserved
- [ ] Filter settings preserved
- [ ] Selection preserved
```

### T6.3.4: Default view setting
```
Beschrijving:
Configureerbare default view per project.

Acceptatiecriteria:
- [ ] Default view in project settings
- [ ] User preference override
- [ ] Fallback to Gantt
```

---

## S6.4: Widget System

| ID | Taak | Status |
|----|------|--------|
| T6.4.1 | Widget container component | ⬜ |
| T6.4.2 | Gantt widget integration | ⬜ |
| T6.4.3 | Calendar widget integration | ⬜ |
| T6.4.4 | TaskBoard widget integration | ⬜ |
| T6.4.5 | Stats widget | ⬜ |

### T6.4.1: Widget container component
```
Beschrijving:
Generiek widget container met header en controls.

Acceptatiecriteria:
- [ ] src/components/widgets/WidgetContainer.tsx
- [ ] Title bar met controls
- [ ] Maximize/minimize buttons
- [ ] Refresh button
- [ ] Settings button
```

### T6.4.2: Gantt widget integration
```
Beschrijving:
Gantt chart als dashboard widget.

Acceptatiecriteria:
- [ ] Mini Gantt in widget
- [ ] Click to open full view
- [ ] Responsive sizing
- [ ] Sync met hoofddata
```

### T6.4.3: Calendar widget integration
```
Beschrijving:
Calendar als dashboard widget.

Acceptatiecriteria:
- [ ] Mini calendar/agenda widget
- [ ] Upcoming events list
- [ ] Click to open full view
```

### T6.4.4: TaskBoard widget integration
```
Beschrijving:
TaskBoard summary als widget.

Acceptatiecriteria:
- [ ] Column summary view
- [ ] Task counts per column
- [ ] Quick status overview
```

### T6.4.5: Stats widget
```
Beschrijving:
Project statistieken widget.

Acceptatiecriteria:
- [ ] Total tasks count
- [ ] Completed percentage
- [ ] Overdue tasks count
- [ ] Resource utilization
```

---

## S6.5: Quick Actions

| ID | Taak | Status |
|----|------|--------|
| T6.5.1 | Quick actions panel | ⬜ |
| T6.5.2 | Create task shortcut | ⬜ |
| T6.5.3 | Create event shortcut | ⬜ |
| T6.5.4 | Keyboard shortcuts | ⬜ |

### T6.5.1: Quick actions panel
```
Beschrijving:
Panel met snelle acties.

Acceptatiecriteria:
- [ ] src/components/dashboard/QuickActions.tsx
- [ ] Floating action button (FAB)
- [ ] Expandable menu
- [ ] Context-aware actions
```

### T6.5.2: Create task shortcut
```
Beschrijving:
Snelle taak aanmaken.

Acceptatiecriteria:
- [ ] Quick add task modal
- [ ] Minimal required fields
- [ ] Keyboard shortcut (Ctrl+T)
- [ ] Add to current project
```

### T6.5.3: Create event shortcut
```
Beschrijving:
Snelle event aanmaken.

Acceptatiecriteria:
- [ ] Quick add event modal
- [ ] Date/time picker
- [ ] Keyboard shortcut (Ctrl+E)
```

### T6.5.4: Keyboard shortcuts
```
Beschrijving:
Globale keyboard shortcuts.

Acceptatiecriteria:
- [ ] Shortcut registry system
- [ ] Shortcut help overlay (?)
- [ ] Configurable shortcuts
- [ ] No conflicts met browser
```

---

## S6.6: Recent Items

| ID | Taak | Status |
|----|------|--------|
| T6.6.1 | Recent items tracking | ⬜ |
| T6.6.2 | Recent items display | ⬜ |
| T6.6.3 | Favorites system | ⬜ |

### T6.6.1: Recent items tracking
```
Beschrijving:
Track recent geopende items.

Acceptatiecriteria:
- [ ] Track recent projects
- [ ] Track recent tasks
- [ ] Stored per user
- [ ] Maximum 10 items per type
```

### T6.6.2: Recent items display
```
Beschrijving:
Toon recent geopende items.

Acceptatiecriteria:
- [ ] Recent items sidebar section
- [ ] Click to navigate
- [ ] Timestamp shown
- [ ] Clear history option
```

### T6.6.3: Favorites system
```
Beschrijving:
Star/favorite functionaliteit.

Acceptatiecriteria:
- [ ] Star button op items
- [ ] Favorites list
- [ ] Persisted in database
- [ ] Quick access menu
```

---

## S6.7: Notifications

| ID | Taak | Status |
|----|------|--------|
| T6.7.1 | Notification center | ⬜ |
| T6.7.2 | Toast notifications | ⬜ |
| T6.7.3 | Notification settings | ⬜ |

### T6.7.1: Notification center
```
Beschrijving:
Centraal notificatie overzicht.

Acceptatiecriteria:
- [ ] Bell icon met badge
- [ ] Dropdown met notifications
- [ ] Mark as read functionality
- [ ] Clear all button
```

### T6.7.2: Toast notifications
```
Beschrijving:
In-app toast notifications.

Acceptatiecriteria:
- [ ] Toast component
- [ ] Success/error/warning/info types
- [ ] Auto-dismiss timer
- [ ] Manual dismiss
- [ ] Stack multiple toasts
```

### T6.7.3: Notification settings
```
Beschrijving:
Notification preferences.

Acceptatiecriteria:
- [ ] Email notification toggle
- [ ] In-app notification toggle
- [ ] Per-event type settings
- [ ] Quiet hours option
```

---

# D7: WORKSPACE MODULE

## S7.1: Workspace CRUD

| ID | Taak | Status |
|----|------|--------|
| T7.1.1 | Workspace list page | ⬜ |
| T7.1.2 | Workspace create dialog | ⬜ |
| T7.1.3 | Workspace update | ⬜ |
| T7.1.4 | Workspace delete | ⬜ |
| T7.1.5 | Workspace API routes | ⬜ |

### T7.1.1: Workspace list page
```
Beschrijving:
Overzichtspagina met alle workspaces.

Acceptatiecriteria:
- [ ] app/(dashboard)/workspaces/page.tsx
- [ ] Grid/list view toggle
- [ ] Search/filter functionality
- [ ] Sort by name/date
```

### T7.1.2: Workspace create dialog
```
Beschrijving:
Dialog voor nieuwe workspace aanmaken.

Acceptatiecriteria:
- [ ] Modal dialog component
- [ ] Name, description fields
- [ ] Type selection (Afdeling/Klant)
- [ ] Validation
- [ ] Submit to API
```

### T7.1.3: Workspace update
```
Beschrijving:
Workspace gegevens bewerken.

Acceptatiecriteria:
- [ ] Edit form in settings
- [ ] Name, description editable
- [ ] Type change warning
- [ ] Save/cancel buttons
```

### T7.1.4: Workspace delete
```
Beschrijving:
Workspace verwijderen (soft delete).

Acceptatiecriteria:
- [ ] Delete confirmation dialog
- [ ] Type workspace name to confirm
- [ ] Soft delete (archived)
- [ ] Cascade to projects (archive)
```

### T7.1.5: Workspace API routes
```
Beschrijving:
Backend API routes voor workspaces.

Acceptatiecriteria:
- [ ] GET /api/workspaces
- [ ] POST /api/workspaces
- [ ] GET /api/workspaces/[id]
- [ ] PUT /api/workspaces/[id]
- [ ] DELETE /api/workspaces/[id]
```

---

## S7.2: Workspace Types

| ID | Taak | Status |
|----|------|--------|
| T7.2.1 | Type Afdeling configuratie | ⬜ |
| T7.2.2 | Type Klant configuratie | ⬜ |
| T7.2.3 | Type-specific features toggle | ⬜ |

### T7.2.1: Type Afdeling configuratie
```
Beschrijving:
Configuratie voor Afdeling type workspace.

Acceptatiecriteria:
- [ ] Permanent workspace (no expiry)
- [ ] Full feature access
- [ ] Internal team focus
- [ ] 4 vaste afdelingen mogelijk
```

### T7.2.2: Type Klant configuratie
```
Beschrijving:
Configuratie voor Klant type workspace.

Acceptatiecriteria:
- [ ] Project-based (tijdelijk)
- [ ] Client access mogelijk
- [ ] Limited feature set
- [ ] Expiration date support
```

### T7.2.3: Type-specific features toggle
```
Beschrijving:
Feature toggles per workspace type.

Acceptatiecriteria:
- [ ] Feature flags per type
- [ ] Vault access (alleen Afdeling)
- [ ] Client invite (alleen Klant)
- [ ] Config in database
```

---

## S7.3: Member Management

| ID | Taak | Status |
|----|------|--------|
| T7.3.1 | Member list component | ⬜ |
| T7.3.2 | Add member dialog | ⬜ |
| T7.3.3 | Remove member | ⬜ |
| T7.3.4 | Role assignment | ⬜ |
| T7.3.5 | Member API routes | ⬜ |

### T7.3.1: Member list component
```
Beschrijving:
Lijst van workspace members.

Acceptatiecriteria:
- [ ] src/features/workspace/components/MemberList.tsx
- [ ] Avatar, name, email, role
- [ ] Sort by role/name
- [ ] Search members
```

### T7.3.2: Add member dialog
```
Beschrijving:
Dialog om member toe te voegen.

Acceptatiecriteria:
- [ ] Email input field
- [ ] Role selection dropdown
- [ ] Existing user search
- [ ] Send invite option
```

### T7.3.3: Remove member
```
Beschrijving:
Member verwijderen uit workspace.

Acceptatiecriteria:
- [ ] Remove button per member
- [ ] Confirmation dialog
- [ ] Cannot remove last admin
- [ ] Reassign tasks option
```

### T7.3.4: Role assignment
```
Beschrijving:
Rol wijzigen voor member.

Acceptatiecriteria:
- [ ] Role dropdown per member
- [ ] Permission preview
- [ ] Change confirmation
- [ ] Audit log
```

### T7.3.5: Member API routes
```
Beschrijving:
Backend API routes voor members.

Acceptatiecriteria:
- [ ] GET /api/workspaces/[id]/members
- [ ] POST /api/workspaces/[id]/members
- [ ] PUT /api/workspaces/[id]/members/[userId]
- [ ] DELETE /api/workspaces/[id]/members/[userId]
```

---

## S7.4: Invite System

| ID | Taak | Status |
|----|------|--------|
| T7.4.1 | Invite dialog | ⬜ |
| T7.4.2 | Email invite sending | ⬜ |
| T7.4.3 | Invite token generation | ⬜ |
| T7.4.4 | Invite accept page | ⬜ |
| T7.4.5 | Invite expiration handling | ⬜ |

### T7.4.1: Invite dialog
```
Beschrijving:
Dialog voor invite versturen.

Acceptatiecriteria:
- [ ] Email address input
- [ ] Role selection
- [ ] Personal message (optional)
- [ ] Send invite button
```

### T7.4.2: Email invite sending
```
Beschrijving:
Email versturen met invite link.

Acceptatiecriteria:
- [ ] Email template
- [ ] Invite link in email
- [ ] Workspace name in email
- [ ] Inviter name in email
```

### T7.4.3: Invite token generation
```
Beschrijving:
Secure invite token genereren.

Acceptatiecriteria:
- [ ] UUID token generation
- [ ] Token stored in database
- [ ] 7-day expiration
- [ ] Single use
```

### T7.4.4: Invite accept page
```
Beschrijving:
Pagina om invite te accepteren.

Acceptatiecriteria:
- [ ] app/invite/[token]/page.tsx
- [ ] Workspace info getoond
- [ ] Login/register flow
- [ ] Auto-join op accept
```

### T7.4.5: Invite expiration handling
```
Beschrijving:
Afhandeling van verlopen invites.

Acceptatiecriteria:
- [ ] Check expiration on access
- [ ] Friendly error message
- [ ] Request new invite optie
- [ ] Cleanup job voor oude invites
```

---

## S7.5: Workspace Settings

| ID | Taak | Status |
|----|------|--------|
| T7.5.1 | Settings page layout | ⬜ |
| T7.5.2 | General settings | ⬜ |
| T7.5.3 | Notification settings | ⬜ |
| T7.5.4 | Danger zone | ⬜ |

### T7.5.1: Settings page layout
```
Beschrijving:
Layout voor workspace settings pagina.

Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/settings/page.tsx
- [ ] Tab navigation
- [ ] Responsive layout
- [ ] Admin-only access
```

### T7.5.2: General settings
```
Beschrijving:
Algemene workspace instellingen.

Acceptatiecriteria:
- [ ] Name editing
- [ ] Description editing
- [ ] Logo upload
- [ ] Default project settings
```

### T7.5.3: Notification settings
```
Beschrijving:
Notificatie instellingen per workspace.

Acceptatiecriteria:
- [ ] Email digest frequency
- [ ] Activity notifications
- [ ] Mention notifications
- [ ] Due date reminders
```

### T7.5.4: Danger zone
```
Beschrijving:
Gevaarlijke acties (archive/delete).

Acceptatiecriteria:
- [ ] Archive workspace button
- [ ] Delete workspace button
- [ ] Transfer ownership button
- [ ] All require confirmation
```

---

## S7.6: Workspace Dashboard

| ID | Taak | Status |
|----|------|--------|
| T7.6.1 | Workspace overview page | ⬜ |
| T7.6.2 | Project list in workspace | ⬜ |
| T7.6.3 | Activity feed | ⬜ |
| T7.6.4 | Workspace stats | ⬜ |

### T7.6.1: Workspace overview page
```
Beschrijving:
Overzichtspagina voor workspace.

Acceptatiecriteria:
- [ ] app/(dashboard)/[workspaceId]/page.tsx
- [ ] Welcome message
- [ ] Quick actions
- [ ] Recent activity
```

### T7.6.2: Project list in workspace
```
Beschrijving:
Lijst van projecten in workspace.

Acceptatiecriteria:
- [ ] Project cards/list
- [ ] Status indicator
- [ ] Progress bar
- [ ] Create project button
```

### T7.6.3: Activity feed
```
Beschrijving:
Recent activity in workspace.

Acceptatiecriteria:
- [ ] Activity timeline
- [ ] User avatars
- [ ] Action descriptions
- [ ] Timestamps
- [ ] Load more pagination
```

### T7.6.4: Workspace stats
```
Beschrijving:
Statistieken voor workspace.

Acceptatiecriteria:
- [ ] Total projects count
- [ ] Active tasks count
- [ ] Team member count
- [ ] Completion rate
```

---

# D8: AUTH/RBAC MODULE

## S8.1: Authentication

| ID | Taak | Status |
|----|------|--------|
| T8.1.1 | Login page | ⬜ |
| T8.1.2 | Login form component | ⬜ |
| T8.1.3 | Supabase Auth integration | ⬜ |
| T8.1.4 | Session management | ⬜ |
| T8.1.5 | Logout functionality | ⬜ |

### T8.1.1: Login page
```
Beschrijving:
Login pagina met form.

Acceptatiecriteria:
- [ ] app/(auth)/login/page.tsx
- [ ] Clean, centered layout
- [ ] Logo/branding
- [ ] Link naar forgot password
- [ ] Redirect after login
```

### T8.1.2: Login form component
```
Beschrijving:
Login form met validatie.

Acceptatiecriteria:
- [ ] Email input field
- [ ] Password input field
- [ ] Show/hide password toggle
- [ ] Remember me checkbox
- [ ] Submit button
- [ ] Error messages
```

### T8.1.3: Supabase Auth integration
```
Beschrijving:
Supabase Auth client setup.

Acceptatiecriteria:
- [ ] src/lib/supabase/client.ts
- [ ] src/lib/supabase/server.ts
- [ ] Auth helper functions
- [ ] Session refresh handling
```

### T8.1.4: Session management
```
Beschrijving:
User session beheer.

Acceptatiecriteria:
- [ ] Session stored in cookies
- [ ] Auto-refresh token
- [ ] Session timeout handling
- [ ] Multiple device support
```

### T8.1.5: Logout functionality
```
Beschrijving:
Uitloggen functionaliteit.

Acceptatiecriteria:
- [ ] Logout button in UI
- [ ] Clear session
- [ ] Clear local storage
- [ ] Redirect naar login
```

---

## S8.2: Password Management

| ID | Taak | Status |
|----|------|--------|
| T8.2.1 | Forgot password page | ⬜ |
| T8.2.2 | Reset password flow | ⬜ |
| T8.2.3 | Change password | ⬜ |

### T8.2.1: Forgot password page
```
Beschrijving:
Wachtwoord vergeten pagina.

Acceptatiecriteria:
- [ ] app/(auth)/forgot-password/page.tsx
- [ ] Email input
- [ ] Send reset link button
- [ ] Success message
- [ ] Back to login link
```

### T8.2.2: Reset password flow
```
Beschrijving:
Wachtwoord reset via email link.

Acceptatiecriteria:
- [ ] app/(auth)/reset-password/page.tsx
- [ ] Token validation
- [ ] New password form
- [ ] Confirm password
- [ ] Success redirect
```

### T8.2.3: Change password
```
Beschrijving:
Wachtwoord wijzigen in account settings.

Acceptatiecriteria:
- [ ] Current password field
- [ ] New password field
- [ ] Confirm new password
- [ ] Password strength indicator
- [ ] Save button
```

---

## S8.3: Role Definitions

| ID | Taak | Status |
|----|------|--------|
| T8.3.1 | Rol Admin | ⬜ |
| T8.3.2 | Rol Vault Medewerker | ⬜ |
| T8.3.3 | Rol Medewerker | ⬜ |
| T8.3.4 | Rol Klant Editor | ⬜ |
| T8.3.5 | Rol Klant Viewer | ⬜ |

### T8.3.1: Rol Admin
```
Beschrijving:
Admin rol met volledige toegang.

Acceptatiecriteria:
- [ ] Alle permissies
- [ ] User management
- [ ] Workspace management
- [ ] System settings
```

### T8.3.2: Rol Vault Medewerker
```
Beschrijving:
Vault medewerker met data processing toegang.

Acceptatiecriteria:
- [ ] Vault toegang
- [ ] Data processing
- [ ] Kan niet exporteren naar permanent
- [ ] Geen admin functies
```

### T8.3.3: Rol Medewerker
```
Beschrijving:
Standaard medewerker rol.

Acceptatiecriteria:
- [ ] Project toegang (assigned)
- [ ] Task CRUD in eigen projecten
- [ ] Geen workspace admin
- [ ] Geen Vault toegang
```

### T8.3.4: Rol Klant Editor
```
Beschrijving:
Klant met edit rechten.

Acceptatiecriteria:
- [ ] Alleen klant workspace
- [ ] Task edit rechten
- [ ] Comment rechten
- [ ] Geen delete rechten
```

### T8.3.5: Rol Klant Viewer
```
Beschrijving:
Klant met alleen lees rechten.

Acceptatiecriteria:
- [ ] Alleen klant workspace
- [ ] Read-only toegang
- [ ] Kan comments plaatsen
- [ ] Geen edit rechten
```

---

## S8.4: Permissions

| ID | Taak | Status |
|----|------|--------|
| T8.4.1 | Permission enum/constants | ⬜ |
| T8.4.2 | Role-permission mapping | ⬜ |
| T8.4.3 | Permission check utility | ⬜ |
| T8.4.4 | usePermissions hook | ⬜ |
| T8.4.5 | Permission inheritance logic | ⬜ |

### T8.4.1: Permission enum/constants
```
Beschrijving:
Definieer alle permissies als constants.

Acceptatiecriteria:
- [ ] src/lib/permissions/constants.ts
- [ ] CRUD permissies per entity
- [ ] Admin permissies
- [ ] Vault permissies
- [ ] TypeScript enum
```

### T8.4.2: Role-permission mapping
```
Beschrijving:
Map rollen naar permissies.

Acceptatiecriteria:
- [ ] src/lib/permissions/roles.ts
- [ ] Permission array per rol
- [ ] Easy lookup structure
- [ ] Documented matrix
```

### T8.4.3: Permission check utility
```
Beschrijving:
Utility functie voor permission checks.

Acceptatiecriteria:
- [ ] hasPermission(user, permission)
- [ ] hasAnyPermission(user, permissions[])
- [ ] hasAllPermissions(user, permissions[])
- [ ] Workspace-scoped checks
```

### T8.4.4: usePermissions hook
```
Beschrijving:
React hook voor permission checks.

Acceptatiecriteria:
- [ ] src/hooks/usePermissions.ts
- [ ] Returns permission check functions
- [ ] Cached user context
- [ ] Loading state
```

### T8.4.5: Permission inheritance logic
```
Beschrijving:
Hiërarchische permission inheritance.

Acceptatiecriteria:
- [ ] Workspace → Project inheritance
- [ ] Admin overrides all
- [ ] Role hierarchy
- [ ] Documented inheritance rules
```

---

## S8.5: UI Guards

| ID | Taak | Status |
|----|------|--------|
| T8.5.1 | ProtectedRoute component | ⬜ |
| T8.5.2 | PermissionGate component | ⬜ |
| T8.5.3 | withAuth HOC | ⬜ |
| T8.5.4 | Redirect logic | ⬜ |

### T8.5.1: ProtectedRoute component
```
Beschrijving:
Route guard voor authenticated routes.

Acceptatiecriteria:
- [ ] src/components/auth/ProtectedRoute.tsx
- [ ] Check authentication
- [ ] Loading state
- [ ] Redirect to login
- [ ] Return URL preserved
```

### T8.5.2: PermissionGate component
```
Beschrijving:
Conditional render based on permission.

Acceptatiecriteria:
- [ ] src/components/auth/PermissionGate.tsx
- [ ] permission prop
- [ ] fallback prop
- [ ] Children rendered if allowed
```

### T8.5.3: withAuth HOC
```
Beschrijving:
Higher-order component voor auth.

Acceptatiecriteria:
- [ ] src/lib/auth/withAuth.ts
- [ ] Wraps page components
- [ ] Server-side check
- [ ] Client-side hydration
```

### T8.5.4: Redirect logic
```
Beschrijving:
Redirect na login/logout.

Acceptatiecriteria:
- [ ] returnTo parameter
- [ ] Default redirect paths
- [ ] Safe redirect validation
- [ ] No open redirects
```

---

## S8.6: API Guards

| ID | Taak | Status |
|----|------|--------|
| T8.6.1 | Auth middleware | ⬜ |
| T8.6.2 | Role middleware | ⬜ |
| T8.6.3 | Permission middleware | ⬜ |
| T8.6.4 | Unauthorized response handling | ⬜ |

### T8.6.1: Auth middleware
```
Beschrijving:
API route authentication middleware.

Acceptatiecriteria:
- [ ] src/lib/middleware/auth.ts
- [ ] Verify JWT token
- [ ] Attach user to request
- [ ] 401 on invalid token
```

### T8.6.2: Role middleware
```
Beschrijving:
Role-based API middleware.

Acceptatiecriteria:
- [ ] src/lib/middleware/role.ts
- [ ] Check user role
- [ ] Configurable required roles
- [ ] 403 on insufficient role
```

### T8.6.3: Permission middleware
```
Beschrijving:
Permission-based API middleware.

Acceptatiecriteria:
- [ ] src/lib/middleware/permission.ts
- [ ] Check specific permission
- [ ] Workspace-aware
- [ ] 403 on missing permission
```

### T8.6.4: Unauthorized response handling
```
Beschrijving:
Consistente error responses.

Acceptatiecriteria:
- [ ] Standard error format
- [ ] 401 for unauthenticated
- [ ] 403 for unauthorized
- [ ] Clear error messages
```

---

## S8.7: User Management

| ID | Taak | Status |
|----|------|--------|
| T8.7.1 | User list page | ⬜ |
| T8.7.2 | User detail/edit | ⬜ |
| T8.7.3 | Role assignment UI | ⬜ |
| T8.7.4 | User deactivation | ⬜ |

### T8.7.1: User list page
```
Beschrijving:
Admin pagina met alle users.

Acceptatiecriteria:
- [ ] app/(dashboard)/admin/users/page.tsx
- [ ] User table/list
- [ ] Search functionality
- [ ] Filter by role
- [ ] Admin only access
```

### T8.7.2: User detail/edit
```
Beschrijving:
User detail en edit pagina.

Acceptatiecriteria:
- [ ] app/(dashboard)/admin/users/[id]/page.tsx
- [ ] Profile information
- [ ] Workspace memberships
- [ ] Activity history
- [ ] Edit form
```

### T8.7.3: Role assignment UI
```
Beschrijving:
UI voor rol toewijzing.

Acceptatiecriteria:
- [ ] Role dropdown
- [ ] Per-workspace roles
- [ ] Bulk role assignment
- [ ] Confirmation dialog
```

### T8.7.4: User deactivation
```
Beschrijving:
User account deactiveren.

Acceptatiecriteria:
- [ ] Deactivate button
- [ ] Confirmation required
- [ ] Soft delete (archived)
- [ ] Reactivate option
```

---

# D9: VAULT MODULE

## S9.1: Vault Dashboard

| ID | Taak | Status |
|----|------|--------|
| T9.1.1 | Vault dashboard page | ⬜ |
| T9.1.2 | Vault stats | ⬜ |
| T9.1.3 | Expiring items warning | ⬜ |
| T9.1.4 | Quick filters | ⬜ |

### T9.1.1: Vault dashboard page
```
Beschrijving:
Hoofd dashboard voor Vault module.

Acceptatiecriteria:
- [ ] app/(dashboard)/vault/page.tsx
- [ ] Overview layout
- [ ] Navigation naar Kanban
- [ ] Admin/Vault Medewerker only
```

### T9.1.2: Vault stats
```
Beschrijving:
Statistieken voor Vault items.

Acceptatiecriteria:
- [ ] Items in Input
- [ ] Items in Processing
- [ ] Items in Done
- [ ] Items expiring soon
```

### T9.1.3: Expiring items warning
```
Beschrijving:
Waarschuwing voor bijna verlopen items.

Acceptatiecriteria:
- [ ] Alert component
- [ ] Count of items <7 days
- [ ] Link to filtered view
- [ ] Dismissable
```

### T9.1.4: Quick filters
```
Beschrijving:
Snelle filters voor Vault.

Acceptatiecriteria:
- [ ] Filter by status
- [ ] Filter by source
- [ ] Filter by age
- [ ] Clear all filters
```

---

## S9.2: Vault Kanban

| ID | Taak | Status |
|----|------|--------|
| T9.2.1 | Vault TaskBoard instance | ⬜ |
| T9.2.2 | Input column | ⬜ |
| T9.2.3 | Processing column | ⬜ |
| T9.2.4 | Done column | ⬜ |
| T9.2.5 | Column transitions logic | ⬜ |

### T9.2.1: Vault TaskBoard instance
```
Beschrijving:
Dedicated TaskBoard voor Vault workflow.

Acceptatiecriteria:
- [ ] src/features/vault/components/VaultBoard.tsx
- [ ] 3 fixed columns
- [ ] Custom card template
- [ ] Vault-specific features
```

### T9.2.2: Input column
```
Beschrijving:
Input kolom voor nieuwe items.

Acceptatiecriteria:
- [ ] "Input" column header
- [ ] New items arrive here
- [ ] Count badge
- [ ] Oldest first sorting
```

### T9.2.3: Processing column
```
Beschrijving:
Processing kolom voor items in bewerking.

Acceptatiecriteria:
- [ ] "Processing" column header
- [ ] Assigned to indicator
- [ ] Processing time shown
- [ ] WIP limit optioneel
```

### T9.2.4: Done column
```
Beschrijving:
Done kolom voor verwerkte items.

Acceptatiecriteria:
- [ ] "Done" column header
- [ ] Ready for export
- [ ] Retention countdown
- [ ] Export button per item
```

### T9.2.5: Column transitions logic
```
Beschrijving:
Business logic voor column transitions.

Acceptatiecriteria:
- [ ] Input → Processing: assign user
- [ ] Processing → Done: mark complete
- [ ] Done → Export: export action
- [ ] Validation per transition
```

---

## S9.3: Vault Items

| ID | Taak | Status |
|----|------|--------|
| T9.3.1 | Vault item card component | ⬜ |
| T9.3.2 | Vault item detail page | ⬜ |
| T9.3.3 | Source data preview | ⬜ |
| T9.3.4 | Item metadata | ⬜ |
| T9.3.5 | Item API routes | ⬜ |

### T9.3.1: Vault item card component
```
Beschrijving:
Kaart component voor Vault items.

Acceptatiecriteria:
- [ ] src/features/vault/components/VaultCard.tsx
- [ ] Source identifier
- [ ] Status indicator
- [ ] Days remaining badge
- [ ] Quick actions
```

### T9.3.2: Vault item detail page
```
Beschrijving:
Detail pagina voor Vault item.

Acceptatiecriteria:
- [ ] app/(dashboard)/vault/[id]/page.tsx
- [ ] Full item data display
- [ ] Processing tools
- [ ] History timeline
```

### T9.3.3: Source data preview
```
Beschrijving:
Preview van source data.

Acceptatiecriteria:
- [ ] JSON viewer
- [ ] Key-value display
- [ ] Collapsible sections
- [ ] Copy to clipboard
```

### T9.3.4: Item metadata
```
Beschrijving:
Metadata weergave voor items.

Acceptatiecriteria:
- [ ] Created date
- [ ] Source system
- [ ] Processed by
- [ ] Export history
```

### T9.3.5: Item API routes
```
Beschrijving:
API routes voor Vault items.

Acceptatiecriteria:
- [ ] GET /api/vault
- [ ] GET /api/vault/[id]
- [ ] PUT /api/vault/[id]
- [ ] POST /api/vault/[id]/process
```

---

## S9.4: Processing

| ID | Taak | Status |
|----|------|--------|
| T9.4.1 | Processing status update | ⬜ |
| T9.4.2 | Processing notes field | ⬜ |
| T9.4.3 | Processed by tracking | ⬜ |
| T9.4.4 | Data transformation tools | ⬜ |
| T9.4.5 | Validation checks | ⬜ |

### T9.4.1: Processing status update
```
Beschrijving:
Status updates tijdens processing.

Acceptatiecriteria:
- [ ] Status dropdown/buttons
- [ ] Status history
- [ ] Timestamp per change
- [ ] User attribution
```

### T9.4.2: Processing notes field
```
Beschrijving:
Notities veld voor processing.

Acceptatiecriteria:
- [ ] Rich text editor
- [ ] Auto-save
- [ ] Version history
- [ ] @mentions support
```

### T9.4.3: Processed by tracking
```
Beschrijving:
Bijhouden wie verwerkt.

Acceptatiecriteria:
- [ ] Current processor shown
- [ ] Processing history
- [ ] Time spent tracking
- [ ] Reassign option
```

### T9.4.4: Data transformation tools
```
Beschrijving:
Tools voor data transformatie.

Acceptatiecriteria:
- [ ] Field mapping UI
- [ ] Data type conversion
- [ ] Default values
- [ ] Preview result
```

### T9.4.5: Validation checks
```
Beschrijving:
Validatie van verwerkte data.

Acceptatiecriteria:
- [ ] Required fields check
- [ ] Format validation
- [ ] Duplicate detection
- [ ] Error report
```

---

## S9.5: Retention

| ID | Taak | Status |
|----|------|--------|
| T9.5.1 | 30-day countdown display | ⬜ |
| T9.5.2 | Expiration date tracking | ⬜ |
| T9.5.3 | Auto-cleanup job | ⬜ |
| T9.5.4 | Manual delete | ⬜ |

### T9.5.1: 30-day countdown display
```
Beschrijving:
Visuele countdown naar expiratie.

Acceptatiecriteria:
- [ ] Days remaining badge
- [ ] Color coding (green/yellow/red)
- [ ] Tooltip met exact date
- [ ] Sortable by expiration
```

### T9.5.2: Expiration date tracking
```
Beschrijving:
Track expiration dates.

Acceptatiecriteria:
- [ ] expiresAt field in database
- [ ] Calculated from Done date
- [ ] Extend option (admin)
- [ ] Audit log
```

### T9.5.3: Auto-cleanup job
```
Beschrijving:
Automatische cleanup van verlopen items.

Acceptatiecriteria:
- [ ] Scheduled job (daily)
- [ ] Delete expired items
- [ ] Notification before delete
- [ ] Cleanup log
```

### T9.5.4: Manual delete
```
Beschrijving:
Handmatig verwijderen van items.

Acceptatiecriteria:
- [ ] Delete button
- [ ] Confirmation required
- [ ] Admin/Vault Medewerker only
- [ ] Audit log entry
```

---

## S9.6: Vault Export

| ID | Taak | Status |
|----|------|--------|
| T9.6.1 | Export to permanent storage | ⬜ |
| T9.6.2 | Export confirmation dialog | ⬜ |
| T9.6.3 | Export mapping | ⬜ |
| T9.6.4 | Export logging | ⬜ |

### T9.6.1: Export to permanent storage
```
Beschrijving:
Export verwerkte data naar permanente opslag.

Acceptatiecriteria:
- [ ] Export action button
- [ ] Target project selection
- [ ] Data transformation
- [ ] Success/error feedback
```

### T9.6.2: Export confirmation dialog
```
Beschrijving:
Bevestiging voor export actie.

Acceptatiecriteria:
- [ ] Summary of data
- [ ] Target location
- [ ] Warnings if any
- [ ] Confirm/cancel buttons
```

### T9.6.3: Export mapping
```
Beschrijving:
Mapping configuratie voor export.

Acceptatiecriteria:
- [ ] Source → target field mapping
- [ ] Saved mapping templates
- [ ] Preview transformation
- [ ] Validation
```

### T9.6.4: Export logging
```
Beschrijving:
Log alle export acties.

Acceptatiecriteria:
- [ ] Export timestamp
- [ ] User who exported
- [ ] Target location
- [ ] Data snapshot
```

---

## S9.7: Audit Trail

| ID | Taak | Status |
|----|------|--------|
| T9.7.1 | Item history component | ⬜ |
| T9.7.2 | Action logging | ⬜ |
| T9.7.3 | Audit trail API | ⬜ |

### T9.7.1: Item history component
```
Beschrijving:
Timeline van item history.

Acceptatiecriteria:
- [ ] src/features/vault/components/ItemHistory.tsx
- [ ] Timeline UI
- [ ] All status changes
- [ ] All edits logged
- [ ] User + timestamp
```

### T9.7.2: Action logging
```
Beschrijving:
Log alle acties op items.

Acceptatiecriteria:
- [ ] Create action
- [ ] Update action
- [ ] Status change action
- [ ] Export action
- [ ] Delete action
```

### T9.7.3: Audit trail API
```
Beschrijving:
API voor audit trail data.

Acceptatiecriteria:
- [ ] GET /api/vault/[id]/history
- [ ] Paginated response
- [ ] Filter by action type
- [ ] Date range filter
```

---

# D10: EXPORT MODULE

## S10.1: Export UI

| ID | Taak | Status |
|----|------|--------|
| T10.1.1 | Export button/trigger | ⬜ |
| T10.1.2 | Export dialog component | ⬜ |
| T10.1.3 | Format selection | ⬜ |
| T10.1.4 | Options configuration | ⬜ |

### T10.1.1: Export button/trigger
```
Beschrijving:
Export button in toolbar.

Acceptatiecriteria:
- [ ] Export button in each view
- [ ] Dropdown met formats
- [ ] Keyboard shortcut
- [ ] Disabled when no data
```

### T10.1.2: Export dialog component
```
Beschrijving:
Dialog voor export configuratie.

Acceptatiecriteria:
- [ ] src/features/export/components/ExportDialog.tsx
- [ ] Modal dialog
- [ ] Step-by-step wizard
- [ ] Preview section
```

### T10.1.3: Format selection
```
Beschrijving:
Format selectie in dialog.

Acceptatiecriteria:
- [ ] PDF option
- [ ] Excel option
- [ ] CSV option
- [ ] PNG/SVG option
- [ ] Format descriptions
```

### T10.1.4: Options configuration
```
Beschrijving:
Configuratie opties per format.

Acceptatiecriteria:
- [ ] Page size (PDF)
- [ ] Orientation
- [ ] Date range
- [ ] Include/exclude filters
```

---

## S10.2: PDF Export

| ID | Taak | Status |
|----|------|--------|
| T10.2.1 | Gantt PDF export | ⬜ |
| T10.2.2 | Calendar PDF export | ⬜ |
| T10.2.3 | PDF layout options | ⬜ |
| T10.2.4 | PDF page settings | ⬜ |
| T10.2.5 | PDF API route | ⬜ |

### T10.2.1: Gantt PDF export
```
Beschrijving:
Export Gantt naar PDF.

Acceptatiecriteria:
- [ ] Bryntum PDF export feature
- [ ] Multi-page support
- [ ] Header/footer
- [ ] Legend included
```

### T10.2.2: Calendar PDF export
```
Beschrijving:
Export Calendar naar PDF.

Acceptatiecriteria:
- [ ] Calendar view export
- [ ] Date range selection
- [ ] Event details included
- [ ] Clean layout
```

### T10.2.3: PDF layout options
```
Beschrijving:
Layout opties voor PDF.

Acceptatiecriteria:
- [ ] Fit to page
- [ ] Multiple pages
- [ ] Zoom level
- [ ] Margins
```

### T10.2.4: PDF page settings
```
Beschrijving:
Page settings voor PDF.

Acceptatiecriteria:
- [ ] A4/Letter/A3 sizes
- [ ] Portrait/Landscape
- [ ] Header content
- [ ] Footer content (page numbers)
```

### T10.2.5: PDF API route
```
Beschrijving:
Server-side PDF generatie.

Acceptatiecriteria:
- [ ] POST /api/export/pdf
- [ ] Accept configuration
- [ ] Return PDF buffer
- [ ] Error handling
```

---

## S10.3: Excel Export

| ID | Taak | Status |
|----|------|--------|
| T10.3.1 | Grid Excel export | ⬜ |
| T10.3.2 | Task list Excel export | ⬜ |
| T10.3.3 | Excel formatting | ⬜ |
| T10.3.4 | Excel API route | ⬜ |

### T10.3.1: Grid Excel export
```
Beschrijving:
Export Grid data naar Excel.

Acceptatiecriteria:
- [ ] All visible columns
- [ ] Respect filters
- [ ] Cell formatting
- [ ] Auto-fit columns
```

### T10.3.2: Task list Excel export
```
Beschrijving:
Export task list naar Excel.

Acceptatiecriteria:
- [ ] Hierarchical structure
- [ ] All task fields
- [ ] Dependencies included
- [ ] Resource assignments
```

### T10.3.3: Excel formatting
```
Beschrijving:
Formatting voor Excel export.

Acceptatiecriteria:
- [ ] Header row styling
- [ ] Date formatting
- [ ] Number formatting
- [ ] Conditional formatting
```

### T10.3.4: Excel API route
```
Beschrijving:
Server-side Excel generatie.

Acceptatiecriteria:
- [ ] POST /api/export/excel
- [ ] xlsx file generation
- [ ] Return download URL
- [ ] Error handling
```

---

## S10.4: CSV Export

| ID | Taak | Status |
|----|------|--------|
| T10.4.1 | CSV generation | ⬜ |
| T10.4.2 | CSV field selection | ⬜ |
| T10.4.3 | CSV download | ⬜ |

### T10.4.1: CSV generation
```
Beschrijving:
Genereer CSV van data.

Acceptatiecriteria:
- [ ] Client-side generation
- [ ] Proper escaping
- [ ] UTF-8 encoding
- [ ] BOM for Excel compatibility
```

### T10.4.2: CSV field selection
```
Beschrijving:
Selecteer welke velden in CSV.

Acceptatiecriteria:
- [ ] Checkbox list
- [ ] Select all/none
- [ ] Preset configurations
- [ ] Remember selection
```

### T10.4.3: CSV download
```
Beschrijving:
Download CSV bestand.

Acceptatiecriteria:
- [ ] Generate blob
- [ ] Trigger download
- [ ] Filename with date
- [ ] Progress indicator
```

---

## S10.5: Image Export

| ID | Taak | Status |
|----|------|--------|
| T10.5.1 | PNG export | ⬜ |
| T10.5.2 | SVG export | ⬜ |
| T10.5.3 | Image resolution options | ⬜ |

### T10.5.1: PNG export
```
Beschrijving:
Export view als PNG.

Acceptatiecriteria:
- [ ] Bryntum export feature
- [ ] Capture visible area
- [ ] Optional full view
- [ ] High resolution
```

### T10.5.2: SVG export
```
Beschrijving:
Export view als SVG.

Acceptatiecriteria:
- [ ] Vector format
- [ ] Scalable output
- [ ] Editable in vector software
```

### T10.5.3: Image resolution options
```
Beschrijving:
Resolution opties voor images.

Acceptatiecriteria:
- [ ] 1x, 2x, 3x multiplier
- [ ] Custom dimensions
- [ ] Preview size estimate
```

---

## S10.6: Export Preview

| ID | Taak | Status |
|----|------|--------|
| T10.6.1 | Preview panel component | ⬜ |
| T10.6.2 | Preview rendering | ⬜ |
| T10.6.3 | Preview refresh on option change | ⬜ |

### T10.6.1: Preview panel component
```
Beschrijving:
Preview panel in export dialog.

Acceptatiecriteria:
- [ ] src/features/export/components/ExportPreview.tsx
- [ ] Embedded preview
- [ ] Zoom controls
- [ ] Scroll support
```

### T10.6.2: Preview rendering
```
Beschrijving:
Render preview van export.

Acceptatiecriteria:
- [ ] Thumbnail generation
- [ ] Fast rendering
- [ ] Accurate representation
- [ ] Loading state
```

### T10.6.3: Preview refresh on option change
```
Beschrijving:
Update preview bij option changes.

Acceptatiecriteria:
- [ ] Debounced refresh
- [ ] Loading indicator
- [ ] Error handling
- [ ] Cancel pending
```

---

## S10.7: Export History

| ID | Taak | Status |
|----|------|--------|
| T10.7.1 | Export log database | ⬜ |
| T10.7.2 | Export history UI | ⬜ |
| T10.7.3 | Re-download functionality | ⬜ |

### T10.7.1: Export log database
```
Beschrijving:
Database tabel voor export logs.

Acceptatiecriteria:
- [ ] export_logs table
- [ ] User, format, date
- [ ] Configuration stored
- [ ] File reference
```

### T10.7.2: Export history UI
```
Beschrijving:
UI voor export history.

Acceptatiecriteria:
- [ ] List of past exports
- [ ] Filter by format
- [ ] Date range filter
- [ ] Download link
```

### T10.7.3: Re-download functionality
```
Beschrijving:
Opnieuw downloaden van export.

Acceptatiecriteria:
- [ ] Stored files (tijdelijk)
- [ ] Re-download button
- [ ] Expiration warning
- [ ] Regenerate option
```

---

# D11: DATABASE SCHEMA

## S11.1: Core Tables

| ID | Taak | Status |
|----|------|--------|
| T11.1.1 | profiles table | ⬜ |
| T11.1.2 | workspaces table | ⬜ |
| T11.1.3 | workspace_members table | ⬜ |
| T11.1.4 | workspace_invites table | ⬜ |
| T11.1.5 | projects table | ⬜ |
| T11.1.6 | Foreign key constraints | ⬜ |

### T11.1.1: profiles table
```
Beschrijving:
User profiles tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK, FK to auth.users)
- [ ] email, full_name
- [ ] avatar_url
- [ ] created_at, updated_at
```

### T11.1.2: workspaces table
```
Beschrijving:
Workspaces tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] name, description
- [ ] type (afdeling, klant)
- [ ] settings (JSONB)
- [ ] archived_at
```

### T11.1.3: workspace_members table
```
Beschrijving:
Workspace membership tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] workspace_id (FK)
- [ ] user_id (FK)
- [ ] role (enum)
- [ ] Unique constraint (workspace_id, user_id)
```

### T11.1.4: workspace_invites table
```
Beschrijving:
Workspace invites tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] workspace_id (FK)
- [ ] email
- [ ] role
- [ ] token (unique)
- [ ] expires_at
- [ ] accepted_at
```

### T11.1.5: projects table
```
Beschrijving:
Projects tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] workspace_id (FK)
- [ ] name, description
- [ ] start_date, end_date
- [ ] settings (JSONB)
- [ ] archived_at
```

### T11.1.6: Foreign key constraints
```
Beschrijving:
Alle foreign key constraints.

Acceptatiecriteria:
- [ ] profiles → auth.users
- [ ] workspace_members → workspaces
- [ ] workspace_members → profiles
- [ ] projects → workspaces
- [ ] ON DELETE cascade/restrict correct
```

---

## S11.2: Project Tables

| ID | Taak | Status |
|----|------|--------|
| T11.2.1 | tasks table | ⬜ |
| T11.2.2 | dependencies table | ⬜ |
| T11.2.3 | resources table | ⬜ |
| T11.2.4 | assignments table | ⬜ |
| T11.2.5 | calendars table | ⬜ |
| T11.2.6 | baselines table | ⬜ |

### T11.2.1: tasks table
```
Beschrijving:
Tasks tabel voor projecten.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] parent_id (self FK, nullable)
- [ ] name, description
- [ ] start_date, end_date, duration
- [ ] percent_done
- [ ] All Bryntum fields
```

### T11.2.2: dependencies table
```
Beschrijving:
Task dependencies tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] from_task_id (FK)
- [ ] to_task_id (FK)
- [ ] type (FS, FF, SS, SF)
- [ ] lag, lag_unit
```

### T11.2.3: resources table
```
Beschrijving:
Resources tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] name
- [ ] type (human, material, equipment)
- [ ] calendar_id (FK, nullable)
- [ ] capacity
```

### T11.2.4: assignments table
```
Beschrijving:
Resource assignments tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] task_id (FK)
- [ ] resource_id (FK)
- [ ] units (percentage)
- [ ] Unique constraint (task_id, resource_id)
```

### T11.2.5: calendars table
```
Beschrijving:
Working calendars tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] name
- [ ] is_default
- [ ] intervals (JSONB)
```

### T11.2.6: baselines table
```
Beschrijving:
Project baselines tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] name
- [ ] snapshot_data (JSONB)
- [ ] created_at
```

---

## S11.3: Feature Tables

| ID | Taak | Status |
|----|------|--------|
| T11.3.1 | vault_items table | ⬜ |
| T11.3.2 | export_logs table | ⬜ |
| T11.3.3 | user_preferences table | ⬜ |
| T11.3.4 | taskboard_columns table | ⬜ |

### T11.3.1: vault_items table
```
Beschrijving:
Vault items tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] workspace_id (FK)
- [ ] source_system
- [ ] source_data (JSONB)
- [ ] status (input, processing, done)
- [ ] processed_by (FK)
- [ ] expires_at
```

### T11.3.2: export_logs table
```
Beschrijving:
Export logs tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] user_id (FK)
- [ ] format
- [ ] configuration (JSONB)
- [ ] file_url
- [ ] created_at
```

### T11.3.3: user_preferences table
```
Beschrijving:
User preferences tabel.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] user_id (FK, unique)
- [ ] theme
- [ ] default_view
- [ ] preferences (JSONB)
```

### T11.3.4: taskboard_columns table
```
Beschrijving:
Custom taskboard columns.

Acceptatiecriteria:
- [ ] id (UUID, PK)
- [ ] project_id (FK)
- [ ] name
- [ ] status_value
- [ ] sort_order
- [ ] wip_limit
```

---

## S11.4: RLS Policies

| ID | Taak | Status |
|----|------|--------|
| T11.4.1 | profiles RLS | ⬜ |
| T11.4.2 | workspaces RLS | ⬜ |
| T11.4.3 | projects RLS | ⬜ |
| T11.4.4 | tasks RLS | ⬜ |
| T11.4.5 | vault_items RLS | ⬜ |
| T11.4.6 | RLS policy testing | ⬜ |

### T11.4.1: profiles RLS
```
Beschrijving:
Row Level Security voor profiles.

Acceptatiecriteria:
- [ ] Users can read own profile
- [ ] Users can update own profile
- [ ] Admin can read all
- [ ] Workspace members can read each other
```

### T11.4.2: workspaces RLS
```
Beschrijving:
RLS voor workspaces.

Acceptatiecriteria:
- [ ] Members can read workspace
- [ ] Admin can update workspace
- [ ] Members determined by workspace_members
```

### T11.4.3: projects RLS
```
Beschrijving:
RLS voor projects.

Acceptatiecriteria:
- [ ] Workspace members can read
- [ ] Role-based write access
- [ ] Cascade from workspace membership
```

### T11.4.4: tasks RLS
```
Beschrijving:
RLS voor tasks.

Acceptatiecriteria:
- [ ] Project access determines task access
- [ ] Role-based edit rights
- [ ] Klant Viewer = read-only
```

### T11.4.5: vault_items RLS
```
Beschrijving:
RLS voor vault_items.

Acceptatiecriteria:
- [ ] Only Admin, Vault Medewerker access
- [ ] Workspace scoped
- [ ] No client access
```

### T11.4.6: RLS policy testing
```
Beschrijving:
Test alle RLS policies.

Acceptatiecriteria:
- [ ] Test script voor elke policy
- [ ] Test met verschillende rollen
- [ ] Test edge cases
- [ ] Document test results
```

---

## S11.5: Indexes

| ID | Taak | Status |
|----|------|--------|
| T11.5.1 | Foreign key indexes | ⬜ |
| T11.5.2 | Query optimization indexes | ⬜ |
| T11.5.3 | Full-text search indexes | ⬜ |

### T11.5.1: Foreign key indexes
```
Beschrijving:
Indexes op alle foreign keys.

Acceptatiecriteria:
- [ ] Index op elke FK column
- [ ] Composite indexes waar nodig
- [ ] Naming convention
```

### T11.5.2: Query optimization indexes
```
Beschrijving:
Indexes voor veelgebruikte queries.

Acceptatiecriteria:
- [ ] tasks(project_id, status)
- [ ] workspace_members(workspace_id, user_id)
- [ ] vault_items(status, expires_at)
```

### T11.5.3: Full-text search indexes
```
Beschrijving:
Indexes voor full-text search.

Acceptatiecriteria:
- [ ] tasks(name, description) GIN
- [ ] projects(name, description) GIN
- [ ] Search vector columns
```

---

## S11.6: Triggers

| ID | Taak | Status |
|----|------|--------|
| T11.6.1 | updated_at triggers | ⬜ |
| T11.6.2 | Cascade delete triggers | ⬜ |
| T11.6.3 | Audit triggers | ⬜ |

### T11.6.1: updated_at triggers
```
Beschrijving:
Automatic updated_at timestamp.

Acceptatiecriteria:
- [ ] Trigger function
- [ ] Applied to all tables
- [ ] Sets updated_at = now()
```

### T11.6.2: Cascade delete triggers
```
Beschrijving:
Custom cascade logic.

Acceptatiecriteria:
- [ ] Soft delete cascade
- [ ] Archive related records
- [ ] Notification on delete
```

### T11.6.3: Audit triggers
```
Beschrijving:
Audit logging triggers.

Acceptatiecriteria:
- [ ] Log changes to audit table
- [ ] Old/new values stored
- [ ] User tracking
- [ ] Timestamp
```

---

## S11.7: Seed Data

| ID | Taak | Status |
|----|------|--------|
| T11.7.1 | Seed profiles | ⬜ |
| T11.7.2 | Seed workspaces & projects | ⬜ |
| T11.7.3 | Seed tasks & resources | ⬜ |

### T11.7.1: Seed profiles
```
Beschrijving:
Seed test users.

Acceptatiecriteria:
- [ ] Admin user
- [ ] Vault Medewerker user
- [ ] Medewerker user
- [ ] Klant users
```

### T11.7.2: Seed workspaces & projects
```
Beschrijving:
Seed test workspaces en projects.

Acceptatiecriteria:
- [ ] 4 Afdeling workspaces
- [ ] 2 Klant workspaces
- [ ] Projects per workspace
- [ ] Member assignments
```

### T11.7.3: Seed tasks & resources
```
Beschrijving:
Seed test tasks en resources.

Acceptatiecriteria:
- [ ] Task hierarchy
- [ ] Dependencies
- [ ] Resources
- [ ] Assignments
- [ ] Realistic data
```

---

# D12: AUTH CONFIGURATION

## S12.1: Supabase Auth

| ID | Taak | Status |
|----|------|--------|
| T12.1.1 | Supabase project setup | ⬜ |
| T12.1.2 | Auth provider configuratie | ⬜ |
| T12.1.3 | Email provider setup | ⬜ |
| T12.1.4 | Auth hooks configuratie | ⬜ |

### T12.1.1: Supabase project setup
```
Beschrijving:
Supabase project aanmaken en configureren.

Acceptatiecriteria:
- [ ] Project aangemaakt
- [ ] Database connection string
- [ ] API keys gegenereerd
- [ ] Project settings configured
```

### T12.1.2: Auth provider configuratie
```
Beschrijving:
Auth providers configureren.

Acceptatiecriteria:
- [ ] Email/password enabled
- [ ] Magic link enabled (optioneel)
- [ ] OAuth providers (optioneel)
- [ ] Phone auth disabled
```

### T12.1.3: Email provider setup
```
Beschrijving:
Email provider voor auth emails.

Acceptatiecriteria:
- [ ] SMTP configured
- [ ] Or Supabase default
- [ ] Test email sending
- [ ] From address configured
```

### T12.1.4: Auth hooks configuratie
```
Beschrijving:
Database hooks na auth events.

Acceptatiecriteria:
- [ ] on_auth_user_created → create profile
- [ ] Profile sync trigger
- [ ] Error handling
```

---

## S12.2: Email Templates

| ID | Taak | Status |
|----|------|--------|
| T12.2.1 | Welcome email template | ⬜ |
| T12.2.2 | Password reset template | ⬜ |
| T12.2.3 | Invite email template | ⬜ |
| T12.2.4 | Email branding | ⬜ |

### T12.2.1: Welcome email template
```
Beschrijving:
Email template voor nieuwe users.

Acceptatiecriteria:
- [ ] Welcome message
- [ ] Getting started link
- [ ] Support contact
- [ ] Branded design
```

### T12.2.2: Password reset template
```
Beschrijving:
Email template voor password reset.

Acceptatiecriteria:
- [ ] Reset link
- [ ] Expiration notice
- [ ] Security warning
- [ ] Support contact
```

### T12.2.3: Invite email template
```
Beschrijving:
Email template voor workspace invites.

Acceptatiecriteria:
- [ ] Inviter name
- [ ] Workspace name
- [ ] Accept link
- [ ] Expiration notice
```

### T12.2.4: Email branding
```
Beschrijving:
Branding voor alle emails.

Acceptatiecriteria:
- [ ] Logo header
- [ ] Brand colors
- [ ] Consistent footer
- [ ] Responsive design
```

---

## S12.3: Auth Settings

| ID | Taak | Status |
|----|------|--------|
| T12.3.1 | JWT expiration settings | ⬜ |
| T12.3.2 | Session timeout | ⬜ |
| T12.3.3 | Rate limiting | ⬜ |
| T12.3.4 | Password policy | ⬜ |

### T12.3.1: JWT expiration settings
```
Beschrijving:
JWT token expiration configureren.

Acceptatiecriteria:
- [ ] Access token: 1 hour
- [ ] Refresh token: 7 days
- [ ] Auto-refresh logic
- [ ] Token validation
```

### T12.3.2: Session timeout
```
Beschrijving:
Session timeout configureren.

Acceptatiecriteria:
- [ ] Inactivity timeout
- [ ] Warning before timeout
- [ ] Re-auth prompt
- [ ] Remember me option
```

### T12.3.3: Rate limiting
```
Beschrijving:
Rate limiting voor auth endpoints.

Acceptatiecriteria:
- [ ] Login attempts limit
- [ ] Password reset limit
- [ ] Account lockout
- [ ] Unlock procedure
```

### T12.3.4: Password policy
```
Beschrijving:
Password requirements configureren.

Acceptatiecriteria:
- [ ] Minimum length (8)
- [ ] Require numbers
- [ ] Require special chars
- [ ] No common passwords
```

---

## S12.4: Redirect URLs

| ID | Taak | Status |
|----|------|--------|
| T12.4.1 | Development URLs | ⬜ |
| T12.4.2 | Preview URLs | ⬜ |
| T12.4.3 | Production URLs | ⬜ |

### T12.4.1: Development URLs
```
Beschrijving:
Redirect URLs voor development.

Acceptatiecriteria:
- [ ] localhost:3000 allowed
- [ ] Callback URL configured
- [ ] CORS settings
```

### T12.4.2: Preview URLs
```
Beschrijving:
Redirect URLs voor preview deployments.

Acceptatiecriteria:
- [ ] Vercel preview URLs
- [ ] Wildcard pattern
- [ ] Branch-specific URLs
```

### T12.4.3: Production URLs
```
Beschrijving:
Redirect URLs voor production.

Acceptatiecriteria:
- [ ] Production domain
- [ ] Custom domain
- [ ] HTTPS enforced
```

---

# D13: API ROUTES

## S13.1: Workspace Routes

| ID | Taak | Status |
|----|------|--------|
| T13.1.1 | GET/POST /api/workspaces | ⬜ |
| T13.1.2 | GET/PUT/DELETE /api/workspaces/[id] | ⬜ |
| T13.1.3 | /api/workspaces/[id]/members | ⬜ |
| T13.1.4 | /api/workspaces/[id]/invites | ⬜ |

### T13.1.1: GET/POST /api/workspaces
```
Beschrijving:
List en create workspaces.

Acceptatiecriteria:
- [ ] GET returns user's workspaces
- [ ] POST creates workspace
- [ ] Validation
- [ ] Auth middleware
```

### T13.1.2: GET/PUT/DELETE /api/workspaces/[id]
```
Beschrijving:
Single workspace CRUD.

Acceptatiecriteria:
- [ ] GET returns workspace detail
- [ ] PUT updates workspace
- [ ] DELETE archives workspace
- [ ] Permission checks
```

### T13.1.3: /api/workspaces/[id]/members
```
Beschrijving:
Workspace members endpoints.

Acceptatiecriteria:
- [ ] GET list members
- [ ] POST add member
- [ ] PUT update role
- [ ] DELETE remove member
```

### T13.1.4: /api/workspaces/[id]/invites
```
Beschrijving:
Workspace invites endpoints.

Acceptatiecriteria:
- [ ] GET list invites
- [ ] POST create invite
- [ ] DELETE cancel invite
- [ ] POST /accept accept invite
```

---

## S13.2: Project Routes

| ID | Taak | Status |
|----|------|--------|
| T13.2.1 | GET/POST /api/projects | ⬜ |
| T13.2.2 | GET/PUT/DELETE /api/projects/[id] | ⬜ |
| T13.2.3 | POST /api/projects/[id]/sync | ⬜ |
| T13.2.4 | POST /api/projects/[id]/baseline | ⬜ |
| T13.2.5 | POST /api/projects/[id]/complete | ⬜ |

### T13.2.1: GET/POST /api/projects
```
Beschrijving:
List en create projects.

Acceptatiecriteria:
- [ ] GET returns workspace projects
- [ ] POST creates project
- [ ] workspace_id required
- [ ] Validation
```

### T13.2.2: GET/PUT/DELETE /api/projects/[id]
```
Beschrijving:
Single project CRUD.

Acceptatiecriteria:
- [ ] GET returns full project data
- [ ] PUT updates project
- [ ] DELETE archives project
- [ ] Include tasks/resources option
```

### T13.2.3: POST /api/projects/[id]/sync
```
Beschrijving:
CrudManager sync endpoint.

Acceptatiecriteria:
- [ ] Accept Bryntum sync format
- [ ] Process adds/updates/removes
- [ ] Return sync response
- [ ] Transaction handling
```

### T13.2.4: POST /api/projects/[id]/baseline
```
Beschrijving:
Create project baseline.

Acceptatiecriteria:
- [ ] Snapshot current state
- [ ] Store in baselines table
- [ ] Return baseline id
```

### T13.2.5: POST /api/projects/[id]/complete
```
Beschrijving:
Mark project complete.

Acceptatiecriteria:
- [ ] Update project status
- [ ] Notify stakeholders
- [ ] Archive option
```

---

## S13.3: Task Routes

| ID | Taak | Status |
|----|------|--------|
| T13.3.1 | GET/POST /api/tasks | ⬜ |
| T13.3.2 | PUT/DELETE /api/tasks/[id] | ⬜ |
| T13.3.3 | POST /api/tasks/bulk | ⬜ |

### T13.3.1: GET/POST /api/tasks
```
Beschrijving:
Task CRUD endpoints.

Acceptatiecriteria:
- [ ] GET with project_id filter
- [ ] POST create task
- [ ] Return with relations
```

### T13.3.2: PUT/DELETE /api/tasks/[id]
```
Beschrijving:
Single task operations.

Acceptatiecriteria:
- [ ] PUT update task
- [ ] DELETE remove task
- [ ] Cascade dependencies
```

### T13.3.3: POST /api/tasks/bulk
```
Beschrijving:
Bulk task operations.

Acceptatiecriteria:
- [ ] Bulk create
- [ ] Bulk update
- [ ] Bulk delete
- [ ] Transaction handling
```

---

## S13.4: Resource Routes

| ID | Taak | Status |
|----|------|--------|
| T13.4.1 | GET/POST /api/resources | ⬜ |
| T13.4.2 | PUT/DELETE /api/resources/[id] | ⬜ |
| T13.4.3 | GET /api/resources/availability | ⬜ |

### T13.4.1: GET/POST /api/resources
```
Beschrijving:
Resource CRUD endpoints.

Acceptatiecriteria:
- [ ] GET with project_id filter
- [ ] POST create resource
- [ ] Return with calendar
```

### T13.4.2: PUT/DELETE /api/resources/[id]
```
Beschrijving:
Single resource operations.

Acceptatiecriteria:
- [ ] PUT update resource
- [ ] DELETE remove resource
- [ ] Handle assignments
```

### T13.4.3: GET /api/resources/availability
```
Beschrijving:
Resource availability endpoint.

Acceptatiecriteria:
- [ ] Date range parameter
- [ ] Calculate availability
- [ ] Return per resource
```

---

## S13.5: Vault Routes

| ID | Taak | Status |
|----|------|--------|
| T13.5.1 | GET /api/vault | ⬜ |
| T13.5.2 | GET/PUT /api/vault/[id] | ⬜ |
| T13.5.3 | POST /api/vault/[id]/process | ⬜ |
| T13.5.4 | POST /api/vault/[id]/export | ⬜ |

### T13.5.1: GET /api/vault
```
Beschrijving:
List vault items.

Acceptatiecriteria:
- [ ] Filter by status
- [ ] Filter by workspace
- [ ] Pagination
- [ ] Sort options
```

### T13.5.2: GET/PUT /api/vault/[id]
```
Beschrijving:
Single vault item operations.

Acceptatiecriteria:
- [ ] GET full item detail
- [ ] PUT update item
- [ ] History tracking
```

### T13.5.3: POST /api/vault/[id]/process
```
Beschrijving:
Start/update processing.

Acceptatiecriteria:
- [ ] Assign processor
- [ ] Update status
- [ ] Add notes
- [ ] Track time
```

### T13.5.4: POST /api/vault/[id]/export
```
Beschrijving:
Export vault item.

Acceptatiecriteria:
- [ ] Target project selection
- [ ] Data transformation
- [ ] Create task/record
- [ ] Log export
```

---

## S13.6: Export Routes

| ID | Taak | Status |
|----|------|--------|
| T13.6.1 | POST /api/export/pdf | ⬜ |
| T13.6.2 | POST /api/export/excel | ⬜ |
| T13.6.3 | POST /api/export/csv | ⬜ |
| T13.6.4 | POST /api/export/image | ⬜ |

### T13.6.1: POST /api/export/pdf
```
Beschrijving:
PDF export endpoint.

Acceptatiecriteria:
- [ ] Accept configuration
- [ ] Generate PDF
- [ ] Return file or URL
- [ ] Log export
```

### T13.6.2: POST /api/export/excel
```
Beschrijving:
Excel export endpoint.

Acceptatiecriteria:
- [ ] Accept configuration
- [ ] Generate .xlsx
- [ ] Return file or URL
- [ ] Log export
```

### T13.6.3: POST /api/export/csv
```
Beschrijving:
CSV export endpoint.

Acceptatiecriteria:
- [ ] Accept field selection
- [ ] Generate CSV
- [ ] Return content
```

### T13.6.4: POST /api/export/image
```
Beschrijving:
Image export endpoint.

Acceptatiecriteria:
- [ ] Accept format (PNG/SVG)
- [ ] Generate image
- [ ] Return file
```

---

## S13.7: Sync Route

| ID | Taak | Status |
|----|------|--------|
| T13.7.1 | POST /api/sync | ⬜ |
| T13.7.2 | Request parsing | ⬜ |
| T13.7.3 | Response formatting | ⬜ |

### T13.7.1: POST /api/sync
```
Beschrijving:
Bryntum CrudManager sync endpoint.

Acceptatiecriteria:
- [ ] Handle load request
- [ ] Handle sync request
- [ ] Multi-store support
- [ ] Transaction handling
```

### T13.7.2: Request parsing
```
Beschrijving:
Parse CrudManager request.

Acceptatiecriteria:
- [ ] Parse requestId
- [ ] Parse store data
- [ ] Validate structure
- [ ] Error handling
```

### T13.7.3: Response formatting
```
Beschrijving:
Format CrudManager response.

Acceptatiecriteria:
- [ ] Success response format
- [ ] Error response format
- [ ] Include sync keys
- [ ] Handle phantoms
```

---

# D14: DEPLOYMENT

## S14.1: Vercel Setup

| ID | Taak | Status |
|----|------|--------|
| T14.1.1 | Vercel project aanmaken | ⬜ |
| T14.1.2 | Git repository koppelen | ⬜ |
| T14.1.3 | Team settings | ⬜ |

### T14.1.1: Vercel project aanmaken
```
Beschrijving:
Nieuw Vercel project opzetten.

Acceptatiecriteria:
- [ ] Project aangemaakt
- [ ] Framework detected (Next.js)
- [ ] Build settings correct
```

### T14.1.2: Git repository koppelen
```
Beschrijving:
GitHub repo koppelen aan Vercel.

Acceptatiecriteria:
- [ ] Repository connected
- [ ] Auto-deploy on push
- [ ] Branch deployments
```

### T14.1.3: Team settings
```
Beschrijving:
Team toegang configureren.

Acceptatiecriteria:
- [ ] Team members added
- [ ] Roles assigned
- [ ] Billing configured
```

---

## S14.2: Environment Variables

| ID | Taak | Status |
|----|------|--------|
| T14.2.1 | Development env vars | ⬜ |
| T14.2.2 | Preview env vars | ⬜ |
| T14.2.3 | Production env vars | ⬜ |
| T14.2.4 | Env var validation | ⬜ |

### T14.2.1: Development env vars
```
Beschrijving:
Environment variables voor dev.

Acceptatiecriteria:
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_KEY
- [ ] NEXT_PUBLIC_* vars
```

### T14.2.2: Preview env vars
```
Beschrijving:
Environment variables voor previews.

Acceptatiecriteria:
- [ ] Same as dev or different
- [ ] Preview database option
- [ ] Feature flags
```

### T14.2.3: Production env vars
```
Beschrijving:
Environment variables voor production.

Acceptatiecriteria:
- [ ] Production Supabase
- [ ] Production API keys
- [ ] Analytics keys
- [ ] Secrets encrypted
```

### T14.2.4: Env var validation
```
Beschrijving:
Validate env vars at build time.

Acceptatiecriteria:
- [ ] Required vars check
- [ ] Format validation
- [ ] Build failure on missing
- [ ] Error messages
```

---

## S14.3: Domain

| ID | Taak | Status |
|----|------|--------|
| T14.3.1 | Custom domain configuratie | ⬜ |
| T14.3.2 | SSL certificate | ⬜ |
| T14.3.3 | DNS settings | ⬜ |

### T14.3.1: Custom domain configuratie
```
Beschrijving:
Custom domain toevoegen.

Acceptatiecriteria:
- [ ] Domain added to Vercel
- [ ] Verified ownership
- [ ] Primary domain set
```

### T14.3.2: SSL certificate
```
Beschrijving:
SSL certificate configureren.

Acceptatiecriteria:
- [ ] Auto SSL via Vercel
- [ ] Certificate valid
- [ ] HTTPS redirect
```

### T14.3.3: DNS settings
```
Beschrijving:
DNS records configureren.

Acceptatiecriteria:
- [ ] A record or CNAME
- [ ] Propagation verified
- [ ] www subdomain
```

---

## S14.4: CI/CD

| ID | Taak | Status |
|----|------|--------|
| T14.4.1 | Build configuratie | ⬜ |
| T14.4.2 | Preview deployments | ⬜ |
| T14.4.3 | Production deployment | ⬜ |
| T14.4.4 | Deployment notifications | ⬜ |

### T14.4.1: Build configuratie
```
Beschrijving:
Build settings configureren.

Acceptatiecriteria:
- [ ] Build command
- [ ] Output directory
- [ ] Node version
- [ ] Install command
```

### T14.4.2: Preview deployments
```
Beschrijving:
Preview deploys voor PRs.

Acceptatiecriteria:
- [ ] Auto-deploy on PR
- [ ] Unique preview URL
- [ ] Comment on PR
- [ ] Clean up on merge
```

### T14.4.3: Production deployment
```
Beschrijving:
Production deployment process.

Acceptatiecriteria:
- [ ] Deploy on main merge
- [ ] Or manual promote
- [ ] Rollback option
- [ ] Zero downtime
```

### T14.4.4: Deployment notifications
```
Beschrijving:
Notificaties bij deployment.

Acceptatiecriteria:
- [ ] Slack notification
- [ ] Email notification
- [ ] Success/failure status
- [ ] Deploy URL included
```

---

## S14.5: Monitoring

| ID | Taak | Status |
|----|------|--------|
| T14.5.1 | Vercel Analytics | ⬜ |
| T14.5.2 | Error tracking | ⬜ |
| T14.5.3 | Performance monitoring | ⬜ |

### T14.5.1: Vercel Analytics
```
Beschrijving:
Vercel Analytics activeren.

Acceptatiecriteria:
- [ ] Analytics enabled
- [ ] Web Vitals tracking
- [ ] Page views
- [ ] Real user metrics
```

### T14.5.2: Error tracking
```
Beschrijving:
Error tracking opzetten.

Acceptatiecriteria:
- [ ] Vercel Error tracking
- [ ] Or Sentry integration
- [ ] Error alerts
- [ ] Stack traces
```

### T14.5.3: Performance monitoring
```
Beschrijving:
Performance monitoring opzetten.

Acceptatiecriteria:
- [ ] Core Web Vitals
- [ ] API latency
- [ ] Database queries
- [ ] Alerts on degradation
```

---

# D15: ARCHITECTURE.md

## S15.1: System Overview

| ID | Taak | Status |
|----|------|--------|
| T15.1.1 | High-level architecture diagram | ⬜ |
| T15.1.2 | System context beschrijving | ⬜ |
| T15.1.3 | Design principles | ⬜ |

### T15.1.1: High-level architecture diagram
```
Acceptatiecriteria:
- [ ] C4 Context diagram
- [ ] Major components shown
- [ ] External systems
- [ ] Data flows
```

### T15.1.2: System context beschrijving
```
Acceptatiecriteria:
- [ ] System scope
- [ ] User types
- [ ] External dependencies
- [ ] Key constraints
```

### T15.1.3: Design principles
```
Acceptatiecriteria:
- [ ] Architectural decisions
- [ ] Trade-offs documented
- [ ] Non-functional requirements
```

---

## S15.2: Tech Stack

| ID | Taak | Status |
|----|------|--------|
| T15.2.1 | Frontend technologies | ⬜ |
| T15.2.2 | Backend technologies | ⬜ |

### T15.2.1: Frontend technologies
```
Acceptatiecriteria:
- [ ] Next.js 16 details
- [ ] React 18 features used
- [ ] Bryntum Suite 7.1.0
- [ ] TypeScript config
```

### T15.2.2: Backend technologies
```
Acceptatiecriteria:
- [ ] Supabase details
- [ ] PostgreSQL features
- [ ] API architecture
- [ ] Auth system
```

---

## S15.3: Component Architecture

| ID | Taak | Status |
|----|------|--------|
| T15.3.1 | Module structure | ⬜ |
| T15.3.2 | Feature organization | ⬜ |
| T15.3.3 | Shared components | ⬜ |
| T15.3.4 | State management | ⬜ |

### T15.3.1: Module structure
```
Acceptatiecriteria:
- [ ] Directory structure
- [ ] Module boundaries
- [ ] Import/export rules
```

### T15.3.2: Feature organization
```
Acceptatiecriteria:
- [ ] Feature folder structure
- [ ] Colocation rules
- [ ] Cross-feature imports
```

### T15.3.3: Shared components
```
Acceptatiecriteria:
- [ ] UI component library
- [ ] Atomic design approach
- [ ] Storybook reference
```

### T15.3.4: State management
```
Acceptatiecriteria:
- [ ] Server state (React Query)
- [ ] Client state (Context)
- [ ] ProjectModel as truth
- [ ] Form state
```

---

## S15.4: Data Architecture

| ID | Taak | Status |
|----|------|--------|
| T15.4.1 | Data models | ⬜ |
| T15.4.2 | Sync architecture | ⬜ |
| T15.4.3 | Caching strategy | ⬜ |
| T15.4.4 | Real-time updates | ⬜ |

### T15.4.1: Data models
```
Acceptatiecriteria:
- [ ] Entity relationship diagram
- [ ] Key entities documented
- [ ] Relationships explained
```

### T15.4.2: Sync architecture
```
Acceptatiecriteria:
- [ ] CrudManager flow
- [ ] Conflict resolution
- [ ] Offline support (future)
```

### T15.4.3: Caching strategy
```
Acceptatiecriteria:
- [ ] Client-side cache
- [ ] Server-side cache
- [ ] Invalidation strategy
```

### T15.4.4: Real-time updates
```
Acceptatiecriteria:
- [ ] Supabase Realtime
- [ ] Subscription patterns
- [ ] Optimistic updates
```

---

## S15.5: Security Architecture

| ID | Taak | Status |
|----|------|--------|
| T15.5.1 | Authentication flow | ⬜ |
| T15.5.2 | Authorization model | ⬜ |
| T15.5.3 | RLS implementation | ⬜ |
| T15.5.4 | Security best practices | ⬜ |

### T15.5.1: Authentication flow
```
Acceptatiecriteria:
- [ ] Login flow diagram
- [ ] Token handling
- [ ] Session management
```

### T15.5.2: Authorization model
```
Acceptatiecriteria:
- [ ] RBAC model
- [ ] Role hierarchy
- [ ] Permission matrix
```

### T15.5.3: RLS implementation
```
Acceptatiecriteria:
- [ ] RLS policies overview
- [ ] Performance considerations
- [ ] Testing approach
```

### T15.5.4: Security best practices
```
Acceptatiecriteria:
- [ ] OWASP considerations
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection
```

---

## S15.6: Development Guide

| ID | Taak | Status |
|----|------|--------|
| T15.6.1 | Local setup | ⬜ |
| T15.6.2 | Coding standards | ⬜ |
| T15.6.3 | Testing strategy | ⬜ |

### T15.6.1: Local setup
```
Acceptatiecriteria:
- [ ] Prerequisites
- [ ] Installation steps
- [ ] Environment setup
- [ ] First run guide
```

### T15.6.2: Coding standards
```
Acceptatiecriteria:
- [ ] TypeScript rules
- [ ] Naming conventions
- [ ] File organization
- [ ] Comment guidelines
```

### T15.6.3: Testing strategy
```
Acceptatiecriteria:
- [ ] Unit testing approach
- [ ] Integration testing
- [ ] E2E testing
- [ ] Coverage requirements
```

---

# D16: CONTRACTS.md

## S16.1: Entity Interfaces

| ID | Taak | Status |
|----|------|--------|
| T16.1.1 | Core entity interfaces | ⬜ |
| T16.1.2 | Project entity interfaces | ⬜ |
| T16.1.3 | Vault entity interfaces | ⬜ |
| T16.1.4 | Type exports | ⬜ |

### T16.1.1: Core entity interfaces
```
Acceptatiecriteria:
- [ ] User/Profile interface
- [ ] Workspace interface
- [ ] WorkspaceMember interface
```

### T16.1.2: Project entity interfaces
```
Acceptatiecriteria:
- [ ] Project interface
- [ ] Task interface
- [ ] Resource interface
- [ ] Dependency interface
```

### T16.1.3: Vault entity interfaces
```
Acceptatiecriteria:
- [ ] VaultItem interface
- [ ] VaultStatus enum
- [ ] ProcessingRecord interface
```

### T16.1.4: Type exports
```
Acceptatiecriteria:
- [ ] Barrel exports
- [ ] Type-only exports
- [ ] Documentation
```

---

## S16.2: API Contracts

| ID | Taak | Status |
|----|------|--------|
| T16.2.1 | Request schemas | ⬜ |
| T16.2.2 | Response schemas | ⬜ |
| T16.2.3 | Pagination schema | ⬜ |
| T16.2.4 | Error schema | ⬜ |

### T16.2.1: Request schemas
```
Acceptatiecriteria:
- [ ] Create request types
- [ ] Update request types
- [ ] Query parameters
```

### T16.2.2: Response schemas
```
Acceptatiecriteria:
- [ ] Success response types
- [ ] List response types
- [ ] Detail response types
```

### T16.2.3: Pagination schema
```
Acceptatiecriteria:
- [ ] Pagination params
- [ ] Pagination meta
- [ ] Cursor-based option
```

### T16.2.4: Error schema
```
Acceptatiecriteria:
- [ ] Error response type
- [ ] Field errors type
- [ ] Error codes enum
```

---

## S16.3: Event Payloads

| ID | Taak | Status |
|----|------|--------|
| T16.3.1 | Bryntum event types | ⬜ |
| T16.3.2 | WebSocket event types | ⬜ |
| T16.3.3 | Custom event types | ⬜ |

### T16.3.1: Bryntum event types
```
Acceptatiecriteria:
- [ ] Task change events
- [ ] Dependency events
- [ ] Store sync events
```

### T16.3.2: WebSocket event types
```
Acceptatiecriteria:
- [ ] Realtime change events
- [ ] Presence events
- [ ] Notification events
```

### T16.3.3: Custom event types
```
Acceptatiecriteria:
- [ ] Export events
- [ ] Vault events
- [ ] Workspace events
```

---

## S16.4: Validation Schemas

| ID | Taak | Status |
|----|------|--------|
| T16.4.1 | Zod schemas setup | ⬜ |
| T16.4.2 | Entity validation | ⬜ |
| T16.4.3 | Request validation | ⬜ |

### T16.4.1: Zod schemas setup
```
Acceptatiecriteria:
- [ ] Zod installed
- [ ] Schema organization
- [ ] Type inference
```

### T16.4.2: Entity validation
```
Acceptatiecriteria:
- [ ] Task schema
- [ ] Project schema
- [ ] Resource schema
```

### T16.4.3: Request validation
```
Acceptatiecriteria:
- [ ] Create schemas
- [ ] Update schemas
- [ ] Query schemas
```

---

## S16.5: Error Codes

| ID | Taak | Status |
|----|------|--------|
| T16.5.1 | Error code enum | ⬜ |
| T16.5.2 | Error messages | ⬜ |

### T16.5.1: Error code enum
```
Acceptatiecriteria:
- [ ] Auth error codes
- [ ] Validation error codes
- [ ] Business logic error codes
- [ ] System error codes
```

### T16.5.2: Error messages
```
Acceptatiecriteria:
- [ ] User-friendly messages
- [ ] i18n ready
- [ ] Message templates
```

---

# D17: API-DOCS.md

## S17.1: Overview

| ID | Taak | Status |
|----|------|--------|
| T17.1.1 | Base URL documentation | ⬜ |
| T17.1.2 | Authentication docs | ⬜ |

### T17.1.1: Base URL documentation
```
Acceptatiecriteria:
- [ ] Base URL per environment
- [ ] Versioning strategy
- [ ] Rate limits
```

### T17.1.2: Authentication docs
```
Acceptatiecriteria:
- [ ] Auth header format
- [ ] Token acquisition
- [ ] Token refresh
```

---

## S17.2: Workspace Endpoints

| ID | Taak | Status |
|----|------|--------|
| T17.2.1 | Workspace CRUD docs | ⬜ |
| T17.2.2 | Member endpoints docs | ⬜ |
| T17.2.3 | Invite endpoints docs | ⬜ |

### T17.2.1: Workspace CRUD docs
```
Acceptatiecriteria:
- [ ] Request/response examples
- [ ] Error codes
- [ ] Permissions required
```

### T17.2.2: Member endpoints docs
```
Acceptatiecriteria:
- [ ] Add/remove/update docs
- [ ] Role values
- [ ] Examples
```

### T17.2.3: Invite endpoints docs
```
Acceptatiecriteria:
- [ ] Create invite flow
- [ ] Accept invite flow
- [ ] Examples
```

---

## S17.3: Project Endpoints

| ID | Taak | Status |
|----|------|--------|
| T17.3.1 | Project CRUD docs | ⬜ |
| T17.3.2 | Task endpoints docs | ⬜ |
| T17.3.3 | Sync endpoint docs | ⬜ |
| T17.3.4 | Baseline endpoint docs | ⬜ |

### T17.3.1: Project CRUD docs
```
Acceptatiecriteria:
- [ ] Request/response examples
- [ ] Query parameters
- [ ] Includes/expands
```

### T17.3.2: Task endpoints docs
```
Acceptatiecriteria:
- [ ] Task structure
- [ ] Bulk operations
- [ ] Dependencies
```

### T17.3.3: Sync endpoint docs
```
Acceptatiecriteria:
- [ ] CrudManager format
- [ ] Load vs sync
- [ ] Response format
```

### T17.3.4: Baseline endpoint docs
```
Acceptatiecriteria:
- [ ] Create baseline
- [ ] List baselines
- [ ] Compare baselines
```

---

## S17.4: Vault Endpoints

| ID | Taak | Status |
|----|------|--------|
| T17.4.1 | Vault item docs | ⬜ |
| T17.4.2 | Processing docs | ⬜ |
| T17.4.3 | Export docs | ⬜ |

### T17.4.1: Vault item docs
```
Acceptatiecriteria:
- [ ] List/detail endpoints
- [ ] Status transitions
- [ ] Filter options
```

### T17.4.2: Processing docs
```
Acceptatiecriteria:
- [ ] Process endpoint
- [ ] Status updates
- [ ] Notes API
```

### T17.4.3: Export docs
```
Acceptatiecriteria:
- [ ] Export endpoint
- [ ] Target selection
- [ ] Mapping options
```

---

## S17.5: Export Endpoints

| ID | Taak | Status |
|----|------|--------|
| T17.5.1 | PDF export docs | ⬜ |
| T17.5.2 | Excel/CSV export docs | ⬜ |
| T17.5.3 | Image export docs | ⬜ |

### T17.5.1: PDF export docs
```
Acceptatiecriteria:
- [ ] Configuration options
- [ ] Page settings
- [ ] Response format
```

### T17.5.2: Excel/CSV export docs
```
Acceptatiecriteria:
- [ ] Field selection
- [ ] Format options
- [ ] Examples
```

### T17.5.3: Image export docs
```
Acceptatiecriteria:
- [ ] PNG/SVG options
- [ ] Resolution
- [ ] Response handling
```

---

## S17.6: Examples

| ID | Taak | Status |
|----|------|--------|
| T17.6.1 | cURL examples | ⬜ |
| T17.6.2 | JavaScript examples | ⬜ |
| T17.6.3 | Common workflows | ⬜ |

### T17.6.1: cURL examples
```
Acceptatiecriteria:
- [ ] Auth example
- [ ] CRUD examples
- [ ] Export example
```

### T17.6.2: JavaScript examples
```
Acceptatiecriteria:
- [ ] Fetch examples
- [ ] Supabase client examples
- [ ] Error handling
```

### T17.6.3: Common workflows
```
Acceptatiecriteria:
- [ ] Create project workflow
- [ ] Sync data workflow
- [ ] Export workflow
```

---

# M1-M7: MIRO BOARDS

## M1: Project Foundation Board

| ID | Taak | Status |
|----|------|--------|
| T-M1.1 | KR Overview frame | ⬜ |
| T-M1.2 | User flows frame | ⬜ |
| T-M1.3 | User journeys frame | ⬜ |
| T-M1.4 | Wireframes frame | ⬜ |
| T-M1.5 | Decision log frame | ⬜ |

---

## M2: Bryntum Integration Board

| ID | Taak | Status |
|----|------|--------|
| T-M2.1 | Component hierarchy frame | ⬜ |
| T-M2.2 | Gantt view frame | ⬜ |
| T-M2.3 | Calendar view frame | ⬜ |
| T-M2.4 | TaskBoard view frame | ⬜ |
| T-M2.5 | Grid view frame | ⬜ |
| T-M2.6 | Data flow frame | ⬜ |
| T-M2.7 | Sync architecture frame | ⬜ |

---

## M3: Workspace Architecture Board

| ID | Taak | Status |
|----|------|--------|
| T-M3.1 | Workspace hierarchy frame | ⬜ |
| T-M3.2 | Afdeling workspace frame | ⬜ |
| T-M3.3 | Klant workspace frame | ⬜ |
| T-M3.4 | Project structure frame | ⬜ |
| T-M3.5 | Member management frame | ⬜ |
| T-M3.6 | Data isolation frame | ⬜ |
| T-M3.7 | Navigation structure frame | ⬜ |

---

## M4: Security & Vault Board

| ID | Taak | Status |
|----|------|--------|
| T-M4.1 | RBAC matrix frame | ⬜ |
| T-M4.2 | Permission flows frame | ⬜ |
| T-M4.3 | RLS policies frame | ⬜ |
| T-M4.4 | Vault workflow frame | ⬜ |
| T-M4.5 | Vault Kanban frame | ⬜ |
| T-M4.6 | Data lifecycle frame | ⬜ |
| T-M4.7 | Audit trail frame | ⬜ |

---

## M5: Export Module Board

| ID | Taak | Status |
|----|------|--------|
| T-M5.1 | Export formats frame | ⬜ |
| T-M5.2 | PDF export frame | ⬜ |
| T-M5.3 | Excel/CSV export frame | ⬜ |
| T-M5.4 | Image export frame | ⬜ |
| T-M5.5 | Export configuration frame | ⬜ |
| T-M5.6 | Export workflow frame | ⬜ |

---

## M6: Documentation Board

| ID | Taak | Status |
|----|------|--------|
| T-M6.1 | Meta-board (board of boards) | ⬜ |
| T-M6.2 | Component templates | ⬜ |
| T-M6.3 | Flow diagram templates | ⬜ |
| T-M6.4 | Style guide | ⬜ |
| T-M6.5 | Legend and icons | ⬜ |

---

## M7: Process & Organization Board

| ID | Taak | Status |
|----|------|--------|
| T-M7.1 | Organization chart | ⬜ |
| T-M7.2 | Role definitions visual | ⬜ |
| T-M7.3 | Onboarding flows | ⬜ |
| T-M7.4 | Key procedures | ⬜ |
| T-M7.5 | Decision trees | ⬜ |
| T-M7.6 | Escalation paths | ⬜ |

---

# P1-P5: PROCESS DOCUMENTS

## P1: ROLLEN.md

| ID | Taak | Status |
|----|------|--------|
| T-P1.1 | Document structuur | ⬜ |
| T-P1.2 | Platform rollen sectie | ⬜ |
| T-P1.3 | Admin rol beschrijving | ⬜ |
| T-P1.4 | Vault Medewerker rol | ⬜ |
| T-P1.5 | Medewerker rol | ⬜ |
| T-P1.6 | Klant rollen | ⬜ |
| T-P1.7 | Organisatie rollen sectie | ⬜ |

---

## P2: PROCEDURES.md

| ID | Taak | Status |
|----|------|--------|
| T-P2.1 | Document structuur | ⬜ |
| T-P2.2 | Workspace procedures | ⬜ |
| T-P2.3 | Project procedures | ⬜ |
| T-P2.4 | Vault procedures | ⬜ |
| T-P2.5 | Alle 28 procedures | ⬜ |

---

## P3: GLOSSARY.md

| ID | Taak | Status |
|----|------|--------|
| T-P3.1 | Document structuur | ⬜ |
| T-P3.2 | A-Z termen | ⬜ |
| T-P3.3 | Afkortingen lijst | ⬜ |
| T-P3.4 | Bryntum terminologie | ⬜ |

---

## P4: TAXONOMY.md

| ID | Taak | Status |
|----|------|--------|
| T-P4.1 | Document structuur | ⬜ |
| T-P4.2 | Workspace hiërarchie | ⬜ |
| T-P4.3 | Project classificatie | ⬜ |
| T-P4.4 | Task categorieën | ⬜ |
| T-P4.5 | Status definities | ⬜ |

---

## P5: ONBOARDING.md

| ID | Taak | Status |
|----|------|--------|
| T-P5.1 | Document structuur | ⬜ |
| T-P5.2 | Admin onboarding | ⬜ |
| T-P5.3 | Medewerker onboarding | ⬜ |
| T-P5.4 | Vault Medewerker onboarding | ⬜ |
| T-P5.5 | Klant onboarding | ⬜ |
| T-P5.6 | Checklist templates | ⬜ |

---

# TAAK TOTALEN

## Per Deliverable

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
| D11: Database | 7 | 31 |
| D12: Auth Config | 4 | 15 |
| D13: API Routes | 7 | 26 |
| D14: Deployment | 5 | 17 |
| D15: ARCHITECTURE | 6 | 20 |
| D16: CONTRACTS | 5 | 16 |
| D17: API-DOCS | 6 | 18 |
| M1-M7: Miro | 43 | 72 |
| P1-P5: Process | 29 | 72 |
| **TOTAAL** | **186** | **601** |

## Status Overzicht

| Status | Aantal | Percentage |
|--------|--------|------------|
| ⬜ Pending | 601 | 100% |
| 🔄 In Progress | 0 | 0% |
| ✅ Done | 0 | 0% |
| 🚫 Blocked | 0 | 0% |

---

*Document versie: 2.0*
*Laatst bijgewerkt: 29 December 2024*
*Totaal taken: 601*
*Alle taken volledig uitgewerkt met acceptatiecriteria*
