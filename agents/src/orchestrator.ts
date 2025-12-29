/**
 * Gantt Dashboard Project - AI Agent Orchestrator
 *
 * Main entry point for multi-agent project execution.
 * Coordinates 12 specialized agents based on WBS-AGENTS.md
 */

import Anthropic from '@anthropic-ai/sdk';
import { ALL_AGENTS, AgentDefinition, getAgentById } from './agents.js';
import { loadProjectContext, ProjectContext } from './context.js';
import chalk from 'chalk';

// =============================================================================
// TYPES
// =============================================================================

interface OrchestratorConfig {
  model: string;
  maxTurns: number;
  verbose: boolean;
}

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SprintConfig {
  id: string;
  name: string;
  deliverables: string[];
  agents: string[];
}

// =============================================================================
// SPRINT DEFINITIONS
// =============================================================================

export const SPRINTS: SprintConfig[] = [
  {
    id: 'sprint-1',
    name: 'Foundation',
    deliverables: ['D11', 'D12', 'D14', 'D1'],
    agents: ['A5', 'A6', 'A7', 'A3', 'A1']
  },
  {
    id: 'sprint-2',
    name: 'Core Views',
    deliverables: ['D2', 'D3', 'D4'],
    agents: ['A3', 'A2', 'A6']
  },
  {
    id: 'sprint-3',
    name: 'Extended Views',
    deliverables: ['D5', 'D8', 'D13'],
    agents: ['A3', 'A6', 'A4', 'A1']
  },
  {
    id: 'sprint-4',
    name: 'Application',
    deliverables: ['D6', 'D7', 'D9'],
    agents: ['A2', 'A4', 'A3']
  },
  {
    id: 'sprint-5',
    name: 'Features & Polish',
    deliverables: ['D10', 'D15', 'D16', 'D17', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'P1', 'P2', 'P3', 'P4', 'P5'],
    agents: ['A3', 'A8', 'A9', 'A10', 'A11']
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

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.client = new Anthropic();
    this.config = {
      model: config.model || 'claude-sonnet-4-20250514',
      maxTurns: config.maxTurns || 50,
      verbose: config.verbose ?? true
    };
  }

  /**
   * Initialize orchestrator with project context
   */
  async initialize(): Promise<void> {
    this.log('info', 'Loading project context...');
    this.context = await loadProjectContext();
    this.log('success', `Loaded ${this.context.deliverables.length} deliverables, ${this.context.tasks.length} tasks`);
  }

  /**
   * Get system prompt for orchestrator
   */
  private getSystemPrompt(): string {
    return `You are the AI Orchestrator (A0) for the Gantt Dashboard project.

PROJECT OVERVIEW:
${this.context?.summary || 'Loading...'}

YOUR TEAM (12 Specialized Agents):
${Object.entries(ALL_AGENTS).map(([key, agent]) =>
  `- ${agent.id} ${agent.name}: ${agent.role}`
).join('\n')}

SPRINT STRUCTURE:
${SPRINTS.map(s => `- ${s.name}: ${s.deliverables.join(', ')}`).join('\n')}

YOUR RESPONSIBILITIES:
1. Understand user requests and map to deliverables/tasks
2. Delegate work to appropriate specialist agents
3. Coordinate dependencies between agents
4. Track progress and report status
5. Escalate decisions to the user when needed
6. Validate deliverables meet acceptance criteria

DELEGATION FORMAT:
When delegating, specify:
- Agent ID and name
- Specific task or deliverable
- Expected output
- Dependencies on other work

COMMUNICATION STYLE:
- Be concise and action-oriented
- Report progress with clear status indicators
- Flag blockers immediately
- Ask for clarification when requirements are ambiguous

AVAILABLE COMMANDS:
- "status" - Show current progress
- "sprint [N]" - Start or continue sprint N
- "delegate [agent] [task]" - Assign task to agent
- "review [deliverable]" - Review deliverable acceptance criteria
- "escalate [issue]" - Escalate decision to user`;
  }

  /**
   * Process user message and coordinate agents
   */
  async processMessage(userMessage: string): Promise<string> {
    if (!this.context) {
      await this.initialize();
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    this.log('thinking', 'Processing request...');

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

      // Check if agent delegation is needed
      const delegations = this.parseDelegations(assistantMessage);
      if (delegations.length > 0) {
        this.log('delegation', `Delegating to ${delegations.length} agent(s)`);
        for (const delegation of delegations) {
          await this.executeAgentTask(delegation.agentId, delegation.task);
        }
      }

      return assistantMessage;

    } catch (error) {
      this.log('error', `API error: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a task with a specific agent
   */
  async executeAgentTask(agentId: string, task: string): Promise<string> {
    const agent = getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.log('agent', `${agent.id} ${agent.name} starting: ${task.substring(0, 50)}...`);

    const response = await this.client.messages.create({
      model: agent.model === 'opus' ? 'claude-opus-4-20250514' : 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: agent.prompt,
      messages: [
        {
          role: 'user',
          content: `Task: ${task}\n\nProject Context:\n${this.context?.summary || ''}`
        }
      ]
    });

    const result = response.content[0].type === 'text' ? response.content[0].text : '';
    this.log('success', `${agent.id} completed task`);

    return result;
  }

  /**
   * Parse delegation commands from orchestrator response
   */
  private parseDelegations(response: string): Array<{agentId: string, task: string}> {
    const delegations: Array<{agentId: string, task: string}> = [];

    // Pattern: [DELEGATE A3] Task description
    const delegatePattern = /\[DELEGATE (A\d+)\]\s*(.+?)(?=\[DELEGATE|\n\n|$)/gs;
    let match;

    while ((match = delegatePattern.exec(response)) !== null) {
      delegations.push({
        agentId: match[1],
        task: match[2].trim()
      });
    }

    return delegations;
  }

  /**
   * Get sprint status
   */
  getSprintStatus(sprintId: string): string {
    const sprint = SPRINTS.find(s => s.id === sprintId);
    if (!sprint) return 'Sprint not found';

    return `
Sprint: ${sprint.name}
Deliverables: ${sprint.deliverables.join(', ')}
Agents: ${sprint.agents.map(id => {
      const agent = getAgentById(id);
      return agent ? `${agent.id} ${agent.name}` : id;
    }).join(', ')}
`;
  }

  /**
   * Start interactive session
   */
  async startInteractiveSession(): Promise<void> {
    await this.initialize();

    console.log(chalk.bold.cyan('\n========================================'));
    console.log(chalk.bold.cyan('  GANTT DASHBOARD - AI ORCHESTRATOR'));
    console.log(chalk.bold.cyan('========================================\n'));
    console.log(chalk.gray('Type your commands or questions. Type "exit" to quit.\n'));
    console.log(chalk.yellow('Quick commands:'));
    console.log(chalk.gray('  status    - Show project status'));
    console.log(chalk.gray('  sprint 1  - Start Sprint 1'));
    console.log(chalk.gray('  agents    - List all agents'));
    console.log(chalk.gray('  help      - Show help\n'));

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = (): void => {
      rl.question(chalk.green('\nYou > '), async (input) => {
        const trimmed = input.trim();

        if (trimmed.toLowerCase() === 'exit') {
          console.log(chalk.cyan('\nGoodbye!\n'));
          rl.close();
          return;
        }

        if (trimmed.toLowerCase() === 'agents') {
          this.printAgentList();
          prompt();
          return;
        }

        if (trimmed.toLowerCase() === 'help') {
          this.printHelp();
          prompt();
          return;
        }

        try {
          const response = await this.processMessage(trimmed);
          console.log(chalk.cyan('\nOrchestrator > ') + response);
        } catch (error) {
          console.log(chalk.red(`\nError: ${error}`));
        }

        prompt();
      });
    };

    prompt();
  }

  /**
   * Print agent list
   */
  private printAgentList(): void {
    console.log(chalk.bold('\n=== AI AGENT TEAM ===\n'));
    Object.values(ALL_AGENTS).forEach(agent => {
      console.log(chalk.yellow(`${agent.id} ${agent.name}`));
      console.log(chalk.gray(`   ${agent.role}`));
      console.log(chalk.gray(`   Primary: ${agent.primaryDeliverables.join(', ') || 'Support role'}`));
      console.log();
    });
  }

  /**
   * Print help
   */
  private printHelp(): void {
    console.log(chalk.bold('\n=== ORCHESTRATOR COMMANDS ===\n'));
    console.log(chalk.yellow('status') + chalk.gray(' - Show current project status'));
    console.log(chalk.yellow('sprint [N]') + chalk.gray(' - Start or continue sprint N (1-5)'));
    console.log(chalk.yellow('agents') + chalk.gray(' - List all available agents'));
    console.log(chalk.yellow('deliverable [ID]') + chalk.gray(' - Show deliverable details'));
    console.log(chalk.yellow('delegate [agent] [task]') + chalk.gray(' - Assign task to agent'));
    console.log(chalk.yellow('review [ID]') + chalk.gray(' - Review deliverable acceptance criteria'));
    console.log(chalk.yellow('exit') + chalk.gray(' - Exit orchestrator'));
    console.log();
  }

  /**
   * Logging helper
   */
  private log(type: string, message: string): void {
    if (!this.config.verbose) return;

    const prefix = {
      info: chalk.blue('[INFO]'),
      success: chalk.green('[OK]'),
      error: chalk.red('[ERROR]'),
      thinking: chalk.yellow('[THINKING]'),
      delegation: chalk.magenta('[DELEGATE]'),
      agent: chalk.cyan('[AGENT]')
    }[type] || chalk.gray(`[${type.toUpperCase()}]`);

    console.log(`${prefix} ${message}`);
  }
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  const orchestrator = new GanttDashboardOrchestrator({
    verbose: true
  });

  await orchestrator.startInteractiveSession();
}

// Run if executed directly
main().catch(console.error);
