# Plan van Aanpak: Gantt Dashboard Development

> **Strategisch ontwikkelplan** voor parallelle development met 4 Claude chats + 1 coordinator.

---

## 1. Project Overzicht

### 1.1 Doel
Een volledige project management dashboard bouwen met:
- **Gantt Chart** - Projectplanning en dependencies
- **Calendar** - Agenda en resource scheduling
- **TaskBoard** - Kanban-style task management
- **Dashboard** - Unified view met alle componenten

### 1.2 Tech Stack
| Component | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 18 |
| Scheduling | Bryntum Suite 7.1.0 |
| Styling | SCSS + Bryntum Themes |
| State | Shared ProjectModel |
| Language | TypeScript |

### 1.3 Architectuur Principe
```
                    ┌─────────────────────┐
                    │   ProjectModel      │
                    │   (Single Source    │
                    │    of Truth)        │
                    └──────────┬──────────┘
                               │
        ┌──────────┬───────────┼───────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Gantt  │ │Calendar │ │TaskBoard│ │Scheduler│ │Dashboard│
   │  View   │ │  View   │ │  View   │ │  View   │ │  View   │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 2. Chat Rolverdeling

### Overzicht

| Chat | Naam | Primair Domein | Branch |
|------|------|----------------|--------|
| **C0** | Coordinator | Architectuur, Merging | `main` |
| **C1** | Gantt Specialist | Gantt + Dependencies | `feature/gantt` |
| **C2** | Calendar Specialist | Calendar + Scheduling | `feature/calendar` |
| **C3** | TaskBoard Specialist | Kanban + Cards | `feature/taskboard` |
| **C4** | Integration Specialist | Dashboard + API | `feature/integration` |

---

## 3. Chat 0: Coordinator

### 3.1 Verantwoordelijkheden

| Taak | Beschrijving |
|------|--------------|
| **Architecture Guardian** | Bewaakt ARCHITECTURE.md contract |
| **Foundation Builder** | Bouwt shared infrastructure |
| **Merge Manager** | Merged feature branches naar main |
| **Conflict Resolver** | Lost merge conflicts op |
| **Documentation** | Houdt technische docs bij |
| **Cross-chat Communicatie** | Beantwoordt "hoe doet Chat X dit?" |

### 3.2 Owned Files

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── providers.tsx        # Context providers
├── lib/
│   ├── bryntum/
│   │   ├── config.ts        # Shared Bryntum config
│   │   ├── theme.ts         # Theme configuration
│   │   └── wrappers/
│   │       ├── BryntumGantt.tsx
│   │       ├── BryntumCalendar.tsx
│   │       ├── BryntumTaskBoard.tsx
│   │       └── BryntumScheduler.tsx
│   ├── project/
│   │   ├── ProjectContext.tsx
│   │   ├── ProjectProvider.tsx
│   │   └── useProject.ts
│   └── utils/
│       └── helpers.ts
├── types/
│   ├── bryntum.d.ts
│   ├── project.d.ts
│   └── index.ts
└── styles/
    ├── globals.scss
    └── bryntum-overrides.scss

ARCHITECTURE.md
PLAN-VAN-AANPAK.md
```

### 3.3 Foundation Taken

| # | Taak | Output |
|---|------|--------|
| F1 | Project structure opzetten | Folder structure |
| F2 | Next.js App Router configureren | layout.tsx, providers |
| F3 | Bryntum React wrappers maken | BryntumXxx.tsx components |
| F4 | Shared ProjectModel context | ProjectProvider.tsx |
| F5 | TypeScript types definiëren | types/*.d.ts |
| F6 | Theming setup | SCSS + CSS variables |
| F7 | ARCHITECTURE.md schrijven | Contract voor alle chats |

### 3.4 Merge Workflow

```bash
# Na elke feature completion:
git checkout main
git pull origin main
git merge feature/[naam] --no-ff
# Resolve conflicts indien nodig
git push origin main

# Notify andere chats:
# "Main is updated, pull latest"
```

---

## 4. Chat 1: Gantt Specialist

### 4.1 Verantwoordelijkheden

| Taak | Beschrijving |
|------|--------------|
| **Gantt Component** | Complete Gantt chart implementatie |
| **Task Management** | CRUD voor tasks |
| **Dependencies** | Dependency lines en editing |
| **Critical Path** | Critical path highlighting |
| **Baselines** | Baseline comparison |
| **WBS** | Work Breakdown Structure |

### 4.2 Owned Files

```
src/features/gantt/
├── components/
│   ├── GanttView.tsx           # Main Gantt container
│   ├── GanttToolbar.tsx        # Toolbar met acties
│   ├── GanttColumns.tsx        # Column definitions
│   ├── TaskEditor/
│   │   ├── TaskEditorDialog.tsx
│   │   ├── GeneralTab.tsx
│   │   ├── DependenciesTab.tsx
│   │   └── ResourcesTab.tsx
│   └── features/
│       ├── CriticalPath.tsx
│       ├── Baselines.tsx
│       └── ProgressLine.tsx
├── hooks/
│   ├── useGanttConfig.ts
│   ├── useTaskActions.ts
│   └── useDependencies.ts
├── utils/
│   ├── taskHelpers.ts
│   └── dependencyHelpers.ts
└── index.ts                    # Public exports

src/app/gantt/
└── page.tsx                    # Gantt route
```

### 4.3 Taken

| # | Taak | Prioriteit | Complexiteit |
|---|------|------------|--------------|
| G1 | Basic Gantt rendering | P0 | Medium |
| G2 | Task CRUD operations | P0 | Medium |
| G3 | Dependency lines | P0 | High |
| G4 | Column configuration | P1 | Low |
| G5 | Task editor dialog | P1 | Medium |
| G6 | Critical path feature | P1 | Medium |
| G7 | Baselines feature | P2 | Medium |
| G8 | Progress line | P2 | Low |
| G9 | Export (PDF/Excel) | P2 | High |
| G10 | Undo/Redo integration | P2 | Medium |

### 4.4 Te Lezen Documentatie

```
Primair:
├── GANTT-DEEP-DIVE-*.md (6 docs)
├── GANTT-IMPL-*.md (uit Track C)
├── INTEGRATION-MS-PROJECT.md
└── INTEGRATION-EXTJS.md (migration patterns)

Secundair:
├── DEEP-DIVE-DEPENDENCIES.md
├── DEEP-DIVE-SCHEDULING.md
├── IMPL-SCHEDULING-ENGINE.md
└── GANTT-IMPL-CALENDARS-ADVANCED.md
```

### 4.5 Dependencies

| Afhankelijk van | Reden |
|-----------------|-------|
| C0: ProjectContext | Shared ProjectModel |
| C0: BryntumGantt wrapper | Base component |
| C4: API endpoints | Data persistence |

### 4.6 Levert aan

| Levert aan | Wat |
|------------|-----|
| C4: Dashboard | GanttView component |
| C2: Calendar | Task data (via ProjectModel) |

---

## 5. Chat 2: Calendar Specialist

### 5.1 Verantwoordelijkheden

| Taak | Beschrijving |
|------|--------------|
| **Calendar Component** | Complete calendar implementatie |
| **Views** | Day, Week, Month, Year, Agenda |
| **Event Management** | CRUD voor events |
| **Resource Scheduling** | Resource-based views |
| **Recurring Events** | Recurrence rules |
| **Sidebar** | Mini calendar, filters |

### 5.2 Owned Files

```
src/features/calendar/
├── components/
│   ├── CalendarView.tsx        # Main container
│   ├── CalendarToolbar.tsx     # View switcher, nav
│   ├── CalendarSidebar.tsx     # Mini cal, filters
│   ├── views/
│   │   ├── DayView.tsx
│   │   ├── WeekView.tsx
│   │   ├── MonthView.tsx
│   │   └── AgendaView.tsx
│   ├── EventEditor/
│   │   ├── EventEditorDialog.tsx
│   │   └── RecurrenceEditor.tsx
│   └── features/
│       ├── ResourceView.tsx
│       └── ExternalDrag.tsx
├── hooks/
│   ├── useCalendarConfig.ts
│   ├── useEventActions.ts
│   └── useRecurrence.ts
├── utils/
│   └── dateHelpers.ts
└── index.ts

src/app/calendar/
└── page.tsx
```

### 5.3 Taken

| # | Taak | Prioriteit | Complexiteit |
|---|------|------------|--------------|
| CA1 | Basic Calendar rendering | P0 | Medium |
| CA2 | View switching (Day/Week/Month) | P0 | Medium |
| CA3 | Event CRUD | P0 | Medium |
| CA4 | Event editor dialog | P1 | Medium |
| CA5 | Sidebar met mini calendar | P1 | Low |
| CA6 | Resource view | P1 | High |
| CA7 | Recurring events | P2 | High |
| CA8 | Drag from external | P2 | Medium |
| CA9 | Export (ICS) | P2 | Low |
| CA10 | Agenda view | P2 | Low |

### 5.4 Te Lezen Documentatie

```
Primair:
├── CALENDAR-DEEP-DIVE-*.md (18 docs)
├── CALENDAR-IMPL-*.md (18 docs)
└── CALENDAR-INTERNALS-*.md (2 docs)

Secundair:
├── DEEP-DIVE-EVENTS.md
├── IMPL-NESTED-EVENTS.md
└── GANTT-IMPL-CALENDARS-ADVANCED.md
```

### 5.5 Dependencies

| Afhankelijk van | Reden |
|-----------------|-------|
| C0: ProjectContext | Shared ProjectModel |
| C0: BryntumCalendar wrapper | Base component |
| C4: API endpoints | Data persistence |

### 5.6 Levert aan

| Levert aan | Wat |
|------------|-----|
| C4: Dashboard | CalendarView component |

---

## 6. Chat 3: TaskBoard Specialist

### 6.1 Verantwoordelijkheden

| Taak | Beschrijving |
|------|--------------|
| **TaskBoard Component** | Kanban board implementatie |
| **Columns/Swimlanes** | Column configuration |
| **Cards** | Task card rendering |
| **Drag & Drop** | Card movement |
| **WIP Limits** | Work in progress limits |
| **Filtering** | Filter bar |

### 6.2 Owned Files

```
src/features/taskboard/
├── components/
│   ├── TaskBoardView.tsx       # Main container
│   ├── TaskBoardToolbar.tsx    # Actions, filters
│   ├── Column/
│   │   ├── Column.tsx
│   │   ├── ColumnHeader.tsx
│   │   └── ColumnConfig.tsx
│   ├── Card/
│   │   ├── TaskCard.tsx
│   │   ├── CardItems.tsx
│   │   └── CardEditor.tsx
│   └── features/
│       ├── Swimlanes.tsx
│       ├── FilterBar.tsx
│       └── WipLimits.tsx
├── hooks/
│   ├── useTaskBoardConfig.ts
│   ├── useCardActions.ts
│   └── useColumnConfig.ts
├── utils/
│   └── columnHelpers.ts
└── index.ts

src/app/taskboard/
└── page.tsx
```

### 6.3 Taken

| # | Taak | Prioriteit | Complexiteit |
|---|------|------------|--------------|
| TB1 | Basic TaskBoard rendering | P0 | Medium |
| TB2 | Column configuration | P0 | Medium |
| TB3 | Card drag & drop | P0 | Medium |
| TB4 | Task card rendering | P1 | Medium |
| TB5 | Card editor | P1 | Medium |
| TB6 | Filter bar | P1 | Low |
| TB7 | Swimlanes | P2 | Medium |
| TB8 | WIP limits | P2 | Low |
| TB9 | Column collapse | P2 | Low |
| TB10 | Card items (tags, progress) | P2 | Medium |

### 6.4 Te Lezen Documentatie

```
Primair:
├── TASKBOARD-DEEP-DIVE-*.md (8 docs)
├── TASKBOARD-IMPL-*.md (10 docs)
└── TASKBOARD-INTERNALS-*.md (2 docs)

Secundair:
├── DEEP-DIVE-DRAG-DROP.md
└── INTERNALS-DRAG-DROP.md
```

### 6.5 Dependencies

| Afhankelijk van | Reden |
|-----------------|-------|
| C0: ProjectContext | Shared ProjectModel |
| C0: BryntumTaskBoard wrapper | Base component |
| C4: API endpoints | Data persistence |

### 6.6 Levert aan

| Levert aan | Wat |
|------------|-----|
| C4: Dashboard | TaskBoardView component |

---

## 7. Chat 4: Integration Specialist

### 7.1 Verantwoordelijkheden

| Taak | Beschrijving |
|------|--------------|
| **Dashboard** | Unified multi-widget view |
| **API Layer** | Next.js API routes |
| **Data Sync** | CrudManager configuration |
| **Navigation** | App navigation |
| **Layout** | Responsive layouts |
| **Integration** | Component orchestration |

### 7.2 Owned Files

```
src/features/dashboard/
├── components/
│   ├── DashboardView.tsx       # Main dashboard
│   ├── DashboardLayout.tsx     # Grid layout
│   ├── WidgetContainer.tsx     # Widget wrapper
│   ├── widgets/
│   │   ├── GanttWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── TaskBoardWidget.tsx
│   │   └── StatsWidget.tsx
│   └── navigation/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Breadcrumbs.tsx
├── hooks/
│   ├── useDashboardConfig.ts
│   └── useWidgetLayout.ts
└── index.ts

src/app/
├── dashboard/
│   └── page.tsx
└── api/
    ├── project/
    │   ├── route.ts            # GET/POST project
    │   └── [id]/route.ts       # CRUD by ID
    ├── tasks/
    │   └── route.ts
    ├── resources/
    │   └── route.ts
    └── sync/
        └── route.ts            # CrudManager endpoint

src/features/shared/
├── components/
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   └── EmptyState.tsx
└── hooks/
    └── useApiSync.ts
```

### 7.3 Taken

| # | Taak | Prioriteit | Complexiteit |
|---|------|------------|--------------|
| I1 | API routes setup | P0 | Medium |
| I2 | CrudManager config | P0 | High |
| I3 | Dashboard layout | P0 | Medium |
| I4 | Widget containers | P1 | Medium |
| I5 | Navigation/Sidebar | P1 | Low |
| I6 | Gantt widget integration | P1 | Low |
| I7 | Calendar widget integration | P1 | Low |
| I8 | TaskBoard widget integration | P1 | Low |
| I9 | Stats widget | P2 | Medium |
| I10 | Responsive layout | P2 | Medium |
| I11 | Real-time sync (WebSocket) | P3 | High |

### 7.4 Te Lezen Documentatie

```
Primair:
├── INTEGRATION-*.md (alle)
├── DEEP-DIVE-CRUDMANAGER.md
├── INTEGRATION-WEBSOCKETS.md
└── INTEGRATION-NODEJS.md

Secundair:
├── DEEP-DIVE-DATA-FLOW.md
├── DEEP-DIVE-REACT-INTEGRATION.md
└── IMPL-EXPORT-SERVER.md
```

### 7.5 Dependencies

| Afhankelijk van | Reden |
|-----------------|-------|
| C0: ProjectContext | Shared ProjectModel |
| C0: All wrappers | Base components |
| C1: GanttView | Dashboard widget |
| C2: CalendarView | Dashboard widget |
| C3: TaskBoardView | Dashboard widget |

### 7.6 Levert aan

| Levert aan | Wat |
|------------|-----|
| Alle chats | API endpoints |
| Eindgebruiker | Complete dashboard |

---

## 8. Dependency Graph

```
                            ┌─────────────────┐
                            │   Coordinator   │
                            │      (C0)       │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              Foundation      Architecture      Merge/QA
                    │                │                │
    ┌───────────────┼────────────────┼────────────────┤
    │               │                │                │
    ▼               ▼                ▼                ▼
┌───────┐      ┌───────┐       ┌───────┐       ┌───────┐
│  C1   │      │  C2   │       │  C3   │       │  C4   │
│ Gantt │      │ Cal.  │       │ Board │       │ Dash  │
└───┬───┘      └───┬───┘       └───┬───┘       └───┬───┘
    │              │               │               │
    │              │               │               │
    └──────────────┴───────────────┴───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Dashboard   │
                    │   (Final)     │
                    └───────────────┘
```

---

## 9. Tijdlijn & Fasering

### Fase 0: Planning (Nu)
- [x] Plan van Aanpak opstellen
- [ ] Coordinator prompt ontwerpen
- [ ] Architecture document schrijven

### Fase 1: Foundation (C0 alleen)
**Duur: 1-2 sessies**

| Dag | Activiteit |
|-----|------------|
| 1 | Project structure, Next.js setup |
| 2 | Bryntum wrappers, ProjectContext |
| 3 | Types, Theming, ARCHITECTURE.md |

### Fase 2: Parallel Development (C1-C4)
**Duur: 3-5 sessies per chat**

| Week | C1 (Gantt) | C2 (Calendar) | C3 (Board) | C4 (Dash) |
|------|------------|---------------|------------|-----------|
| 1 | G1-G3 | CA1-CA3 | TB1-TB3 | I1-I3 |
| 2 | G4-G6 | CA4-CA6 | TB4-TB6 | I4-I8 |
| 3 | G7-G10 | CA7-CA10 | TB7-TB10 | I9-I11 |

### Fase 3: Integration (C0 + C4)
**Duur: 1-2 sessies**

| Activiteit |
|------------|
| Final merge alle branches |
| Integration testing |
| Bug fixes |
| Documentation |

---

## 10. Communicatie Protocol

### 10.1 Start van elke Chat Sessie

```markdown
## Session Start Protocol

1. Pull latest van main:
   git checkout main && git pull

2. Checkout feature branch:
   git checkout feature/[naam]

3. Merge main into feature:
   git merge main

4. Lees ARCHITECTURE.md voor updates

5. Check CHANGELOG.md voor cross-chat updates
```

### 10.2 Einde van elke Chat Sessie

```markdown
## Session End Protocol

1. Commit alle changes:
   git add -A && git commit -m "feat(gantt): beschrijving"

2. Push naar remote:
   git push origin feature/[naam]

3. Noteer in CHANGELOG.md wat je hebt gedaan

4. Als klaar voor merge → notify coordinator
```

### 10.3 Cross-Chat Vragen

Als een chat iets nodig heeft van een andere chat:

```markdown
## Request Format

**From:** C1 (Gantt)
**To:** C0 (Coordinator)
**Subject:** Need shared utility function

**Request:**
Ik heb een date formatting utility nodig die ook door Calendar
gebruikt wordt. Kan dit in src/lib/utils/ komen?

**Urgency:** Medium (kan door zonder, maar duplicatie voorkomen)
```

---

## 11. Success Criteria

### Per Chat

| Chat | Definition of Done |
|------|-------------------|
| C0 | Foundation werkt, alle chats kunnen starten |
| C1 | Gantt chart toont tasks, dependencies werken |
| C2 | Calendar toont events, view switching werkt |
| C3 | TaskBoard toont cards, drag & drop werkt |
| C4 | Dashboard toont alle widgets, API werkt |

### Project

| Criterium | Requirement |
|-----------|-------------|
| Functioneel | Alle P0 en P1 taken compleet |
| Integratie | Alle views delen zelfde ProjectModel |
| Performance | Smooth scrolling, < 2s initial load |
| Code Quality | TypeScript strict, geen console errors |

---

## 12. Risico's & Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Merge conflicts | High | Strikte folder ownership |
| Inconsistente code style | Medium | Shared ESLint/Prettier |
| Context verlies tussen sessies | Medium | Goede session protocols |
| Bryntum API changes | Low | Pin versie op 7.1.0 |
| Dependency cycles | High | Clear dependency graph |

---

*Document versie: 1.0*
*Laatst bijgewerkt: December 2024*
