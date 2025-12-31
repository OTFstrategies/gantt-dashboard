# Folder Ownership Matrix

> **Exclusieve eigendom** van files per chat. Geen enkele chat mag files aanpassen buiten hun domein.

---

## 1. Eigendomsregels

### 1.1 Principes

| Regel | Beschrijving |
|-------|--------------|
| **Exclusief** | Elke file heeft precies 1 eigenaar |
| **Immutable** | Ownership verandert niet tijdens development |
| **Strict** | Aanpassen van andermans files = **VERBODEN** |
| **Escalation** | Bij conflict → Orchestrator beslist |

### 1.2 Uitzondering: Shared Imports

Chats mogen wel:
- `import` statements naar andere folders
- Type references naar gedeelde types
- Gebruik van exported functions/components

Chats mogen NIET:
- Files in andere folders wijzigen
- Exports van andere folders aanpassen
- Types in `types/` wijzigen (behalve B0)

---

## 2. Ownership Matrix

### 2.1 A1: Architect

```
📁 Root Documentation
├── ARCHITECTURE.md           ← A1 ONLY
├── CONTRACTS.md              ← A1 ONLY
├── FOLDER-OWNERSHIP.md       ← A1 ONLY (deze file)
└── docs/
    └── architecture/         ← A1 ONLY
        ├── diagrams/
        ├── decisions/
        └── interfaces/
```

### 2.2 B0: Builder-Foundation

```
📁 src/
├── app/
│   ├── layout.tsx            ← B0 ONLY
│   ├── page.tsx              ← B0 ONLY
│   ├── providers.tsx         ← B0 ONLY
│   └── globals.css           ← B0 ONLY
│
├── lib/
│   ├── bryntum/              ← B0 ONLY
│   │   ├── config.ts
│   │   ├── theme.ts
│   │   ├── license.ts
│   │   └── wrappers/
│   │       ├── index.ts
│   │       ├── BryntumGanttWrapper.tsx
│   │       ├── BryntumCalendarWrapper.tsx
│   │       ├── BryntumTaskBoardWrapper.tsx
│   │       ├── BryntumSchedulerWrapper.tsx
│   │       └── BryntumGridWrapper.tsx
│   │
│   ├── project/              ← B0 ONLY
│   │   ├── ProjectContext.tsx
│   │   ├── ProjectProvider.tsx
│   │   ├── useProject.ts
│   │   └── projectConfig.ts
│   │
│   └── utils/                ← B0 ONLY
│       ├── helpers.ts
│       ├── dateUtils.ts
│       └── formatters.ts
│
├── types/                    ← B0 ONLY
│   ├── index.ts
│   ├── bryntum.d.ts
│   ├── project.d.ts
│   ├── task.d.ts
│   ├── resource.d.ts
│   ├── event.d.ts
│   └── contracts/
│       └── *.ts              ← Interfaces from A1
│
└── styles/                   ← B0 ONLY
    ├── globals.scss
    ├── variables.scss
    ├── bryntum-overrides.scss
    └── themes/
        ├── light.scss
        └── dark.scss

📁 Config Files
├── package.json              ← B0 ONLY
├── tsconfig.json             ← B0 ONLY
├── next.config.js            ← B0 ONLY
├── .eslintrc.json            ← B0 ONLY
└── .prettierrc               ← B0 ONLY
```

### 2.3 B1: Builder-Gantt

```
📁 src/
├── features/
│   └── gantt/                ← B1 ONLY
│       ├── index.ts
│       ├── components/
│       │   ├── GanttView.tsx
│       │   ├── GanttToolbar.tsx
│       │   ├── GanttColumns.tsx
│       │   ├── TaskEditor/
│       │   │   ├── TaskEditorDialog.tsx
│       │   │   ├── GeneralTab.tsx
│       │   │   ├── DependenciesTab.tsx
│       │   │   ├── ResourcesTab.tsx
│       │   │   └── NotesTab.tsx
│       │   └── features/
│       │       ├── CriticalPath.tsx
│       │       ├── Baselines.tsx
│       │       ├── ProgressLine.tsx
│       │       └── WBSColumn.tsx
│       │
│       ├── hooks/
│       │   ├── useGanttConfig.ts
│       │   ├── useTaskActions.ts
│       │   ├── useDependencies.ts
│       │   └── useGanttFeatures.ts
│       │
│       ├── utils/
│       │   ├── taskHelpers.ts
│       │   ├── dependencyHelpers.ts
│       │   └── columnConfig.ts
│       │
│       └── types/
│           └── gantt.types.ts
│
└── app/
    └── gantt/                ← B1 ONLY
        ├── page.tsx
        ├── layout.tsx
        └── loading.tsx
```

### 2.4 B2: Builder-Calendar

```
📁 src/
├── features/
│   └── calendar/             ← B2 ONLY
│       ├── index.ts
│       ├── components/
│       │   ├── CalendarView.tsx
│       │   ├── CalendarToolbar.tsx
│       │   ├── CalendarSidebar.tsx
│       │   ├── views/
│       │   │   ├── DayView.tsx
│       │   │   ├── WeekView.tsx
│       │   │   ├── MonthView.tsx
│       │   │   ├── YearView.tsx
│       │   │   └── AgendaView.tsx
│       │   ├── EventEditor/
│       │   │   ├── EventEditorDialog.tsx
│       │   │   ├── RecurrenceEditor.tsx
│       │   │   └── ResourcePicker.tsx
│       │   └── features/
│       │       ├── ResourceView.tsx
│       │       ├── ExternalDrag.tsx
│       │       └── MiniCalendar.tsx
│       │
│       ├── hooks/
│       │   ├── useCalendarConfig.ts
│       │   ├── useEventActions.ts
│       │   ├── useRecurrence.ts
│       │   └── useCalendarViews.ts
│       │
│       ├── utils/
│       │   ├── dateHelpers.ts
│       │   ├── eventHelpers.ts
│       │   └── viewConfig.ts
│       │
│       └── types/
│           └── calendar.types.ts
│
└── app/
    └── calendar/             ← B2 ONLY
        ├── page.tsx
        ├── layout.tsx
        └── loading.tsx
```

### 2.5 B3: Builder-TaskBoard

```
📁 src/
├── features/
│   └── taskboard/            ← B3 ONLY
│       ├── index.ts
│       ├── components/
│       │   ├── TaskBoardView.tsx
│       │   ├── TaskBoardToolbar.tsx
│       │   ├── Column/
│       │   │   ├── Column.tsx
│       │   │   ├── ColumnHeader.tsx
│       │   │   └── ColumnConfig.tsx
│       │   ├── Card/
│       │   │   ├── TaskCard.tsx
│       │   │   ├── CardItems.tsx
│       │   │   ├── CardEditor.tsx
│       │   │   └── CardActions.tsx
│       │   └── features/
│       │       ├── Swimlanes.tsx
│       │       ├── FilterBar.tsx
│       │       ├── WipLimits.tsx
│       │       └── QuickAdd.tsx
│       │
│       ├── hooks/
│       │   ├── useTaskBoardConfig.ts
│       │   ├── useCardActions.ts
│       │   ├── useColumnConfig.ts
│       │   └── useDragDrop.ts
│       │
│       ├── utils/
│       │   ├── columnHelpers.ts
│       │   ├── cardHelpers.ts
│       │   └── filterHelpers.ts
│       │
│       └── types/
│           └── taskboard.types.ts
│
└── app/
    └── taskboard/            ← B3 ONLY
        ├── page.tsx
        ├── layout.tsx
        └── loading.tsx
```

### 2.6 B4: Builder-Dashboard

```
📁 src/
├── features/
│   ├── dashboard/            ← B4 ONLY
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── WidgetContainer.tsx
│   │   │   ├── widgets/
│   │   │   │   ├── GanttWidget.tsx
│   │   │   │   ├── CalendarWidget.tsx
│   │   │   │   ├── TaskBoardWidget.tsx
│   │   │   │   ├── SchedulerWidget.tsx
│   │   │   │   └── StatsWidget.tsx
│   │   │   └── navigation/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       ├── Breadcrumbs.tsx
│   │   │       └── NavLinks.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDashboardConfig.ts
│   │   │   ├── useWidgetLayout.ts
│   │   │   └── useNavigation.ts
│   │   │
│   │   └── utils/
│   │       ├── layoutHelpers.ts
│   │       └── widgetConfig.ts
│   │
│   └── shared/               ← B4 ONLY
│       ├── components/
│       │   ├── LoadingSpinner.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── EmptyState.tsx
│       │   └── ConfirmDialog.tsx
│       │
│       └── hooks/
│           ├── useApiSync.ts
│           └── useToast.ts
│
└── app/
    ├── dashboard/            ← B4 ONLY
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── loading.tsx
    │
    └── api/                  ← B4 ONLY
        ├── project/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── tasks/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── resources/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── events/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── dependencies/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        └── sync/
            └── route.ts
```

---

## 3. Review & Test Files

### 3.1 Reviewer Output

```
📁 docs/reviews/              ← R0-R4 ONLY (elk eigen domain)
├── REVIEW-FOUNDATION.md      ← R0 ONLY
├── REVIEW-GANTT.md           ← R1 ONLY
├── REVIEW-CALENDAR.md        ← R2 ONLY
├── REVIEW-TASKBOARD.md       ← R3 ONLY
└── REVIEW-DASHBOARD.md       ← R4 ONLY
```

### 3.2 Tester Output

```
📁 docs/tests/                ← T0-T4 ONLY (elk eigen domain)
├── TEST-FOUNDATION.md        ← T0 ONLY
├── TEST-GANTT.md             ← T1 ONLY
├── TEST-CALENDAR.md          ← T2 ONLY
├── TEST-TASKBOARD.md         ← T3 ONLY
└── TEST-DASHBOARD.md         ← T4 ONLY
```

### 3.3 Integration & Verification

```
📁 docs/
├── INTEGRATION-REPORT.md     ← I1 ONLY
└── VERIFICATION-REPORT.md    ← V1 ONLY
```

---

## 4. Shared Resources (Read-Only voor Builders)

### 4.1 Bryntum Documentation

```
📁 Bryntum Docs (READ ONLY)
├── BRYNTUM-*.md              ← Read by all
├── GANTT-*.md                ← Read by B1, R1, T1
├── CALENDAR-*.md             ← Read by B2, R2, T2
├── TASKBOARD-*.md            ← Read by B3, R3, T3
├── SCHEDULERPRO-*.md         ← Read by B4, R4, T4
├── GRID-*.md                 ← Read by all Builders
├── DEEP-DIVE-*.md            ← Read by all
├── IMPL-*.md                 ← Read by all
└── INTEGRATION-*.md          ← Read by B4, R4, T4
```

### 4.2 Bryntum Source

```
📁 Bryntum Trial (READ ONLY)
├── /c/Users/Mick/Downloads/bryntum-gantt-trial/
├── /c/Users/Mick/Downloads/bryntum-calendar-trial/
├── /c/Users/Mick/Downloads/bryntum-taskboard-trial/
├── /c/Users/Mick/Downloads/bryntum-schedulerpro-trial/
└── /c/Users/Mick/Downloads/bryntum-grid-trial/
```

---

## 5. Quick Reference Table

| Chat | Primary Folder | Secondary Folders |
|------|----------------|-------------------|
| A1 | `docs/architecture/` | Root `.md` files |
| B0 | `src/lib/`, `src/types/`, `src/styles/` | `src/app/` (root only) |
| B1 | `src/features/gantt/` | `src/app/gantt/` |
| B2 | `src/features/calendar/` | `src/app/calendar/` |
| B3 | `src/features/taskboard/` | `src/app/taskboard/` |
| B4 | `src/features/dashboard/`, `src/features/shared/` | `src/app/dashboard/`, `src/app/api/` |
| R0-R4 | `docs/reviews/` | (own domain only) |
| T0-T4 | `docs/tests/` | (own domain only) |
| I1 | `docs/` | All (merge only) |
| V1 | `docs/` | All (read only) |

---

## 6. Violation Protocol

### Bij Ownership Violation:

1. **Detectie:** Reviewer of Tester signaleert
2. **Escalatie:** Naar Orchestrator
3. **Rollback:** Revert unauthorized changes
4. **Fix:** Builder moet binnen eigen domein oplossen
5. **Herhaling:** Bij 2e violation → chat restart

### Legitieme Cross-Chat Behoeften:

Als een Builder iets nodig heeft van een andere folder:

1. **Request:** Via Orchestrator naar juiste Builder
2. **Implementatie:** Andere Builder voegt export toe
3. **Import:** Requestor importeert nieuwe export
4. **Nooit:** Direct andere folder aanpassen

---

*Folder Ownership v1.0*
*Gantt Dashboard Project*
