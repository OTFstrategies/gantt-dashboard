# DELIVERABLES - Miro Boards (M1-M7)

> **Versie:** 1.0
> **Datum:** 2024-12-29
> **Categorie:** Miro Boards
> **Deliverables:** M1-M7

[< Terug naar DELIVERABLES.md](./DELIVERABLES.md)

---

## Overzicht Miro Boards

| Code | Naam | Outcome | Frames | Taken | Status |
|------|------|---------|--------|-------|--------|
| M1 | O1 Samenwerking Board | O1: Gestandaardiseerde Samenwerking | 5 | 10 | Pending |
| M2 | O2 Unified View Board | O2: Unified Project View | 7 | 14 | Pending |
| M3 | O3-O4 Toegang Board | O3-O4: Afdelingsscheiding & Klantsamenwerking | 7 | 10 | Pending |
| M4 | O5-O6 Security Board | O5-O6: Toegangscontrole & Dataverwerking | 7 | 12 | Pending |
| M5 | O7 Export Board | O7: Data Export | 6 | 8 | Pending |
| M6 | O8 Visual Docs Board | O8: Visuele Documentatie | 5 | 8 | Pending |
| M7 | O9 Rollen Board | O9: Rollen & Procedures | 6 | 10 | Pending |
| **TOTAAL** | | | **43** | **72** | |

---

## Miro Board Structuur

Elk Miro board volgt een consistente structuur:

```
Board
├── Header Frame (titel, versie, legenda)
├── Content Frames (per topic)
│   ├── Diagrams
│   ├── User Journeys
│   ├── Wireframes
│   └── Decisions
└── Footer Frame (links, versie historie)
```

### Standaard Elementen

| Element | Kleur | Gebruik |
|---------|-------|---------|
| Frame | Grijs | Container voor content |
| Sticky (Geel) | #FFEB3B | Notities, ideeën |
| Sticky (Blauw) | #2196F3 | Requirements |
| Sticky (Groen) | #4CAF50 | Beslissingen |
| Sticky (Rood) | #F44336 | Risico's, blockers |
| Shape (Rechthoek) | Wit | UI wireframes |
| Arrow | Zwart | Flow, relaties |

---

# M1: O1 Samenwerking Board

## Doelstelling

Visualiseer hoe alle afdelingen samenwerken binnen het platform volgens een gestandaardiseerde werkwijze.

## Scope

### Wat WEL
- Key Results visualisatie voor O1
- Samenwerking flows tussen afdelingen
- User journeys per afdeling
- Platform wireframes (dashboard, navigation)
- Architectuur beslissingen

### Wat NIET
- Technische implementatie details
- Database schemas
- API specificaties
- Code voorbeelden

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Board te complex | Medium | Modulaire frames |
| Inconsistente stijl | Laag | Template gebruiken |
| Verouderde content | Medium | Review cyclus |
| Slechte navigatie | Laag | Duidelijke structuur |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Frame compleetheid | 5/5 | TBD | - |
| Stakeholder approval | Yes | TBD | - |
| Navigeerbaarheid | Good | TBD | - |
| Visual clarity | Good | TBD | - |

## Definition of Done

- [ ] Header frame met titel en legenda
- [ ] Key Results frame met O1 KRs
- [ ] Samenwerking flow diagram
- [ ] User journeys per afdeling
- [ ] Dashboard wireframe
- [ ] Decision log frame
- [ ] Footer met links
- [ ] Stakeholder review passed

## RACI Matrix

| Activiteit | A0 | A1 | A2 | A3 (Docs) |
|------------|-----|-----|-----|-----------|
| Board setup | I | I | I | R/A |
| KR visualization | R/A | C | C | A |
| Flow diagrams | C | C | C | R/A |
| Wireframes | I | C | I | R/A |
| Review | R/A | C | C | A |

## Frames

### Frame 1: Header & Overview
```
┌─────────────────────────────────────────────────────────────┐
│  O1: GESTANDAARDISEERDE SAMENWERKING                        │
│  ──────────────────────────────────────────────────────      │
│  Outcome: "Alle afdelingen werken volgens dezelfde          │
│  ISO-conforme werkwijze in één gedeeld platform"            │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ KR1.1   │  │ KR1.2   │  │ KR1.3   │  │ KR1.4   │         │
│  │ 4+ WS   │  │Template │  │Uniform  │  │Settings │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│                                                              │
│  [Legenda]  [Versie: 1.0]  [Datum: 2024-12-29]             │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: Samenwerking Flow
```
┌─────────────────────────────────────────────────────────────┐
│  SAMENWERKING FLOW                                          │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │Afdeling A│───▶│ Platform │◀───│Afdeling B│               │
│  └──────────┘    │          │    └──────────┘               │
│       │          │ ┌──────┐ │         │                     │
│       │          │ │Shared│ │         │                     │
│       │          │ │Data  │ │         │                     │
│       ▼          │ └──────┘ │         ▼                     │
│  ┌──────────┐    │          │    ┌──────────┐               │
│  │Afdeling C│───▶│          │◀───│Afdeling D│               │
│  └──────────┘    └──────────┘    └──────────┘               │
│                                                              │
│  Isolatie: Elke afdeling ziet alleen eigen data             │
│  Delen: Via expliciete workspace invites                    │
└─────────────────────────────────────────────────────────────┘
```

### Frame 3: User Journeys
```
┌─────────────────────────────────────────────────────────────┐
│  USER JOURNEYS PER AFDELING                                 │
│                                                              │
│  Admin Journey:                                              │
│  Login → Workspace beheer → Users uitnodigen → Settings     │
│                                                              │
│  Medewerker Journey:                                         │
│  Login → Project selecteren → Gantt/Calendar → Taken edit   │
│                                                              │
│  Klant Journey:                                              │
│  Invite ontvangen → Registreren → Project view (read-only)  │
└─────────────────────────────────────────────────────────────┘
```

### Frame 4: Dashboard Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD WIREFRAME                                        │
│                                                              │
│  ┌────────┬──────────────────────────────────────────────┐  │
│  │        │  [Logo]  [Search]           [User] [Settings]│  │
│  │        ├──────────────────────────────────────────────┤  │
│  │Sidebar │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │
│  │        │  │ Gantt   │ │Calendar │ │TaskBoard│ [Grid] │  │
│  │- Home  │  └─────────┘ └─────────┘ └─────────┘         │  │
│  │- Gantt │  ┌─────────────────────────────────────────┐ │  │
│  │- Cal   │  │                                          │ │  │
│  │- Board │  │        [Active View Content]             │ │  │
│  │- Grid  │  │                                          │ │  │
│  │        │  │                                          │ │  │
│  │- Vault │  └─────────────────────────────────────────┘ │  │
│  └────────┴──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Frame 5: Decisions
```
┌─────────────────────────────────────────────────────────────┐
│  ARCHITECTUUR BESLISSINGEN                                  │
│                                                              │
│  ✅ BESLUIT: Single ProjectModel voor alle views            │
│     Reden: Data consistentie, real-time sync                │
│     Alternatief: Separate stores per view (afgewezen)       │
│                                                              │
│  ✅ BESLUIT: Workspace-based isolation                      │
│     Reden: Duidelijke scheiding, flexibele toegang          │
│     Alternatief: Project-based (te fijnmazig)               │
│                                                              │
│  ✅ BESLUIT: Nederlandse UI als default                     │
│     Reden: Target audience                                  │
│     Alternatief: Engels (optioneel later)                   │
└─────────────────────────────────────────────────────────────┘
```

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M1-board-id]/ |
| Export | `docs/miro/M1-samenwerking.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O1 Key Results |
| Referenced by | D15 | Architecture diagrams |
| Links to | M2-M7 | Other boards |

---

# M2: O2 Unified View Board

## Doelstelling

Visualiseer de 4 verschillende views (Gantt, Calendar, TaskBoard, Grid) en hoe ze samenwerken via een gedeeld ProjectModel.

## Scope

### Wat WEL
- View comparisons (use cases)
- Data flow tussen views
- Sync architectuur
- Feature matrices per view
- View wireframes
- Interactie flows

### Wat NIET
- Code implementatie
- API endpoints
- Database queries
- Performance metrics

## Premortem

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Te veel features | Hoog | Prioriteer core features |
| Onduidelijke sync | Medium | Duidelijke diagrammen |
| View overlap confusie | Medium | Duidelijke use cases |

## Postmortem

| Criterium | Verwacht | Werkelijk | Status |
|-----------|----------|-----------|--------|
| Frame compleetheid | 7/7 | TBD | - |
| View clarity | Good | TBD | - |
| Sync understanding | Clear | TBD | - |

## Definition of Done

- [ ] Header frame
- [ ] View comparison matrix
- [ ] Gantt view wireframe + features
- [ ] Calendar view wireframe + features
- [ ] TaskBoard view wireframe + features
- [ ] Grid view wireframe + features
- [ ] Data flow diagram
- [ ] Sync sequence diagram

## RACI Matrix

| Activiteit | A0 | A1 | A2 | A3 (Docs) |
|------------|-----|-----|-----|-----------|
| View wireframes | I | C | I | R/A |
| Feature matrix | I | R/A | I | A |
| Sync diagrams | I | C | C | R/A |

## Frames

### Frame 1: View Overview
```
┌─────────────────────────────────────────────────────────────┐
│  O2: UNIFIED PROJECT VIEW                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    ProjectModel                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ TaskStore | ResourceStore | DependencyStore | ... │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│           │              │              │              │     │
│           ▼              ▼              ▼              ▼     │
│       ┌───────┐     ┌────────┐    ┌──────────┐   ┌──────┐  │
│       │ Gantt │     │Calendar│    │TaskBoard │   │ Grid │  │
│       │ View  │     │ View   │    │  View    │   │ View │  │
│       └───────┘     └────────┘    └──────────┘   └──────┘  │
│                                                              │
│  Sync: Wijziging in één view → automatisch in alle views    │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: View Comparison Matrix
```
┌─────────────────────────────────────────────────────────────┐
│  VIEW COMPARISON MATRIX                                     │
│                                                              │
│  Use Case              │ Gantt │ Cal │ Board │ Grid │       │
│  ─────────────────────────────────────────────────────      │
│  Timeline planning     │  ★★★  │ ★   │  ★    │  -   │       │
│  Resource scheduling   │  ★★   │ ★★★ │  ★    │  ★   │       │
│  Status workflow       │  ★    │ ★   │  ★★★  │  ★   │       │
│  Bulk data editing     │  ★    │ -   │  -    │  ★★★ │       │
│  Dependencies          │  ★★★  │ -   │  -    │  ★   │       │
│  Progress tracking     │  ★★★  │ ★   │  ★★   │  ★★  │       │
│  Daily overview        │  ★    │ ★★★ │  ★★   │  ★   │       │
│                                                              │
│  ★★★ = Best fit  ★★ = Good  ★ = Possible  - = Not suited   │
└─────────────────────────────────────────────────────────────┘
```

### Frame 3: Gantt View Features
```
┌─────────────────────────────────────────────────────────────┐
│  GANTT VIEW FEATURES (KR2.1-2.24)                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Toolbar: Zoom | Filter | Export | Undo]            │   │
│  ├───────────────┬─────────────────────────────────────┤   │
│  │ Task Name     │ ████████░░░░░░░░░░░░░░░░░░░░░      │   │
│  │ └─ Subtask    │      ████░░░░░                      │   │
│  │ Task 2        │          ████████████               │   │
│  │ Milestone ◆   │               ◆                     │   │
│  ├───────────────┴─────────────────────────────────────┤   │
│  │ [Timeline: Jan | Feb | Mar | Apr | May | Jun]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Features: Dependencies, Critical Path, Baselines,          │
│  Progress Line, Labels, Constraints, Resources              │
└─────────────────────────────────────────────────────────────┘
```

### Frame 4-6: Other View Wireframes
(Similar structure for Calendar, TaskBoard, Grid)

### Frame 7: Sync Sequence
```
┌─────────────────────────────────────────────────────────────┐
│  SYNC SEQUENCE DIAGRAM                                      │
│                                                              │
│  User        Gantt       ProjectModel     API      DB       │
│   │           │              │            │        │        │
│   │──drag──▶  │              │            │        │        │
│   │           │──update──▶   │            │        │        │
│   │           │              │──sync──────────────▶│        │
│   │           │              │◀───────────response─│        │
│   │           │◀──refresh────│            │        │        │
│   │           │              │            │        │        │
│   │  [Calendar auto-refreshes]            │        │        │
│   │  [TaskBoard auto-refreshes]           │        │        │
│   │  [Grid auto-refreshes]                │        │        │
└─────────────────────────────────────────────────────────────┘
```

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M2-board-id]/ |
| Export | `docs/miro/M2-unified-view.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O2 Key Results (74 KRs) |
| References | D2-D5 | View module specs |
| Links to | M1, M3-M7 | Other boards |

---

# M3: O3-O4 Toegang Board

## Doelstelling

Visualiseer workspace isolatie (afdelingsscheiding) en veilige klantsamenwerking met data-isolatie en invite flows.

## Scope

### Wat WEL
- Workspace hiërarchie
- Data isolatie model
- Klant workspace flow
- Invite user journey
- Access control matrix

### Wat NIET
- RBAC details (zie M4)
- Technical RLS implementation
- API endpoints

## Definition of Done

- [ ] Workspace hierarchy diagram
- [ ] Data isolation visualization
- [ ] Klant workspace creation flow
- [ ] Invite journey map
- [ ] Access boundaries diagram
- [ ] Archivering flow
- [ ] Decision log

## Frames

### Frame 1: Workspace Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│  WORKSPACE HIERARCHY                                        │
│                                                              │
│                    ┌───────────────┐                        │
│                    │   Platform    │                        │
│                    └───────┬───────┘                        │
│                            │                                │
│        ┌───────────────────┼───────────────────┐            │
│        ▼                   ▼                   ▼            │
│  ┌───────────┐      ┌───────────┐      ┌───────────┐       │
│  │Afdeling A │      │Afdeling B │      │Afdeling C │       │
│  │(workspace)│      │(workspace)│      │(workspace)│       │
│  └─────┬─────┘      └─────┬─────┘      └───────────┘       │
│        │                  │                                 │
│        ▼                  ▼                                 │
│  ┌───────────┐      ┌───────────┐                          │
│  │Klant X    │      │Klant Y    │                          │
│  │(workspace)│      │(workspace)│                          │
│  └───────────┘      └───────────┘                          │
│                                                              │
│  Type: afdeling = interne teams                             │
│  Type: klant = externe klant projecten                      │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: Data Isolation
```
┌─────────────────────────────────────────────────────────────┐
│  DATA ISOLATION MODEL                                       │
│                                                              │
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │ Workspace A     │          │ Workspace B     │          │
│  │ ┌─────────────┐ │          │ ┌─────────────┐ │          │
│  │ │ Project 1   │ │    🔒    │ │ Project 3   │ │          │
│  │ │ Project 2   │ │◀────────▶│ │ Project 4   │ │          │
│  │ │ Resources   │ │ ISOLATED │ │ Resources   │ │          │
│  │ └─────────────┘ │          │ └─────────────┘ │          │
│  └─────────────────┘          └─────────────────┘          │
│                                                              │
│  RLS Policy: workspace_members WHERE user_id = auth.uid()   │
│                                                              │
│  Cross-workspace access: NIET MOGELIJK                      │
│  Data sharing: Alleen via export/import                     │
└─────────────────────────────────────────────────────────────┘
```

### Frame 3-7: Additional Frames
- Klant workspace creation flow
- Invite flow (email → accept → access)
- Access boundaries per role
- Archiving workflow
- Decisions

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M3-board-id]/ |
| Export | `docs/miro/M3-toegang.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O3, O4 Key Results |
| References | D7 | Workspace module |
| Links to | M4 | Security board (RBAC) |

---

# M4: O5-O6 Security Board

## Doelstelling

Visualiseer RBAC model met de 5 rollen en hun permissions, plus het Vault workflow voor gecontroleerde dataverwerking.

## Scope

### Wat WEL
- RBAC matrix visualisatie
- Rol hiërarchie
- Permission inheritance
- Vault workflow (Input → Processing → Done)
- 30-dagen retentie flow
- Audit trail concept

### Wat NIET
- Technical RLS queries
- API middleware code
- UI component details

## Definition of Done

- [ ] RBAC matrix frame
- [ ] Role hierarchy diagram
- [ ] Permission flow per role
- [ ] Vault Kanban wireframe
- [ ] Vault workflow diagram
- [ ] Retention countdown visual
- [ ] Audit trail concept

## Frames

### Frame 1: RBAC Matrix
```
┌─────────────────────────────────────────────────────────────┐
│  RBAC PERMISSION MATRIX                                     │
│                                                              │
│  Permission         │Admin│Vault│Mdw│KlEdt│KlView│          │
│  ────────────────────────────────────────────────────       │
│  View workspace     │ ✓   │ ✓   │ ✓ │ own │ own  │          │
│  Edit workspace     │ ✓   │ -   │ - │  -  │  -   │          │
│  View project       │ ✓   │ ✓   │ ✓ │ own │ own  │          │
│  Edit project       │ ✓   │ -   │ ✓ │ own │  -   │          │
│  View tasks         │ ✓   │ ✓   │ ✓ │ own │ own  │          │
│  Edit tasks         │ ✓   │ -   │ ✓ │ own │  -   │          │
│  View Vault         │ ✓   │ ✓   │ - │  -  │  -   │          │
│  Process Vault      │ ✓   │ ✓   │ - │  -  │  -   │          │
│  Export data        │ ✓   │ ✓   │ ✓ │ own │  -   │          │
│  Manage users       │ ✓   │ -   │ - │  -  │  -   │          │
│                                                              │
│  ✓ = Full access  own = Own workspace only  - = No access  │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: Role Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│  ROLE HIERARCHY                                             │
│                                                              │
│                    ┌───────────────┐                        │
│                    │     Admin     │                        │
│                    │ (alle rechten)│                        │
│                    └───────┬───────┘                        │
│                            │                                │
│            ┌───────────────┼───────────────┐                │
│            ▼               │               ▼                │
│  ┌─────────────────┐       │     ┌─────────────────┐       │
│  │Vault Medewerker │       │     │   Medewerker    │       │
│  │ (Vault access)  │       │     │(Project access) │       │
│  └─────────────────┘       │     └─────────────────┘       │
│                            │                                │
│                            ▼                                │
│                  ┌─────────────────┐                       │
│                  │  Klant Editor   │                       │
│                  │ (eigen project) │                       │
│                  └────────┬────────┘                       │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                       │
│                  │  Klant Viewer   │                       │
│                  │  (read-only)    │                       │
│                  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Frame 3: Vault Workflow
```
┌─────────────────────────────────────────────────────────────┐
│  VAULT WORKFLOW                                             │
│                                                              │
│  ┌──────────┐    ┌────────────┐    ┌──────────┐            │
│  │  INPUT   │───▶│ PROCESSING │───▶│   DONE   │            │
│  │          │    │            │    │          │            │
│  │ Nieuwe   │    │ Validatie  │    │ Gereed   │            │
│  │ items    │    │ Verwerking │    │ 30 dagen │            │
│  │          │    │ Notities   │    │ countdown│            │
│  └──────────┘    └────────────┘    └──────────┘            │
│                                           │                 │
│                                           ▼                 │
│                                    ┌────────────┐          │
│                                    │  EXPORT /  │          │
│                                    │  DELETE    │          │
│                                    └────────────┘          │
│                                                              │
│  Trigger: Project "klaar" markeren → Auto naar Input        │
│  Retention: 30 dagen na Done → Auto-cleanup                 │
└─────────────────────────────────────────────────────────────┘
```

### Frame 4-7: Additional Frames
- Vault Kanban wireframe
- Retention countdown visualization
- Audit trail structure
- Security decisions

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M4-board-id]/ |
| Export | `docs/miro/M4-security.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O5, O6 Key Results |
| References | D8 | Auth/RBAC module |
| References | D9 | Vault module |
| Links to | P1 | ROLLEN.md |

---

# M5: O7 Export Board

## Doelstelling

Visualiseer de export mogelijkheden (PDF, Excel, CSV, Image) met configuratie opties en preview workflow.

## Scope

### Wat WEL
- Export format comparison
- Configuration options per format
- Export flow diagram
- Preview wireframe
- Export history concept

### Wat NIET
- Technical implementation
- Server-side generation details
- File storage architecture

## Definition of Done

- [ ] Format comparison matrix
- [ ] PDF export options wireframe
- [ ] Excel export options wireframe
- [ ] Image export options wireframe
- [ ] Export flow diagram
- [ ] Preview panel wireframe

## Frames

### Frame 1: Export Formats
```
┌─────────────────────────────────────────────────────────────┐
│  EXPORT FORMATS OVERVIEW                                    │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  PDF   │  │ Excel  │  │  CSV   │  │ Image  │            │
│  │        │  │        │  │        │  │        │            │
│  │ Gantt  │  │ Tasks  │  │ Simple │  │  PNG   │            │
│  │Calendar│  │Resource│  │  data  │  │  SVG   │            │
│  │ Print  │  │Analysis│  │ export │  │ Share  │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                              │
│  Use cases:                                                 │
│  - PDF: Rapportage, print, presentatie                      │
│  - Excel: Analyse, bulk edit, import andere tools           │
│  - CSV: Integratie, simpele data transfer                   │
│  - Image: Screenshots, documentatie, sharing                │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2-6: Format Options & Flow
(Configuration wireframes and export sequence)

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M5-board-id]/ |
| Export | `docs/miro/M5-export.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O7 Key Results |
| References | D10 | Export module |

---

# M6: O8 Visual Docs Board

## Doelstelling

Meta-board die de structuur van alle Miro boards documenteert, templates definieert en style guide vastlegt.

## Scope

### Wat WEL
- Board index met links
- Template structuur
- Style guide (kleuren, shapes)
- Naming conventions
- Update procedures

### Wat NIET
- Content van andere boards
- Technical documentation
- Code examples

## Definition of Done

- [ ] Board index frame
- [ ] Template frame
- [ ] Style guide frame
- [ ] Naming conventions frame
- [ ] Maintenance procedures frame

## Frames

### Frame 1: Board Index
```
┌─────────────────────────────────────────────────────────────┐
│  MIRO BOARD INDEX                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ M1 │ O1 Samenwerking   │ [Link] │ Status: Draft    │   │
│  │ M2 │ O2 Unified View   │ [Link] │ Status: Draft    │   │
│  │ M3 │ O3-O4 Toegang     │ [Link] │ Status: Draft    │   │
│  │ M4 │ O5-O6 Security    │ [Link] │ Status: Draft    │   │
│  │ M5 │ O7 Export         │ [Link] │ Status: Draft    │   │
│  │ M6 │ O8 Visual Docs    │ [Link] │ Status: Active   │   │
│  │ M7 │ O9 Rollen         │ [Link] │ Status: Draft    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Navigation: Start hier → Klik op board om te openen        │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: Style Guide
```
┌─────────────────────────────────────────────────────────────┐
│  STYLE GUIDE                                                │
│                                                              │
│  KLEUREN                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ Geel   │ │ Blauw  │ │ Groen  │ │ Rood   │ │ Grijs  │   │
│  │#FFEB3B │ │#2196F3 │ │#4CAF50 │ │#F44336 │ │#9E9E9E │   │
│  │Notities│ │Require-│ │Beslis- │ │Risico's│ │Frames  │   │
│  │        │ │ments   │ │singen  │ │        │ │        │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                              │
│  FONTS                                                      │
│  Headers: Bold, 24px                                        │
│  Body: Regular, 14px                                        │
│  Labels: Regular, 12px                                      │
│                                                              │
│  SPACING                                                    │
│  Frame padding: 40px                                        │
│  Element spacing: 20px                                      │
└─────────────────────────────────────────────────────────────┘
```

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M6-board-id]/ |
| Export | `docs/miro/M6-visual-docs.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Indexes | M1-M5, M7 | All other boards |
| Visualizes | OUTCOMES.md | O8 Key Results |

---

# M7: O9 Rollen Board

## Doelstelling

Visualiseer de organisatiestructuur, rol hiërarchie en procedure flows die in P1-P5 worden gedocumenteerd.

## Scope

### Wat WEL
- Organisatie structuur diagram
- Rol kaarten met verantwoordelijkheden
- Procedure flow diagrams
- Onboarding journey per rol
- Escalatie paden

### Wat NIET
- Gedetailleerde procedurele tekst (zie P2)
- Glossary definities (zie P3)
- Technische permissies (zie M4)

## Definition of Done

- [ ] Org chart frame
- [ ] Rol cards frame
- [ ] Key procedures flows
- [ ] Onboarding journey per rol
- [ ] Escalatie diagram
- [ ] RACI overview

## Frames

### Frame 1: Organisatie Structuur
```
┌─────────────────────────────────────────────────────────────┐
│  ORGANISATIE STRUCTUUR                                      │
│                                                              │
│                    ┌───────────────┐                        │
│                    │Platform Admin │                        │
│                    │(Technisch)    │                        │
│                    └───────┬───────┘                        │
│                            │                                │
│        ┌───────────────────┼───────────────────┐            │
│        ▼                   ▼                   ▼            │
│  ┌───────────┐      ┌───────────┐      ┌───────────┐       │
│  │ Afdeling  │      │   Vault   │      │  Klant    │       │
│  │  Admin    │      │Medewerker │      │  Contact  │       │
│  └─────┬─────┘      └───────────┘      └───────────┘       │
│        │                                                    │
│        ▼                                                    │
│  ┌───────────┐                                             │
│  │Medewerker │                                             │
│  └───────────┘                                             │
│                                                              │
│  Rapportage: Medewerker → Afdeling Admin → Platform Admin  │
└─────────────────────────────────────────────────────────────┘
```

### Frame 2: Rol Cards
```
┌─────────────────────────────────────────────────────────────┐
│  ROL KAARTEN                                                │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ ADMIN               │  │ VAULT MEDEWERKER    │          │
│  │ ─────────────────── │  │ ─────────────────── │          │
│  │ Verantwoordelijk:   │  │ Verantwoordelijk:   │          │
│  │ • Workspace beheer  │  │ • Vault verwerking  │          │
│  │ • User management   │  │ • Data validatie    │          │
│  │ • Instellingen      │  │ • Export controle   │          │
│  │ • Support escalatie │  │ • Audit trail       │          │
│  │                     │  │                     │          │
│  │ Reports to: -       │  │ Reports to: Admin   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ MEDEWERKER          │  │ KLANT EDITOR        │          │
│  │ ─────────────────── │  │ ─────────────────── │          │
│  │ Verantwoordelijk:   │  │ Verantwoordelijk:   │          │
│  │ • Project planning  │  │ • Eigen taken       │          │
│  │ • Taak beheer       │  │ • Status updates    │          │
│  │ • Resource planning │  │ • Feedback          │          │
│  │                     │  │                     │          │
│  │ Reports to: Admin   │  │ Reports to: Contact │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Frame 3-6: Procedure Flows & Journeys
(Onboarding flows, key procedures, escalation paths)

## Artefacts

| Type | Beschrijving |
|------|--------------|
| Miro Board | https://miro.com/app/board/[M7-board-id]/ |
| Export | `docs/miro/M7-rollen.pdf` |

## Gerelateerd

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O9 Key Results |
| References | P1 | ROLLEN.md details |
| References | P2 | PROCEDURES.md flows |
| Links to | M4 | Security RBAC |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 2024-12-29 | A3 | Initieel document met M1-M7 |

---

*Document versie: 1.0*
*Laatst bijgewerkt: 29 December 2024*
*Miro Boards: 7 | Frames: 43 | Taken: 72*
