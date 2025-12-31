# Gantt Dashboard - AI Agent Framework

Multi-agent orchestration system for automated project execution.

## Setup

```bash
cd agents
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Usage

### Interactive Mode
```bash
npm run orchestrator
# or
npm run dev
```

### Commands
```bash
# Show project status
npm run status

# Show sprint overview
npm run sprint

# Show specific sprint
npm run sprint 1
```

### CLI Options
```bash
# Start interactive session
npx tsx src/index.ts start

# Show status
npx tsx src/index.ts status

# Execute sprint
npx tsx src/index.ts sprint 1

# Delegate task
npx tsx src/index.ts delegate A3 "Build Gantt component"

# Ask question
npx tsx src/index.ts ask "What deliverables are ready?"
```

## Agent Team

| ID | Name | Role |
|----|------|------|
| A0 | Orchestrator | Project coordination |
| A1 | Architect | System design |
| A2 | Frontend Dev | React/Next.js |
| A3 | Bryntum Specialist | Gantt, Calendar, TaskBoard, Grid |
| A4 | Backend Dev | API/Supabase |
| A5 | Database Admin | PostgreSQL/RLS |
| A6 | Auth Specialist | Supabase Auth |
| A7 | DevOps | Vercel/CI/CD |
| A8 | Documenter | Technical docs |
| A9 | Visual Designer | UI/UX |
| A10 | Process Analyst | Workflows |
| A11 | QA Engineer | Testing |

## Sprints

1. **Foundation**: D11, D12, D14, D1
2. **Core Views**: D2, D3, D4
3. **Extended Views**: D5, D8, D13
4. **Application**: D6, D7, D9
5. **Features & Polish**: D10, D15-D17, M1-M7, P1-P5
