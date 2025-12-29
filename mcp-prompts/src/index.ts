#!/usr/bin/env node
/**
 * Gantt Dashboard MCP Server
 *
 * Provides project prompts and context for Claude Code CLI
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// =============================================================================
// PROMPT DEFINITIONS
// =============================================================================

interface PromptDef {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  template: string;
}

const PROMPTS: Record<string, PromptDef> = {
  'start': {
    name: 'start',
    description: 'Start een nieuw gesprek met volledige project context',
    template: `Je bent de AI Orchestrator (A0) voor het Gantt Dashboard project.

Project locatie: ${PROJECT_ROOT}

Lees eerst deze bestanden voor context:
- OUTCOMES.md (9 outcomes, key results)
- DELIVERABLES.md (29 deliverables index)
- WBS-AGENTS.md (12 agents, RACI matrix)
- TASKS.md (taken per deliverable)

Je coördineert een team van 12 virtuele agents (A1-A11).
Geef me een project status overview en vraag wat ik wil doen.`
  },

  'status': {
    name: 'status',
    description: 'Toon project status overzicht',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Lees DELIVERABLES.md en TASKS.md.
Geef een status overzicht:
- Hoeveel deliverables pending/in_progress/completed
- Welke deliverables zijn ready to start (geen dependencies)
- Wat is de volgende logische stap`
  },

  'sprint': {
    name: 'sprint',
    description: 'Start of bekijk een specifieke sprint',
    arguments: [
      { name: 'number', description: 'Sprint nummer (1-5)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Je bent orchestrator A0. Start Sprint {number}.

Sprint overzicht:
- Sprint 1 (Foundation): D11, D12, D14, D1 - Agents: A5, A6, A7, A3, A1
- Sprint 2 (Core Views): D2, D3, D4 - Agents: A3, A2, A6
- Sprint 3 (Extended Views): D5, D8, D13 - Agents: A3, A6, A4, A1
- Sprint 4 (Application): D6, D7, D9 - Agents: A2, A4, A3
- Sprint 5 (Features & Polish): D10, D15-D17, M1-M7, P1-P5 - Agents: A3, A8, A9, A10, A11

Lees WBS-AGENTS.md voor agent details.
Lees de relevante deliverables in DELIVERABLES.md.
Maak een uitvoeringsplan en begin.`
  },

  'deliverable': {
    name: 'deliverable',
    description: 'Werk aan een specifieke deliverable',
    arguments: [
      { name: 'id', description: 'Deliverable ID (bijv. D1, D2, M1)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Werk aan deliverable {id}.

Lees de deliverable details in DELIVERABLES.md of de juiste module:
- D1-D10: DELIVERABLES-CODE.md
- D11-D14: DELIVERABLES-INFRA.md
- D15-D17: DELIVERABLES-DOCS.md
- M1-M7: DELIVERABLES-MIRO.md
- P1-P5: DELIVERABLES-PROCESS.md

Lees de taken in TASKS.md voor deze deliverable.
Lees WBS-AGENTS.md voor de verantwoordelijke agent.

Maak een plan en voer de taken uit.`
  },

  'agent': {
    name: 'agent',
    description: 'Neem de rol aan van een specifieke agent',
    arguments: [
      { name: 'id', description: 'Agent ID (A1-A11)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Je bent agent {id}. Lees WBS-AGENTS.md voor je rol en verantwoordelijkheden.

Agent overzicht:
- A1: Architect (System design)
- A2: Frontend Builder (React/Next.js)
- A3: Bryntum Specialist (Gantt, Calendar, TaskBoard, Grid)
- A4: Backend Builder (API/Supabase)
- A5: Database Engineer (PostgreSQL/RLS)
- A6: Auth Specialist (Supabase Auth)
- A7: DevOps Agent (Vercel/CI/CD)
- A8: Documenter (Technical docs)
- A9: Visual Designer (UI/UX)
- A10: Process Writer (Workflows)
- A11: QA Agent (Testing)

Wat is je opdracht?`
  },

  'continue': {
    name: 'continue',
    description: 'Ga verder waar we gebleven waren',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Lees DELIVERABLES.md en check de status.
Bekijk recent gewijzigde bestanden (git status, git log -5).

Wat was de laatste actie? Ga verder met het volgende logische punt.`
  },

  'commit': {
    name: 'commit',
    description: 'Commit wijzigingen en rapporteer',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Bekijk alle uncommitted changes (git status, git diff).
Maak een commit met duidelijke message.
Geef een samenvatting van wat er gedaan is.`
  },

  'review': {
    name: 'review',
    description: 'Review code of deliverable',
    arguments: [
      { name: 'target', description: 'Bestand pad of deliverable ID', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Review: {target}

Check op:
- TypeScript best practices
- Bryntum component patterns
- Security vulnerabilities
- Performance issues

Geef concrete verbeterpunten.`
  },

  'debug': {
    name: 'debug',
    description: 'Debug een probleem',
    arguments: [
      { name: 'issue', description: 'Beschrijving van het probleem', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Er is een probleem: {issue}

Onderzoek de relevante code en logs.
Identificeer de root cause.
Stel een fix voor en implementeer deze.`
  }
};

// =============================================================================
// MCP SERVER
// =============================================================================

const server = new Server(
  {
    name: 'gantt-dashboard-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'read_project_file',
        description: 'Lees een project bestand (OUTCOMES.md, DELIVERABLES.md, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Bestandsnaam (bijv. OUTCOMES.md, DELIVERABLES.md)',
            },
          },
          required: ['filename'],
        },
      },
      {
        name: 'get_project_status',
        description: 'Krijg een samenvatting van de project status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_deliverables',
        description: 'Lijst alle deliverables met status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'read_project_file': {
      const filename = (args as { filename: string }).filename;
      const filepath = join(PROJECT_ROOT, filename);
      try {
        const content = readFileSync(filepath, 'utf-8');
        return { content: [{ type: 'text', text: content }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error reading ${filename}: ${error}` }] };
      }
    }

    case 'get_project_status': {
      try {
        const deliverables = readFileSync(join(PROJECT_ROOT, 'DELIVERABLES.md'), 'utf-8');
        const pending = (deliverables.match(/\|\s*Pending\s*\|/gi) || []).length;
        const inProgress = (deliverables.match(/\|\s*In Progress\s*\|/gi) || []).length;
        const completed = (deliverables.match(/\|\s*Completed\s*\|/gi) || []).length;

        return {
          content: [{
            type: 'text',
            text: `Project Status:
- Pending: ${pending}
- In Progress: ${inProgress}
- Completed: ${completed}
- Total: ${pending + inProgress + completed}

Project Root: ${PROJECT_ROOT}`
          }]
        };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error}` }] };
      }
    }

    case 'list_deliverables': {
      try {
        const content = readFileSync(join(PROJECT_ROOT, 'DELIVERABLES.md'), 'utf-8');
        // Extract table rows
        const tableMatch = content.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
        return { content: [{ type: 'text', text: tableMatch.join('\n') }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error}` }] };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS).map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  };
});

// Get specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const prompt = PROMPTS[name];

  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  let text = prompt.template;

  // Replace arguments in template
  if (args) {
    for (const [key, value] of Object.entries(args)) {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
  }

  return {
    messages: [
      {
        role: 'user',
        content: { type: 'text', text },
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gantt Dashboard MCP Server running');
}

main().catch(console.error);
