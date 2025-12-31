# WBS - Gantt Dashboard Rebuild (Zonder Bryntum License)

> Work Breakdown Structure voor het herbouwen van Gantt Dashboard functionaliteit
> Datum: 30 december 2024

---

## 0. PROJECT CLEANUP (Rommel Opruimen)

### 0.1 Bryntum-Specifieke Code Verwijderen
| ID | Taak | Bestanden | Actie |
|----|------|-----------|-------|
| 0.1.1 | Verwijder LicenseProvider | `src/providers/LicenseProvider.tsx` | DELETE |
| 0.1.2 | Verwijder license.ts | `src/lib/bryntum/license.ts` | DELETE |
| 0.1.3 | Verwijder Bryntum config | `src/lib/bryntum/config.ts` | DELETE |
| 0.1.4 | Verwijder BryntumProvider | `src/providers/BryntumProvider.tsx` | REFACTOR → ProjectProvider |
| 0.1.5 | Verwijder bryntum.ts types | `src/types/bryntum.ts` | REFACTOR → project.ts |
| 0.1.6 | Verwijder GanttView | `src/components/gantt/GanttView.tsx` | REPLACE |
| 0.1.7 | Verwijder CalendarView | `src/components/calendar/CalendarView.tsx` | REPLACE |
| 0.1.8 | Verwijder TaskBoardView | `src/components/taskboard/TaskBoardView.tsx` | REPLACE |
| 0.1.9 | Verwijder ResourceGrid | `src/components/grid/ResourceGrid.tsx` | REPLACE |
| 0.1.10 | Update setup-production.ts | `scripts/setup-production.ts` | REMOVE Bryntum check |
| 0.1.11 | Update package.json | `package.json` | REMOVE Bryntum refs |
| 0.1.12 | Update .env.example | `.env.example` | REMOVE BRYNTUM_LICENSE_KEY |

### 0.2 Behouden Code (Herbruikbaar)
| ID | Bestand | Reden Behouden |
|----|---------|----------------|
| 0.2.1 | `src/types/entities.ts` | Pure business entities |
| 0.2.2 | `src/types/api.ts` | API contracts |
| 0.2.3 | `src/providers/ThemeProvider.tsx` | Generiek theme system |
| 0.2.4 | `src/hooks/useProject.ts` | Refactor voor nieuwe backend |
| 0.2.5 | `src/components/shared/*` | Alle UI components |
| 0.2.6 | `src/components/dashboard/*` | Layout components |
| 0.2.7 | `src/components/auth/*` | RBAC system |
| 0.2.8 | `src/components/workspace/*` | Workspace management |
| 0.2.9 | `src/components/vault/*` | Vault system |
| 0.2.10 | `src/components/export/ExportDialog.tsx` | Export UI (refactor backend) |
| 0.2.11 | `src/styles/variables.css` | Design tokens |

### 0.3 Documentatie Cleanup
| ID | Taak | Actie |
|----|------|-------|
| 0.3.1 | Update README.md | Verwijder Bryntum referenties |
| 0.3.2 | Update ARCHITECTURE.md | Nieuwe component architectuur |
| 0.3.3 | Archiveer API-SURFACE-*.md | Move naar /docs/archive/bryntum/ |
| 0.3.4 | Update DELIVERABLES.md | Nieuwe deliverables structuur |

---

## 1. FOUNDATION (Zelf Te Maken)

### 1.1 Type System
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 1.1.1 | Project types (zonder Bryntum) | Laag | 2 |
| 1.1.2 | Task types met scheduling fields | Laag | 2 |
| 1.1.3 | Dependency types (FS/SS/FF/SF) | Laag | 1 |
| 1.1.4 | Resource/Assignment types | Laag | 1 |
| 1.1.5 | Calendar/Interval types | Laag | 1 |
| 1.1.6 | View state types | Laag | 1 |

### 1.2 Data Layer
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 1.2.1 | ProjectProvider (state management) | Medium | 4 |
| 1.2.2 | useProject hook (CRUD) | Medium | 3 |
| 1.2.3 | useTask hook (task operations) | Medium | 3 |
| 1.2.4 | useDependency hook | Medium | 2 |
| 1.2.5 | useResource hook | Medium | 2 |
| 1.2.6 | Optimistic updates | Medium | 3 |
| 1.2.7 | Undo/Redo system | Medium | 4 |

### 1.3 API Routes
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 1.3.1 | /api/projects CRUD | Medium | 3 |
| 1.3.2 | /api/tasks CRUD + bulk | Medium | 4 |
| 1.3.3 | /api/dependencies CRUD | Medium | 2 |
| 1.3.4 | /api/resources CRUD | Medium | 2 |
| 1.3.5 | /api/assignments CRUD | Medium | 2 |
| 1.3.6 | /api/sync (batch operations) | Medium | 4 |

### 1.4 Database
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 1.4.1 | Core tables (projects, tasks) | Medium | 3 |
| 1.4.2 | Relation tables (deps, assignments) | Medium | 2 |
| 1.4.3 | RLS policies | Medium | 4 |
| 1.4.4 | Indexes | Laag | 1 |
| 1.4.5 | Triggers (updated_at, etc) | Medium | 2 |

---

## 2. GANTT VIEW

### 2.1 Zelf Te Maken (Basis)
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 2.1.1 | Timeline header (dagen/weken/maanden) | Medium | 4 |
| 2.1.2 | Task rows met hiërarchie | Medium | 4 |
| 2.1.3 | Task bars (position berekening) | Medium | 4 |
| 2.1.4 | Progress bar in task | Laag | 2 |
| 2.1.5 | Milestone weergave (diamant) | Laag | 1 |
| 2.1.6 | Expand/collapse parents | Medium | 3 |
| 2.1.7 | Zoom levels (dag/week/maand) | Medium | 4 |
| 2.1.8 | Scroll synchronisatie (grid ↔ timeline) | Medium | 4 |
| 2.1.9 | Today marker | Laag | 1 |
| 2.1.10 | Weekend highlighting | Laag | 2 |
| 2.1.11 | Task tooltips | Laag | 2 |
| 2.1.12 | Task selection | Laag | 2 |
| 2.1.13 | Left panel (task grid) | Medium | 4 |
| 2.1.14 | Column resize | Medium | 3 |
| 2.1.15 | Splitter (grid/timeline) | Medium | 2 |

### 2.2 Library Nodig (Research)
| ID | Feature | Waarom | Kandidaten |
|----|---------|--------|------------|
| 2.2.1 | Dependency arrows (SVG) | Routing algoritme complex | react-archer, custom SVG |
| 2.2.2 | Task drag & drop | Scheduling recalc complex | @hello-pangea/dnd + custom |
| 2.2.3 | Task resize | Duration recalc complex | react-resizable + custom |
| 2.2.4 | Critical path | Algoritme complex | custom (forward/backward pass) |
| 2.2.5 | Auto-scheduling | Constraint propagation | custom of frappe-gantt |
| 2.2.6 | Baselines | Ghost bars alignment | custom |
| 2.2.7 | Resource leveling | Optimalisatie algoritme | externe lib of skip |

### 2.3 Open Source Alternatieven Evalueren
| ID | Library | Licentie | Features | Trade-offs |
|----|---------|----------|----------|------------|
| 2.3.1 | frappe-gantt | MIT | Basis gantt, drag, resize | Geen dependencies, beperkt |
| 2.3.2 | gantt-task-react | MIT | React native, TypeScript | Minder features |
| 2.3.3 | dhtmlx-gantt | GPL/Comm | Volledig, Bryntum-like | GPL voor open source |
| 2.3.4 | Custom build | - | Volledige controle | Veel werk |

---

## 3. CALENDAR VIEW

### 3.1 Zelf Te Maken (Basis)
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 3.1.1 | Month view grid | Medium | 4 |
| 3.1.2 | Week view (7 kolommen) | Medium | 3 |
| 3.1.3 | Day view (uren) | Medium | 3 |
| 3.1.4 | Event rendering | Medium | 3 |
| 3.1.5 | Event positioning (overlaps) | Hoog | 6 |
| 3.1.6 | Navigation (prev/next/today) | Laag | 2 |
| 3.1.7 | Date picker sidebar | Medium | 3 |
| 3.1.8 | All-day events | Medium | 2 |
| 3.1.9 | Multi-day events | Medium | 4 |

### 3.2 Library Nodig (Research)
| ID | Feature | Waarom | Kandidaten |
|----|---------|--------|------------|
| 3.2.1 | Recurring events (RFC-5545) | RRULE parsing complex | rrule.js |
| 3.2.2 | Drag & drop events | Complex met time snapping | react-big-calendar |
| 3.2.3 | Event resize | Time calculation | react-big-calendar |
| 3.2.4 | Resource view | Kolommen per resource | react-big-calendar |

### 3.3 Open Source Alternatieven Evalueren
| ID | Library | Licentie | Features | Trade-offs |
|----|---------|----------|----------|------------|
| 3.3.1 | react-big-calendar | MIT | Volledig, drag/drop | Styling complex |
| 3.3.2 | FullCalendar | MIT/Comm | Zeer volledig | Premium features betaald |
| 3.3.3 | @schedule-x/react | MIT | Modern, TypeScript | Nieuwer, minder docs |
| 3.3.4 | Custom build | - | Volledige controle | Veel werk |

---

## 4. TASKBOARD VIEW (Kanban)

### 4.1 Zelf Te Maken (Basis)
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 4.1.1 | Column layout | Laag | 2 |
| 4.1.2 | Task cards | Laag | 2 |
| 4.1.3 | Card content (title, desc, assignee) | Laag | 2 |
| 4.1.4 | Column headers met count | Laag | 1 |
| 4.1.5 | Add task button per column | Laag | 1 |
| 4.1.6 | Card colors/labels | Laag | 2 |
| 4.1.7 | Column collapse | Medium | 2 |

### 4.2 Library Nodig (Research)
| ID | Feature | Waarom | Kandidaten |
|----|---------|--------|------------|
| 4.2.1 | Drag & drop tussen columns | Smooth animations | @hello-pangea/dnd |
| 4.2.2 | Swimlanes | Horizontal grouping | custom + dnd |
| 4.2.3 | WIP limits | Visual feedback | custom |
| 4.2.4 | Card reordering | Within column | @hello-pangea/dnd |

### 4.3 Open Source Alternatieven Evalueren
| ID | Library | Licentie | Features | Trade-offs |
|----|---------|----------|----------|------------|
| 4.3.1 | @hello-pangea/dnd | Apache 2.0 | Smooth drag/drop | Alleen DnD, rest custom |
| 4.3.2 | react-kanban | MIT | Complete kanban | Minder flexibel |
| 4.3.3 | react-trello | MIT | Trello-like | Oudere lib |
| 4.3.4 | Custom + dnd-kit | MIT | Modern, accessible | Meer werk |

---

## 5. GRID VIEW (Data Table)

### 5.1 Zelf Te Maken (Basis)
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 5.1.1 | Table layout | Laag | 2 |
| 5.1.2 | Column headers | Laag | 1 |
| 5.1.3 | Row rendering | Laag | 2 |
| 5.1.4 | Column sorting | Medium | 3 |
| 5.1.5 | Column filtering | Medium | 4 |
| 5.1.6 | Row selection | Laag | 2 |
| 5.1.7 | Pagination | Medium | 2 |

### 5.2 Library Nodig (Research)
| ID | Feature | Waarom | Kandidaten |
|----|---------|--------|------------|
| 5.2.1 | Virtual scrolling | Performance grote datasets | TanStack Virtual |
| 5.2.2 | Cell editing | Inline editing complex | TanStack Table |
| 5.2.3 | Column reorder | Drag columns | TanStack Table |
| 5.2.4 | Grouping | Tree-like grouping | TanStack Table |
| 5.2.5 | Export (CSV/Excel) | File generation | SheetJS |

### 5.3 Open Source Alternatieven Evalueren
| ID | Library | Licentie | Features | Trade-offs |
|----|---------|----------|----------|------------|
| 5.3.1 | TanStack Table | MIT | Headless, flexibel | Meer styling werk |
| 5.3.2 | AG Grid Community | MIT | Volledig, Excel-like | Enterprise features betaald |
| 5.3.3 | MUI DataGrid | MIT | Material Design | MUI dependency |
| 5.3.4 | react-table (legacy) | MIT | Simpel | Niet meer maintained |

---

## 6. EXPORT FUNCTIONALITEIT

### 6.1 Zelf Te Maken
| ID | Taak | Complexiteit | Uren |
|----|------|--------------|------|
| 6.1.1 | Export dialog UI | Laag | 2 |
| 6.1.2 | CSV export | Laag | 2 |
| 6.1.3 | JSON export | Laag | 1 |
| 6.1.4 | Export logging | Laag | 2 |

### 6.2 Library Nodig
| ID | Feature | Library | Licentie |
|----|---------|---------|----------|
| 6.2.1 | Excel export (.xlsx) | SheetJS | Apache 2.0 |
| 6.2.2 | PDF export | jsPDF + html2canvas | MIT |
| 6.2.3 | PNG export | html2canvas | MIT |

---

## 7. SCHEDULING ENGINE (Complex)

### 7.1 Optie A: Simpele Implementatie (Beperkt)
| ID | Feature | Complexiteit | Beperking |
|----|---------|--------------|-----------|
| 7.1.1 | Manual scheduling only | Laag | Geen auto-berekening |
| 7.1.2 | Basic date validation | Laag | Geen constraints |
| 7.1.3 | Simple dependency check | Medium | Geen propagation |

### 7.2 Optie B: Open Source Engine
| ID | Library | Features | Trade-offs |
|----|---------|----------|------------|
| 7.2.1 | frappe-gantt | Basis scheduling | Beperkte features |
| 7.2.2 | dhtmlx-gantt GPL | Volledige engine | GPL licentie |
| 7.2.3 | Custom algoritme | Forward/backward pass | Veel werk |

### 7.3 Optie C: Backend Scheduling
| ID | Aanpak | Voordeel | Nadeel |
|----|--------|----------|--------|
| 7.3.1 | Supabase Edge Functions | Server-side berekening | Latency |
| 7.3.2 | External API | Dedicated service | Extra infra |

---

## 8. INTEGRATIE & TESTING

### 8.1 Component Integratie
| ID | Taak | Uren |
|----|------|------|
| 8.1.1 | ViewSwitcher → nieuwe views | 2 |
| 8.1.2 | ProjectProvider → alle views | 4 |
| 8.1.3 | Sync state → UI feedback | 3 |
| 8.1.4 | Error handling → Toast | 2 |

### 8.2 Testing
| ID | Taak | Uren |
|----|------|------|
| 8.2.1 | Unit tests hooks | 4 |
| 8.2.2 | Unit tests utils | 3 |
| 8.2.3 | Component tests | 6 |
| 8.2.4 | Integration tests | 8 |
| 8.2.5 | E2E tests (kritieke flows) | 8 |

---

## SAMENVATTING

### Totaal Per Fase

| Fase | Items | Geschatte Uren |
|------|-------|----------------|
| 0. Cleanup | 27 | 8 |
| 1. Foundation | 25 | 52 |
| 2. Gantt View | 22 | 40-80* |
| 3. Calendar View | 13 | 30-50* |
| 4. TaskBoard View | 11 | 15-25* |
| 5. Grid View | 12 | 20-30* |
| 6. Export | 7 | 10 |
| 7. Scheduling | TBD | TBD |
| 8. Integratie | 9 | 40 |
| **TOTAAL** | **126** | **215-295** |

*Afhankelijk van library keuze vs custom build

### Prioriteit Volgorde

```
1. [EERST] Cleanup (0) - Verwijder Bryntum rommel
2. [BASIS] Foundation (1) - Types, hooks, API, DB
3. [MVP] TaskBoard (4) - Snelste resultaat, meeste waarde
4. [MVP] Grid (5) - Resource management
5. [CORE] Gantt (2) - Belangrijkste feature
6. [EXTRA] Calendar (3) - Nice to have
7. [EXTRA] Export (6) - Na core features
8. [LAST] Scheduling (7) - Complexst, bepaal scope
```

### Beslispunten (Research Nodig)

| # | Beslissing | Opties | Impact |
|---|------------|--------|--------|
| 1 | Gantt library | frappe-gantt vs custom | Weken werk verschil |
| 2 | Calendar library | react-big-calendar vs custom | Dagen werk verschil |
| 3 | DnD library | @hello-pangea/dnd vs dnd-kit | Styling/API verschil |
| 4 | Grid library | TanStack vs AG Grid | Features/bundle size |
| 5 | Scheduling scope | Manual vs auto | Complexiteit |

---

## VOLGENDE STAP

1. **Cleanup uitvoeren** (WBS 0.x)
2. **Library research** voor beslispunten
3. **Foundation bouwen** (WBS 1.x)
4. **MVP views** bouwen met gekozen libraries

---

*WBS versie: 1.0.0*
*Gegenereerd: 30 december 2024*
