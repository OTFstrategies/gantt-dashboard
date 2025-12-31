# Claude Code - Gantt Dashboard Project

## Project Overzicht

Dit is een Gantt Dashboard applicatie gebouwd met Next.js 16, React 18 en Supabase.
**BELANGRIJK**: Het project gebruikte Bryntum, maar deze is volledig verwijderd (Phase 0 complete).

## Huidige Status

Lees `STATUS.md` voor de volledige projectstatus.

**TL;DR:**
- Phase 0 (Cleanup): ✅ VOLTOOID - Bryntum verwijderd
- Phase 1 (Foundation): 🔄 KLAAR OM TE STARTEN
- Phases 2-8: ⏳ WACHTEND

## Tech Stack

```
Frontend: Next.js 16 | React 18 | TypeScript 5
Backend:  Supabase (PostgreSQL, Auth, RLS)
UI Libs:  frappe-gantt | react-big-calendar | @hello-pangea/dnd | TanStack Table
NO BRYNTUM ❌
```

## Agent Systeem

Er is een parallel agent pipeline in `agents/`:
- `agents/src/agents.ts` - 13 agents inclusief AG (Scope Guardian)
- `agents/src/pipeline.ts` - Parallelle executie met QA en Guardian checks
- `agents/src/orchestrator.ts` - Hoofd orchestrator met 9 sprints

Pipeline flow: Producer → A11 QA → AG Guardian → Output

## Belangrijke Bestanden

| Pad | Beschrijving |
|-----|--------------|
| `STATUS.md` | Volledige projectstatus |
| `WBS-GANTT-REBUILD.md` | Work Breakdown Structure |
| `src/types/` | TypeScript type definities |
| `src/providers/` | React providers (ProjectProvider) |
| `app/api/` | Next.js API routes |
| `agents/` | AI Agent systeem |

## Instructies

### Bij "Ga verder met het project"
1. Lees `STATUS.md` voor context
2. Check welke phase actief is
3. Ga door met de volgende taken

### Bij code wijzigingen
- GEEN Bryntum code toevoegen
- Volg de WBS-GANTT-REBUILD.md structuur
- AG Guardian valideert tegen scope

### Bij agent werk
```bash
cd agents && npx tsx src/orchestrator.ts
```

## Conventies

- Taal: Nederlands voor communicatie, Engels voor code/comments
- Git: Beschrijvende commit messages
- Types: Strict TypeScript, geen `any`
- Components: Functionele React components met hooks
