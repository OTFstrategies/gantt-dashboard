# Gantt Dashboard

Een modern project management dashboard gebouwd met Next.js 16, React 18 en Supabase. Het dashboard biedt meerdere views voor projectplanning en -tracking: Gantt charts, kalenders, taskboards, grids en timelines.

## Features

- **Gantt View** - Visualiseer projecttaken met dependencies, milestones en kritieke paden
- **Calendar View** - Maandoverzicht met drag & drop voor task scheduling
- **TaskBoard** - Kanban-style board met kolommen voor To Do, In Progress en Done
- **Grid View** - TanStack Table implementatie met sorting en filtering
- **Timeline View** - Visualiseer project deliverables op een tijdlijn

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: SCSS modules

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS) policies

### UI Libraries
- **Gantt Charts**: frappe-gantt
- **Calendar**: react-big-calendar
- **Drag & Drop**: @hello-pangea/dnd
- **Data Tables**: @tanstack/react-table
- **Export**: file-saver, xlsx

## Vereisten

- Node.js >= 20.0.0
- npm of yarn
- Supabase account

## Installatie

1. Clone de repository:
```bash
git clone https://github.com/OTFstrategies/gantt-dashboard.git
cd gantt-dashboard
```

2. Installeer dependencies:
```bash
npm install
```

3. Configureer environment variabelen:
```bash
cp .env.example .env.local
```

Vul de volgende variabelen in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run database migraties in Supabase:
```sql
-- Zie supabase/migrations/ voor alle migraties
```

5. Start de development server:
```bash
npm run dev
```

De applicatie draait op [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build voor productie
npm start            # Start productie server
npm run lint         # Run ESLint
npm run test         # Run tests met Vitest
npm run test:run     # Run tests eenmalig
npm run test:coverage # Run tests met coverage
npm run typecheck    # TypeScript type checking
```

## Project Structure

```
gantt-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (CRUD endpoints)
│   ├── gantt/             # Gantt view page
│   ├── calendar/          # Calendar view page
│   ├── taskboard/         # TaskBoard view page
│   ├── grid/              # Grid view page
│   └── timeline/          # Timeline view page
├── src/
│   ├── components/        # React components
│   ├── providers/         # Context providers (ProjectProvider)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definities
│   └── index.ts          # Main exports
├── supabase/
│   └── migrations/        # Database migraties
├── public/               # Static assets
└── styles/               # Global styles
```

## Database Schema

Het project gebruikt Supabase met de volgende tabellen:

- `projects` - Project informatie
- `tasks` - Individuele taken met dependencies
- `deliverables` - Project deliverables
- `milestones` - Project milestones
- `resources` - Resource allocatie
- `time_tracking` - Time tracking entries

Alle tabellen hebben Row Level Security (RLS) policies voor veilige data access.

## Development

### Type System
Het project gebruikt een strict TypeScript configuratie. Alle types zijn gedefinieerd in `src/types/`:
- `entities.ts` - Core entiteiten (Project, Task, etc.)
- `project.ts` - Project-gerelateerde types
- `api.ts` - API request/response types
- `database.ts` - Database schema types

### State Management
State wordt beheerd via React Context met de `ProjectProvider`:
```tsx
import { ProjectProvider, useProject } from 'gantt-dashboard'

// In je app
<ProjectProvider>
  <YourComponent />
</ProjectProvider>

// In componenten
const { tasks, updateTask } = useProject()
```

### Testing
Tests worden geschreven met Vitest en React Testing Library:
```bash
npm run test         # Watch mode
npm run test:run     # Eenmalig
npm run test:coverage # Met coverage
```

## AI Agent Framework

Het project gebruikt een multi-agent systeem voor geautomatiseerde development workflows. Zie `agents/` directory voor meer informatie over de agent pipeline.

## Documentatie

Voor gedetailleerde projectdocumentatie, zie:

- `STATUS.md` - Volledige projectstatus en phase tracking
- `WBS-GANTT-REBUILD.md` - Work Breakdown Structure
- `CLAUDE.md` - Claude Code instructies en conventies

## Contributing

Contributions zijn welkom! Voor grote wijzigingen, open eerst een issue om te bespreken wat je wilt veranderen.

1. Fork het project
2. Creëer een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## License

Dit project is private en eigendom van OTFstrategies.

## Contact

Mick - OTFstrategies

Project Link: [https://github.com/OTFstrategies/gantt-dashboard](https://github.com/OTFstrategies/gantt-dashboard)
