# Claude Code Prompts - Gantt Dashboard Project

Kopieer een prompt hieronder en plak in Claude Code CLI.

---

## 🚀 PROJECT START

### Eerste keer / Nieuw gesprek
```
Je bent de AI Orchestrator (A0) voor het Gantt Dashboard project.

Project locatie: C:\Users\Mick\Projects\gantt-dashboard

Lees eerst deze bestanden voor context:
- OUTCOMES.md (9 outcomes, key results)
- DELIVERABLES.md (29 deliverables index)
- WBS-AGENTS.md (12 agents, RACI matrix)
- TASKS.md (taken per deliverable)

Je coördineert een team van 12 virtuele agents (A1-A11).
Geef me een project status overview en vraag wat ik wil doen.
```

---

## 📊 STATUS & OVERZICHT

### Project Status
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Lees DELIVERABLES.md en TASKS.md.
Geef een status overzicht:
- Hoeveel deliverables pending/in_progress/completed
- Welke deliverables zijn ready to start (geen dependencies)
- Wat is de volgende logische stap
```

### Sprint Overzicht
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Lees WBS-AGENTS.md voor de sprint structuur.

Toon alle 5 sprints met:
- Deliverables per sprint
- Verantwoordelijke agents
- Dependencies tussen sprints
```

---

## 🏃 SPRINT EXECUTIE

### Start Sprint 1 (Foundation)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent orchestrator A0. Start Sprint 1: Foundation.

Deliverables: D11 (Database), D12 (Auth), D14 (Deploy), D1 (Foundation Module)
Agents: A5 (Database), A6 (Auth), A7 (DevOps), A3 (Bryntum), A1 (Architect)

Lees de relevante secties in DELIVERABLES.md en TASKS.md.
Maak een uitvoeringsplan en begin met D11 (Database Schema).
```

### Start Sprint 2 (Core Views)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent orchestrator A0. Start Sprint 2: Core Views.

Deliverables: D2 (Gantt), D3 (Calendar), D4 (TaskBoard)
Agents: A3 (Bryntum), A2 (Frontend), A6 (Auth)

Voorwaarde: Sprint 1 moet af zijn.
Lees DELIVERABLES-CODE.md voor details.
Begin met D2 (Gantt Module).
```

### Start Sprint 3 (Extended Views)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent orchestrator A0. Start Sprint 3: Extended Views.

Deliverables: D5 (Grid), D8 (Auth/RBAC), D13 (API Routes)
Agents: A3 (Bryntum), A6 (Auth), A4 (Backend), A1 (Architect)

Lees DELIVERABLES-CODE.md en DELIVERABLES-INFRA.md.
```

### Start Sprint 4 (Application)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent orchestrator A0. Start Sprint 4: Application.

Deliverables: D6 (Dashboard), D7 (Workspace), D9 (Vault)
Agents: A2 (Frontend), A4 (Backend), A3 (Bryntum)

Focus op gebruikerservaring en workspace management.
```

### Start Sprint 5 (Features & Polish)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent orchestrator A0. Start Sprint 5: Features & Polish.

Deliverables: D10 (Export), D15-D17 (Docs), M1-M7 (Miro), P1-P5 (Process)
Agents: A3, A8 (Docs), A9 (Visual), A10 (Process), A11 (QA)

Focus op documentatie, Miro boards, en kwaliteit.
```

---

## 🎯 SPECIFIEKE DELIVERABLES

### Werk aan specifieke Deliverable
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Werk aan deliverable [D1/D2/etc].

Lees de deliverable details in DELIVERABLES.md of DELIVERABLES-CODE.md.
Lees de taken in TASKS.md (zoek naar sectie voor deze deliverable).
Lees WBS-AGENTS.md voor de verantwoordelijke agent.

Maak een plan en voer de taken uit.
```

### Database Schema (D11)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent A5 Database Engineer. Werk aan D11: Database Schema.

Lees DELIVERABLES-INFRA.md sectie D11.
Lees TASKS.md voor T11.x.x taken.

Maak Supabase migrations voor:
- workspaces, projects, tasks, resources
- Row Level Security policies
- Audit logging
```

### Bryntum Gantt Module (D2)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent A3 Bryntum Specialist. Werk aan D2: Gantt Module.

Lees DELIVERABLES-CODE.md sectie D2.
Bekijk Bryntum voorbeelden in C:\Users\Mick\Downloads\bryntum-gantt-trial

Bouw de Gantt component met:
- ProjectModel integratie
- CrudManager voor data sync
- Nederlandse lokalisatie
```

### Auth & RBAC (D8)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent A6 Auth Specialist. Werk aan D8: Auth/RBAC Module.

Lees DELIVERABLES-CODE.md sectie D8.
Implementeer 5 rollen: Admin, Vault Medewerker, Medewerker, Klant Editor, Klant Viewer.
Gebruik Supabase Auth met RLS policies.
```

---

## 📝 DOCUMENTATIE

### Genereer ARCHITECTURE.md (D15)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent A8 Documenter. Maak D15: ARCHITECTURE.md.

Lees alle bestaande docs (OUTCOMES, DELIVERABLES, SECTIONS, TASKS).
Analyseer de codebase structuur.

Genereer technische architectuur documentatie:
- System overview diagram (mermaid)
- Component architectuur
- Data flow
- Security model
```

### Genereer API Docs (D17)
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Je bent A8 Documenter. Maak D17: API-DOCS.md.

Lees DELIVERABLES-INFRA.md sectie D13 (API Routes).
Documenteer alle endpoints met:
- Method, path, parameters
- Request/response voorbeelden
- Auth requirements
```

---

## 🔍 TROUBLESHOOTING

### Debug een probleem
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Er is een probleem met [beschrijf het probleem].

Onderzoek de relevante code en logs.
Identificeer de root cause.
Stel een fix voor en implementeer deze.
```

### Code Review
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Review de code in [pad naar bestand of folder].

Check op:
- TypeScript best practices
- Bryntum component patterns
- Security vulnerabilities
- Performance issues

Geef concrete verbeterpunten.
```

---

## 🔄 VERVOLG GESPREK

### Ga verder waar we gebleven waren
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Lees DELIVERABLES.md en check de status.
Lees recent gewijzigde bestanden (git status, git log).

Wat was de laatste actie? Ga verder met het volgende logische punt.
```

### Commit en rapporteer
```
Gantt Dashboard project in C:\Users\Mick\Projects\gantt-dashboard

Bekijk alle uncommitted changes (git status, git diff).
Maak een commit met duidelijke message.
Geef een samenvatting van wat er gedaan is.
```

---

## 💡 TIPS

1. **Wees specifiek**: Hoe specifieker je prompt, hoe beter het resultaat
2. **Verwijs naar docs**: De project docs bevatten alle context
3. **Noem de agent**: Zeg welke agent-rol je wilt (A3 voor Bryntum, A5 voor Database, etc.)
4. **Geef pad**: Altijd `C:\Users\Mick\Projects\gantt-dashboard` noemen
5. **Itereer**: Start breed, zoom in op specifieke taken
