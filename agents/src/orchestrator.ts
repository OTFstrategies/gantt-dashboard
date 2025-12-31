/**
 * Gantt Dashboard Project - AI Agent Orchestrator
 *
 * UPDATED: Parallel pipeline with Scope Guardian
 *
 * Flow:
 * 1. User request -> A0 Orchestrator
 * 2. A0 delegates to Producer agents (parallel)
 * 3. Producers output -> A11 QA (automatic)
 * 4. QA passed -> AG Guardian (automatic)
 * 5. Guardian approved -> Output delivered
 */

import Anthropic from '@anthropic-ai/sdk';
import { ALL_AGENTS, AgentDefinition, getAgentById, AG_GUARDIAN } from './agents.js';
import { ParallelPipeline, PipelineTask, createTask, parallelTasks, sequentialTasks } from './pipeline.js';
import { loadProjectContext, ProjectContext } from './context.js';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface OrchestratorConfig {
  model: string;
  maxTurns: number;
  verbose: boolean;
  enablePipeline: boolean;
}

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

// =============================================================================
// SPRINT DEFINITIONS (Updated for new WBS)
// =============================================================================

export interface SprintConfig {
  id: string;
  name: string;
  phase: number;
  deliverables: string[];
  agents: string[];
  dependencies?: string[]; // Sprint IDs that must complete first
}

/**
 * Sprint Definitions aligned with WBS-GANTT-REBUILD.md
 *
 * WBS Phases:
 * 0. Cleanup - Remove Bryntum
 * 1. Foundation - Types, Data Layer, API, Database
 * 2. Gantt View - Timeline, Task Bars, Dependencies
 * 3. Calendar View - Day/Week/Month views
 * 4. TaskBoard View - Kanban
 * 5. Grid View - Data Table
 * 6. Export - CSV, Excel, PDF
 * 7. Scheduling Engine - Manual/Auto scheduling
 * 8. Integration & Testing
 *
 * Priority Order (from WBS):
 * 1. Cleanup (0) - First
 * 2. Foundation (1) - Basis
 * 3. TaskBoard (4) - MVP, fastest value
 * 4. Grid (5) - MVP, resource management
 * 5. Gantt (2) - Core feature
 * 6. Calendar (3) - Nice to have
 * 7. Export (6) - After core
 * 8. Scheduling (7) - Most complex, last
 * 9. Integration (8) - Final
 */
export const SPRINTS: SprintConfig[] = [
  {
    id: 'sprint-0',
    name: 'Cleanup',
    phase: 0,
    deliverables: [
      'Bryntum code removal',
      'LicenseProvider deletion',
      'BryntumProvider → ProjectProvider',
      'Documentation cleanup'
    ],
    agents: ['A2', 'A11', 'AG'],
    dependencies: []
  },
  {
    id: 'sprint-1',
    name: 'Foundation',
    phase: 1,
    deliverables: [
      'Type System (project, task, dependency, resource)',
      'Data Layer (ProjectProvider, hooks)',
      'API Routes (CRUD, sync)',
      'Database (tables, RLS, triggers)'
    ],
    agents: ['A1', 'A4', 'A5', 'A6', 'A11', 'AG'],
    dependencies: ['sprint-0']
  },
  {
    id: 'sprint-2',
    name: 'Gantt View',
    phase: 2,
    deliverables: [
      'Timeline header (day/week/month)',
      'Task bars with positioning',
      'Dependency arrows (SVG)',
      'Drag/Drop & resize',
      'Zoom levels',
      'Critical path (optional)'
    ],
    agents: ['A3', 'A2', 'A7', 'A11', 'AG'],
    dependencies: ['sprint-1']
  },
  {
    id: 'sprint-3',
    name: 'Calendar View',
    phase: 3,
    deliverables: [
      'Month/Week/Day views',
      'Event rendering & positioning',
      'Navigation (prev/next/today)',
      'Drag/Drop events',
      'Recurring events (rrule.js)'
    ],
    agents: ['A3', 'A2', 'A11', 'AG'],
    dependencies: ['sprint-1']
  },
  {
    id: 'sprint-4',
    name: 'TaskBoard View',
    phase: 4,
    deliverables: [
      'Kanban column layout',
      'Task cards',
      'Drag/Drop between columns',
      'Swimlanes',
      'WIP limits'
    ],
    agents: ['A3', 'A2', 'A11', 'AG'],
    dependencies: ['sprint-1']
  },
  {
    id: 'sprint-5',
    name: 'Grid View',
    phase: 5,
    deliverables: [
      'TanStack Table integration',
      'Column sorting & filtering',
      'Virtual scrolling',
      'Cell editing',
      'Row selection & grouping'
    ],
    agents: ['A3', 'A2', 'A11', 'AG'],
    dependencies: ['sprint-1']
  },
  {
    id: 'sprint-6',
    name: 'Export',
    phase: 6,
    deliverables: [
      'Export dialog UI',
      'CSV export',
      'Excel export (SheetJS)',
      'PDF export (jsPDF)',
      'PNG export (html2canvas)'
    ],
    agents: ['A2', 'A4', 'A11', 'AG'],
    dependencies: ['sprint-2', 'sprint-3', 'sprint-4', 'sprint-5']
  },
  {
    id: 'sprint-7',
    name: 'Scheduling Engine',
    phase: 7,
    deliverables: [
      'Manual scheduling',
      'Date validation',
      'Dependency propagation',
      'Auto-scheduling (optional)',
      'Resource leveling (optional)'
    ],
    agents: ['A1', 'A2', 'A7', 'A11', 'AG'],
    dependencies: ['sprint-2']
  },
  {
    id: 'sprint-8',
    name: 'Integration & Testing',
    phase: 8,
    deliverables: [
      'ViewSwitcher integration',
      'ProjectProvider → all views',
      'Unit tests (hooks, utils)',
      'Component tests',
      'E2E tests (critical flows)',
      'Documentation'
    ],
    agents: ['A11', 'A8', 'AG'],
    dependencies: ['sprint-6', 'sprint-7']
  }
];

// =============================================================================
// ORCHESTRATOR CLASS
// =============================================================================

export class GanttDashboardOrchestrator {
  private client: Anthropic;
  private config: OrchestratorConfig;
  private context: ProjectContext | null = null;
  private conversationHistory: AgentMessage[] = [];
  private pipeline: ParallelPipeline;
  private currentSprint: string | null = null;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.client = new Anthropic();
    this.config = {
      model: config.model || 'claude-sonnet-4-20250514',
      maxTurns: config.maxTurns || 50,
      verbose: config.verbose ?? true,
      enablePipeline: config.enablePipeline ?? true
    };
    this.pipeline = new ParallelPipeline({
      verbose: this.config.verbose,
      enableQA: true,
      enableGuardian: true,
    });
  }

  /**
   * Initialize orchestrator with project context
   */
  async initialize(): Promise<void> {
    this.log('info', 'Loading project context...');
    this.context = await loadProjectContext();

    // Load WBS for Guardian context (file is in project root)
    const wbsPaths = [
      path.join(process.cwd(), 'WBS-GANTT-REBUILD.md'),
      path.join(process.cwd(), '..', 'WBS-GANTT-REBUILD.md'),
    ];

    let wbsContent = '';
    for (const wbsPath of wbsPaths) {
      if (fs.existsSync(wbsPath)) {
        wbsContent = fs.readFileSync(wbsPath, 'utf-8');
        this.log('info', `Loaded WBS from ${wbsPath}`);
        break;
      }
    }

    if (wbsContent) {
      this.pipeline.setContext(`WBS:\n${wbsContent}\n\nProject State:\n${this.context?.summary || ''}`);
    } else {
      this.log('warning', 'WBS file not found, using project context only');
      this.pipeline.setContext(this.context?.summary || '');
    }

    this.log('success', 'Project context loaded');
    this.log('info', `Phase 0 (Cleanup): ✅ COMPLETE`);
    this.log('info', `Phase 1 (Foundation): 🔄 READY`);
  }

  /**
   * Get system prompt for orchestrator
   */
  private getSystemPrompt(): string {
    return `You are the AI Orchestrator (A0) for the Gantt Dashboard project.

PROJECT STATE:
- Phase 0 (Cleanup): ✅ COMPLETE - Bryntum removed
- Phase 1 (Foundation): 🔄 IN PROGRESS
- Phases 2-7: ⏳ PENDING

TECH STACK (NO Bryntum):
- Next.js 16, React 18, TypeScript
- Supabase (PostgreSQL, Auth, RLS)
- Open-source: frappe-gantt, react-big-calendar, @hello-pangea/dnd, TanStack Table

YOUR TEAM:
${Object.entries(ALL_AGENTS).map(([key, agent]) =>
  `- ${agent.id} ${agent.name} (${agent.type}): ${agent.role}`
).join('\n')}

PIPELINE FLOW:
1. You delegate to Producer agents (A2, A3, A4, A5)
2. Producers run IN PARALLEL when possible
3. A11 QA automatically reviews producer output
4. AG Guardian validates EVERYTHING against scope
5. Rejected work comes back to you for resolution

DELEGATION FORMAT:
[PARALLEL]
- A3: Build GanttView component
- A4: Create /api/tasks endpoint
[/PARALLEL]

[SEQUENTIAL]
- A5: Create tasks table migration
- A4: Build API after migration
[/SEQUENTIAL]

SPRINT STRUCTURE:
${SPRINTS.map(s => `- ${s.name} (Phase ${s.phase}): ${s.deliverables.join(', ')}`).join('\n')}

IMPORTANT:
- AG Guardian has VETO power
- No Bryntum code allowed
- Follow WBS-GANTT-REBUILD.md strictly`;
  }

  /**
   * Process user message
   */
  async processMessage(userMessage: string): Promise<string> {
    if (!this.context) {
      await this.initialize();
    }

    // Handle direct commands
    const command = this.parseCommand(userMessage);
    if (command) {
      return await this.handleCommand(command);
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    this.log('thinking', 'Analyzing request...');

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 4096,
        system: this.getSystemPrompt(),
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Execute pipeline tasks if delegations found
      if (this.config.enablePipeline) {
        const tasks = this.parseDelegations(assistantMessage);
        if (tasks.length > 0) {
          this.log('pipeline', `Executing ${tasks.length} tasks through pipeline...`);
          const results = await this.pipeline.executeTasks(tasks);

          // Add results to conversation
          const resultsMessage = this.formatPipelineResults(results);
          this.conversationHistory.push({
            role: 'user',
            content: `PIPELINE RESULTS:\n${resultsMessage}`
          });

          return `${assistantMessage}\n\n---\n\n${resultsMessage}`;
        }
      }

      return assistantMessage;

    } catch (error) {
      this.log('error', `API error: ${error}`);
      throw error;
    }
  }

  /**
   * Parse command from user input
   */
  private parseCommand(input: string): { cmd: string; args: string[] } | null {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'status') return { cmd: 'status', args: [] };
    if (trimmed === 'agents') return { cmd: 'agents', args: [] };
    if (trimmed === 'sprints') return { cmd: 'sprints', args: [] };
    if (trimmed === 'help') return { cmd: 'help', args: [] };

    const sprintMatch = trimmed.match(/^sprint\s+(\d+)$/);
    if (sprintMatch) return { cmd: 'sprint', args: [sprintMatch[1]] };

    return null;
  }

  /**
   * Handle direct commands
   */
  private async handleCommand(command: { cmd: string; args: string[] }): Promise<string> {
    switch (command.cmd) {
      case 'status':
        return this.getStatusReport();

      case 'agents':
        return this.getAgentList();

      case 'sprints':
        return this.getSprintList();

      case 'sprint':
        return await this.startSprint(parseInt(command.args[0]));

      case 'help':
        return this.getHelp();

      default:
        return 'Unknown command';
    }
  }

  /**
   * Get project status report
   */
  private getStatusReport(): string {
    return `
╔════════════════════════════════════════════════════════════════╗
║           GANTT DASHBOARD - PROJECT STATUS                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Phase 0: Cleanup            ✅ COMPLETE                       ║
║  Phase 1: Foundation         🔄 READY TO START                 ║
║  Phase 2: Gantt View         ⏳ PENDING                        ║
║  Phase 3: Calendar View      ⏳ PENDING                        ║
║  Phase 4: TaskBoard View     ⏳ PENDING (MVP Priority)         ║
║  Phase 5: Grid View          ⏳ PENDING (MVP Priority)         ║
║  Phase 6: Export             ⏳ PENDING                        ║
║  Phase 7: Scheduling Engine  ⏳ PENDING                        ║
║  Phase 8: Integration/Test   ⏳ PENDING                        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Tech Stack: Next.js 16 | React 18 | Supabase                  ║
║  UI Libs: frappe-gantt | react-big-calendar | TanStack         ║
║  DnD: @hello-pangea/dnd | NO BRYNTUM ❌                        ║
╚════════════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Get agent list
   */
  private getAgentList(): string {
    let output = '\n=== AGENT TEAM ===\n\n';

    const byType: Record<string, AgentDefinition[]> = {};
    Object.values(ALL_AGENTS).forEach(agent => {
      if (!byType[agent.type]) byType[agent.type] = [];
      byType[agent.type].push(agent);
    });

    const typeOrder = ['guardian', 'coordinator', 'producer', 'reviewer', 'advisor'];

    for (const type of typeOrder) {
      if (byType[type]) {
        output += `${type.toUpperCase()}S:\n`;
        for (const agent of byType[type]) {
          output += `  ${agent.id} ${agent.name} - ${agent.role}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }

  /**
   * Get sprint list
   */
  private getSprintList(): string {
    let output = '\n=== SPRINTS ===\n\n';

    for (const sprint of SPRINTS) {
      const status = sprint.id === 'sprint-0' ? '✅' : sprint.id === 'sprint-1' ? '🔄' : '⏳';
      output += `${status} ${sprint.name} (Phase ${sprint.phase})\n`;
      output += `   Deliverables: ${sprint.deliverables.join(', ')}\n`;
      output += `   Agents: ${sprint.agents.join(', ')}\n`;
      output += '\n';
    }

    return output;
  }

  /**
   * Start a sprint
   */
  private async startSprint(sprintNumber: number): Promise<string> {
    const sprint = SPRINTS.find(s => s.phase === sprintNumber);
    if (!sprint) {
      return `Sprint ${sprintNumber} not found. Valid: 0-8`;
    }

    this.currentSprint = sprint.id;
    this.log('sprint', `Starting ${sprint.name} (Phase ${sprintNumber})`);

    // Create tasks for this sprint
    const tasks: PipelineTask[] = [];

    // Example: For Phase 1 (Foundation), create parallel tasks
    if (sprintNumber === 1) {
      tasks.push(
        createTask('A1', 'Review and finalize type system in src/types/', { id: 'types' }),
        createTask('A5', 'Verify database schema and migrations', { id: 'db', dependencies: ['types'] }),
        createTask('A4', 'Fix API route errors in app/api/', { id: 'api', dependencies: ['db'] }),
        createTask('A6', 'Review auth and RLS policies', { id: 'auth', dependencies: ['db'] }),
      );
    }

    if (tasks.length > 0) {
      const results = await this.pipeline.executeTasks(tasks);
      return `Started ${sprint.name}\n\n${this.formatPipelineResults(results)}`;
    }

    return `Started ${sprint.name}. Use natural language to assign specific tasks.`;
  }

  /**
   * Get help text
   */
  private getHelp(): string {
    return `
=== ORCHESTRATOR COMMANDS ===

status    - Show project status
agents    - List all agents
sprints   - List all sprints
sprint N  - Start sprint N (0-8)
help      - Show this help

=== NATURAL LANGUAGE ===

You can also give instructions in natural language:
- "Build the GanttView component using frappe-gantt"
- "Fix the API errors in app/api/projects"
- "Create the database migration for tasks"

The orchestrator will delegate to the right agents,
A11 will review the code, and AG will validate scope.

=== PIPELINE FLOW ===

Producer → A11 QA → AG Guardian → Output
(Rejected work returns to Orchestrator)
`;
  }

  /**
   * Parse delegation commands from orchestrator response
   */
  private parseDelegations(response: string): PipelineTask[] {
    const tasks: PipelineTask[] = [];

    // Parse [PARALLEL] blocks
    const parallelMatches = response.matchAll(/\[PARALLEL\]([\s\S]*?)\[\/PARALLEL\]/g);
    for (const match of parallelMatches) {
      const lines = match[1].split('\n').filter(l => l.trim());
      for (const line of lines) {
        const taskMatch = line.match(/-\s*(A\d+|AG):\s*(.+)/);
        if (taskMatch) {
          tasks.push(createTask(taskMatch[1], taskMatch[2].trim(), {
            id: `parallel-${tasks.length}`
          }));
        }
      }
    }

    // Parse [SEQUENTIAL] blocks
    const sequentialMatches = response.matchAll(/\[SEQUENTIAL\]([\s\S]*?)\[\/SEQUENTIAL\]/g);
    for (const match of sequentialMatches) {
      const lines = match[1].split('\n').filter(l => l.trim());
      let prevId: string | undefined;
      for (const line of lines) {
        const taskMatch = line.match(/-\s*(A\d+|AG):\s*(.+)/);
        if (taskMatch) {
          const id = `seq-${tasks.length}`;
          tasks.push(createTask(taskMatch[1], taskMatch[2].trim(), {
            id,
            dependencies: prevId ? [prevId] : undefined
          }));
          prevId = id;
        }
      }
    }

    // Parse standalone [DELEGATE X] commands
    const delegateMatches = response.matchAll(/\[DELEGATE\s+(A\d+|AG)\]\s*(.+?)(?=\[DELEGATE|\[PARALLEL|\[SEQUENTIAL|\n\n|$)/gs);
    for (const match of delegateMatches) {
      tasks.push(createTask(match[1], match[2].trim(), {
        id: `delegate-${tasks.length}`
      }));
    }

    return tasks;
  }

  /**
   * Format pipeline results for display
   */
  private formatPipelineResults(results: import('./pipeline.js').PipelineResult[]): string {
    let output = '=== PIPELINE RESULTS ===\n\n';

    for (const result of results) {
      const statusIcon = result.status === 'success' ? '✅' :
                         result.status === 'rejected' ? '❌' : '⚠️';

      output += `${statusIcon} ${result.agentId} (${result.duration}ms)\n`;

      if (result.qaReview) {
        output += `   QA: ${result.qaReview.status}\n`;
        if (result.qaReview.issues.length > 0) {
          output += `   Issues: ${result.qaReview.issues.join(', ')}\n`;
        }
      }

      if (result.scopeCheck) {
        output += `   Guardian: ${result.scopeCheck.status}\n`;
        if (result.scopeCheck.status !== 'APPROVED') {
          output += `   Reason: ${result.scopeCheck.reasoning}\n`;
        }
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Start interactive session
   */
  async startInteractiveSession(): Promise<void> {
    await this.initialize();

    console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║     GANTT DASHBOARD - PARALLEL AGENT ORCHESTRATOR         ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
    console.log(chalk.gray('Pipeline: Producer → QA (A11) → Guardian (AG)\n'));
    console.log(chalk.yellow('Commands: status | agents | sprints | sprint N | help\n'));

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = (): void => {
      rl.question(chalk.green('\n> '), async (input) => {
        const trimmed = input.trim();

        if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
          console.log(chalk.cyan('\nGoodbye!\n'));
          rl.close();
          return;
        }

        try {
          const response = await this.processMessage(trimmed);
          console.log(chalk.white('\n' + response));
        } catch (error) {
          console.log(chalk.red(`\nError: ${error}`));
        }

        prompt();
      });
    };

    prompt();
  }

  /**
   * Logging helper
   */
  private log(type: string, message: string): void {
    if (!this.config.verbose) return;

    const prefix: Record<string, string> = {
      info: chalk.blue('[INFO]'),
      success: chalk.green('[OK]'),
      error: chalk.red('[ERROR]'),
      thinking: chalk.yellow('[THINKING]'),
      pipeline: chalk.magenta('[PIPELINE]'),
      sprint: chalk.cyan('[SPRINT]'),
    };

    console.log(`${prefix[type] || chalk.gray(`[${type.toUpperCase()}]`)} ${message}`);
  }
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  const orchestrator = new GanttDashboardOrchestrator({
    verbose: true,
    enablePipeline: true
  });

  await orchestrator.startInteractiveSession();
}

main().catch(console.error);
