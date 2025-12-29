# Gantt Dashboard - Multi-Workspace Project Management Platform

Een uitgebreid projectmanagement platform voor 4 afdelingen met uniforme ISO workflow.

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **UI Components**: Bryntum Suite 7.1.0 (Gantt, Calendar, TaskBoard, Grid)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel

## Documentatie

| Document | Beschrijving |
|----------|--------------|
| [OUTCOMES.md](OUTCOMES.md) | 9 Outcomes met Key Results |
| [DELIVERABLES.md](DELIVERABLES.md) | 29 Deliverables index |
| [SECTIONS.md](SECTIONS.md) | Sectie-indeling per deliverable |
| [TASKS.md](TASKS.md) | 458 Taken met acceptance criteria |
| [WBS-AGENTS.md](WBS-AGENTS.md) | 12 AI Agents met RACI matrix |
| [PROMPTS.md](PROMPTS.md) | Claude Code CLI prompts |

### Deliverable Modules

| Module | Inhoud |
|--------|--------|
| [DELIVERABLES-CODE.md](DELIVERABLES-CODE.md) | D1-D10: Code deliverables |
| [DELIVERABLES-INFRA.md](DELIVERABLES-INFRA.md) | D11-D14: Infrastructure |
| [DELIVERABLES-DOCS.md](DELIVERABLES-DOCS.md) | D15-D17: Documentatie |
| [DELIVERABLES-MIRO.md](DELIVERABLES-MIRO.md) | M1-M7: Miro boards |
| [DELIVERABLES-PROCESS.md](DELIVERABLES-PROCESS.md) | P1-P5: Process docs |

## AI Agent Framework

Het project gebruikt een multi-agent systeem met 12 gespecialiseerde agents:

| Agent | Rol |
|-------|-----|
| A0 Orchestrator | Project coördinatie |
| A1 Architect | System design |
| A2 Frontend | React/Next.js |
| A3 Bryntum | Gantt, Calendar, TaskBoard, Grid |
| A4 Backend | API/Supabase |
| A5 Database | PostgreSQL/RLS |
| A6 Auth | Supabase Auth |
| A7 DevOps | Vercel/CI/CD |
| A8 Documenter | Technische docs |
| A9 Visual | UI/UX design |
| A10 Process | Workflows |
| A11 QA | Testing |

### Claude Code CLI Gebruik

Open Claude Code en gebruik een prompt uit [PROMPTS.md](PROMPTS.md):

```bash
claude
```

Voorbeeld prompt:
```
Je bent de AI Orchestrator (A0) voor het Gantt Dashboard project.
Project locatie: C:\Users\Mick\Projects\gantt-dashboard
Lees OUTCOMES.md, DELIVERABLES.md en WBS-AGENTS.md voor context.
Geef me een project status overview.
```

## Sprint Structuur

| Sprint | Naam | Deliverables |
|--------|------|--------------|
| 1 | Foundation | D11, D12, D14, D1 |
| 2 | Core Views | D2, D3, D4 |
| 3 | Extended Views | D5, D8, D13 |
| 4 | Application | D6, D7, D9 |
| 5 | Features & Polish | D10, D15-D17, M1-M7, P1-P5 |

## Installatie

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000

## Bryntum Licentie

Dit project gebruikt Bryntum Suite 7.1.0. Zie [Bryntum npm repository guide](https://bryntum.com/products/gantt/docs/guide/Gantt/npm-repository) voor setup.

## Links

- [Next.js Docs](https://nextjs.org/docs)
- [Bryntum Gantt Docs](https://bryntum.com/products/gantt/docs/)
- [Supabase Docs](https://supabase.com/docs)
