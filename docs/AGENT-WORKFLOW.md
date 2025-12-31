# Agent Workflow - Standaard Aanpak

> Laatst bijgewerkt: 31 december 2024
> Status: ACTIEF

Dit document beschrijft de standaard werkwijze voor het uitvoeren van taken met het AI Agent systeem.

---

## 1. Agent Overzicht

### Guardian (Altijd Actief)
| Agent | Naam | Rol | Model |
|-------|------|-----|-------|
| **AG** | Scope Guardian | Valideert ALLE output tegen WBS, heeft veto power | Haiku |

### Coordinator
| Agent | Naam | Rol | Model |
|-------|------|-----|-------|
| **A0** | Orchestrator | Coördineert agents, verdeelt werk, escaleert | Sonnet |

### Producers (Genereren Output)
| Agent | Naam | Rol | Model |
|-------|------|-----|-------|
| **A2** | Frontend Builder | React/Next.js components, layouts, pages | Sonnet |
| **A3** | UI Components | Gantt, Calendar, TaskBoard, Grid views | Sonnet |
| **A4** | Backend Builder | API routes, Supabase integration | Sonnet |
| **A5** | Database Engineer | PostgreSQL, migrations, RLS policies | Sonnet |

### Reviewers
| Agent | Naam | Rol | Model |
|-------|------|-----|-------|
| **A11** | QA Agent | Code review, testing, quality checks | Sonnet |

### Advisors (Support & Expertise)
| Agent | Naam | Rol | Model |
|-------|------|-----|-------|
| **A1** | Architect | Design decisions, architecture, API contracts | Opus |
| **A6** | Auth Specialist | Security, authentication, RBAC | Sonnet |
| **A7** | DevOps | Deployment, CI/CD, infrastructure | Sonnet |
| **A8** | Documenter | Technical documentation | Sonnet |
| **A9** | Visual Designer | Diagrams, wireframes | Haiku |
| **A10** | Process Writer | Procedures, workflows | Haiku |

---

## 2. Pipeline Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Producer   │ ──► │   A11 QA    │ ──► │ AG Guardian │ ──► Output
│  (A2-A5)    │     │  (Review)   │     │   (Scope)   │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │                   │
       └───────────────────┴───────────────────┘
                    (rejected work)
```

### Flow Beschrijving:
1. **Producer** (A2, A3, A4, A5) genereert code/output
2. **A11 (QA)** reviewt op kwaliteit en standaarden
3. **AG (Guardian)** valideert tegen WBS scope
4. Bij **APPROVED** → Output geaccepteerd
5. Bij **REJECTED** → Terug naar Producer met feedback

---

## 3. Stap Documentatie Formaat

Bij elke uitvoeringsstap wordt het volgende formaat gebruikt:

```
## Stap X: [Naam]

**Agent:** [ID] - [Naam]
**Type:** [SEQUENTIAL | PARALLEL]

### Input
- Wat nodig is om te starten

### Output
- Wat opgeleverd wordt

### Acceptatie Criteria
- [ ] Criterium 1
- [ ] Criterium 2

### Review
- A11: [QA checks]
- AG: [Scope validatie]
```

---

## 4. Execution Types

### SEQUENTIAL
Stappen die na elkaar moeten worden uitgevoerd:

```
[SEQUENTIAL]
1. A5: Create database table (moet eerst klaar zijn)
2. A4: Build API endpoint (afhankelijk van tabel)
3. A2: Build UI component (afhankelijk van API)
[/SEQUENTIAL]
```

### PARALLEL
Stappen die tegelijkertijd kunnen worden uitgevoerd:

```
[PARALLEL]
- A2: Build component X
- A4: Create API endpoint Y
- A3: Build view component Z
[/PARALLEL]
```

---

## 5. Review Checklists

### A11 (QA) Checklist

**Code Quality:**
- [ ] TypeScript strict mode (geen `any`)
- [ ] Error handling aanwezig
- [ ] Loading states geïmplementeerd
- [ ] Geen Bryntum referenties
- [ ] Volgt project patterns

**Functioneel:**
- [ ] Werkt met ProjectProvider
- [ ] Responsive design
- [ ] Keyboard navigatie
- [ ] Accessibility basics (ARIA)

**Performance:**
- [ ] Kan verwacht aantal items renderen
- [ ] Geen memory leaks
- [ ] Optimistic updates waar nodig

### AG (Guardian) Checklist

**Scope Validatie:**
- [ ] Past binnen huidige Phase
- [ ] Komt voor in WBS-GANTT-REBUILD.md
- [ ] Geen scope creep
- [ ] Geen gold-plating
- [ ] Volgt tech stack (geen banned libs)

**Phase Boundaries:**
- Phase 1: Foundation (Types, Data, API, DB)
- Phase 2: Gantt View (Timeline, Bars, Dependencies)
- Phase 3: Calendar View (Day/Week/Month)
- Phase 4: TaskBoard (Kanban, Drag/Drop)
- Phase 5: Grid View (Table, Resources)
- Phase 6: Export (PDF, Excel)
- Phase 7: Scheduling Engine
- Phase 8: Integration & Testing

---

## 6. Response Formaten

### A0 (Orchestrator) - Delegatie
```
DELEGATION: [Sprint/Phase naam]

[SEQUENTIAL]
1. [Agent]: [Taak]
2. [Agent]: [Taak]

[PARALLEL]
- [Agent]: [Taak]
- [Agent]: [Taak]

[REVIEW]
- A11: QA review
- AG: Scope check
```

### A11 (QA) - Review
```
QA REVIEW: [AGENT_ID] - [FILE/COMPONENT]

STATUS: ✅ PASS | ❌ FAIL | ⚠️ NEEDS WORK

ISSUES:
- [Issue 1]
- [Issue 2]

SUGGESTIONS:
- [Improvement 1]
```

### AG (Guardian) - Scope Check
```
SCOPE CHECK: [AGENT_ID] - [TASK_SUMMARY]

STATUS: ✅ APPROVED | ❌ REJECTED | ⚠️ WARNING

REASONING:
- [Waarom wel/niet binnen scope]
- [WBS referentie]

ACTION:
- [Volgende stap]
```

---

## 7. Voorbeeld: Phase 2 Uitvoering

### Sprint: Gantt View

| Stap | Agent | Actie | Type | Review |
|------|-------|-------|------|--------|
| 1 | A1 | Library keuze (frappe-gantt) | SEQUENTIAL | AG |
| 2 | A3 + A2 | Basis component + routing | PARALLEL | A11 → AG |
| 3 | A3 | ProjectProvider integratie | SEQUENTIAL | A11 → AG |
| 4 | A3 | Drag & drop | SEQUENTIAL | A11 → AG |
| 5 | A3 | Dependency lines | SEQUENTIAL | A11 → AG |
| 6 | A8 | Documentatie update | PARALLEL | AG |

### Stap 1: Library Keuze

**Agent:** A1 - Architect
**Type:** SEQUENTIAL (moet eerst)

**Input:**
- Requirements voor Gantt visualisatie
- Performance eisen (1000+ taken)
- Open-source vereiste

**Output:**
- Beslissing: frappe-gantt vs alternatieven
- Trade-off analyse
- Implementatie advies

**Review:**
- AG: Past binnen tech stack? Geen banned libs?

---

## 8. Communicatie Protocol

### Bij Start van Elke Stap
```
[Agent] Stap X: [Naam]
> Start: [Korte beschrijving wat gedaan wordt]
```

### Bij Voltooiing
```
[Agent] Stap X: [Naam]
> Voltooid: [Wat opgeleverd is]
> Review door: A11 → AG
```

### Bij Problemen
```
[Agent] Stap X: [Naam]
> ⚠️ Blocker: [Beschrijving probleem]
> Escalatie naar: A0 (Orchestrator)
```

---

## 9. Snelle Referentie

### Agent Keuze per Taaktype

| Taaktype | Primary Agent | Supporting |
|----------|---------------|------------|
| React component | A2 | A3 |
| Gantt/Calendar/TaskBoard/Grid | A3 | A2 |
| API endpoint | A4 | A5 |
| Database schema | A5 | A4 |
| Security/Auth | A6 | A4, A5 |
| Deployment | A7 | A4 |
| Documentatie | A8 | - |
| Diagrammen | A9 | A8 |
| Procedures | A10 | A8 |
| Architecture beslissing | A1 | A0 |

### Escalatie Pad
```
Producer → A11 (QA) → AG (Scope) → A0 (Orchestrator) → User
```

---

*Dit document is de standaard voor alle project uitvoering. Alle agents volgen deze workflow.*
