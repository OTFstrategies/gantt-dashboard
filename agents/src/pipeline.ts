/**
 * Parallel Agent Pipeline
 *
 * Executes agents in parallel with automatic review chain:
 * Producer(s) -> Reviewer (A11) -> Guardian (AG)
 *
 * Features:
 * - Parallel execution of independent tasks
 * - Automatic QA review of producer output
 * - Scope Guardian validation on ALL output
 * - Feedback loops for rejected work
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AgentDefinition,
  ALL_AGENTS,
  getAgentById,
  getProducerAgents,
  getGuardianAgent,
  AG_GUARDIAN,
  A11_QA,
} from './agents.js';
import chalk from 'chalk';

// =============================================================================
// TYPES
// =============================================================================

export interface PipelineTask {
  id: string;
  agentId: string;
  task: string;
  context?: string;
  dependencies?: string[]; // Task IDs that must complete first
}

export interface PipelineResult {
  taskId: string;
  agentId: string;
  status: 'success' | 'failed' | 'rejected';
  output: string;
  qaReview?: QAReview;
  scopeCheck?: ScopeCheck;
  duration: number;
}

export interface QAReview {
  status: 'PASS' | 'FAIL' | 'NEEDS_WORK';
  issues: string[];
  suggestions: string[];
}

export interface ScopeCheck {
  status: 'APPROVED' | 'REJECTED' | 'WARNING';
  reasoning: string;
  action: string;
}

export interface PipelineConfig {
  maxParallel: number;
  enableQA: boolean;
  enableGuardian: boolean;
  verbose: boolean;
  maxRetries: number;
}

// =============================================================================
// PARALLEL PIPELINE CLASS
// =============================================================================

export class ParallelPipeline {
  private client: Anthropic;
  private config: PipelineConfig;
  private projectContext: string = '';
  private results: Map<string, PipelineResult> = new Map();

  constructor(config: Partial<PipelineConfig> = {}) {
    this.client = new Anthropic();
    this.config = {
      maxParallel: config.maxParallel ?? 4,
      enableQA: config.enableQA ?? true,
      enableGuardian: config.enableGuardian ?? true,
      verbose: config.verbose ?? true,
      maxRetries: config.maxRetries ?? 2,
    };
  }

  /**
   * Set project context (WBS, current state, etc.)
   */
  setContext(context: string): void {
    this.projectContext = context;
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeTasks(tasks: PipelineTask[]): Promise<PipelineResult[]> {
    this.log('pipeline', `Starting pipeline with ${tasks.length} tasks`);

    // Group tasks by dependency level
    const levels = this.groupByDependencyLevel(tasks);

    const allResults: PipelineResult[] = [];

    for (let level = 0; level < levels.length; level++) {
      const levelTasks = levels[level];
      this.log('level', `Executing level ${level + 1}/${levels.length} (${levelTasks.length} tasks)`);

      // Execute tasks at this level in parallel
      const levelResults = await this.executeParallel(levelTasks);
      allResults.push(...levelResults);

      // Check if any task failed that blocks the next level
      const failed = levelResults.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        this.log('warning', `${failed.length} task(s) rejected by Guardian - stopping pipeline`);
        break;
      }
    }

    return allResults;
  }

  /**
   * Execute tasks in parallel (up to maxParallel)
   */
  private async executeParallel(tasks: PipelineTask[]): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];
    const batches = this.chunk(tasks, this.config.maxParallel);

    for (const batch of batches) {
      const batchPromises = batch.map(task => this.executeTask(task));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Execute a single task through the pipeline
   */
  private async executeTask(task: PipelineTask): Promise<PipelineResult> {
    const startTime = Date.now();
    const agent = getAgentById(task.agentId);

    if (!agent) {
      return {
        taskId: task.id,
        agentId: task.agentId,
        status: 'failed',
        output: `Agent ${task.agentId} not found`,
        duration: Date.now() - startTime,
      };
    }

    this.log('agent', `${agent.id} ${agent.name} starting: ${task.task.substring(0, 50)}...`);

    try {
      // Step 1: Execute the agent task
      const output = await this.callAgent(agent, task.task);

      // Step 2: QA Review (for producers only)
      let qaReview: QAReview | undefined;
      if (this.config.enableQA && agent.type === 'producer') {
        this.log('qa', `A11 QA reviewing ${agent.id} output...`);
        qaReview = await this.performQAReview(agent.id, output);

        if (qaReview.status === 'FAIL') {
          this.log('qa-fail', `QA FAILED for ${agent.id}: ${qaReview.issues.join(', ')}`);
          return {
            taskId: task.id,
            agentId: task.agentId,
            status: 'failed',
            output,
            qaReview,
            duration: Date.now() - startTime,
          };
        }
      }

      // Step 3: Scope Guardian validation
      let scopeCheck: ScopeCheck | undefined;
      if (this.config.enableGuardian) {
        this.log('guardian', `AG Guardian validating ${agent.id} output...`);
        scopeCheck = await this.performScopeCheck(agent.id, task.task, output);

        if (scopeCheck.status === 'REJECTED') {
          this.log('guardian-reject', `REJECTED by Guardian: ${scopeCheck.reasoning}`);
          return {
            taskId: task.id,
            agentId: task.agentId,
            status: 'rejected',
            output,
            qaReview,
            scopeCheck,
            duration: Date.now() - startTime,
          };
        }

        if (scopeCheck.status === 'WARNING') {
          this.log('guardian-warn', `WARNING from Guardian: ${scopeCheck.reasoning}`);
        }
      }

      this.log('success', `${agent.id} completed successfully`);

      return {
        taskId: task.id,
        agentId: task.agentId,
        status: 'success',
        output,
        qaReview,
        scopeCheck,
        duration: Date.now() - startTime,
      };

    } catch (error) {
      this.log('error', `${agent.id} failed: ${error}`);
      return {
        taskId: task.id,
        agentId: task.agentId,
        status: 'failed',
        output: `Error: ${error}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Call an agent with the Anthropic API
   */
  private async callAgent(agent: AgentDefinition, task: string): Promise<string> {
    const model = agent.model === 'opus'
      ? 'claude-opus-4-20250514'
      : agent.model === 'haiku'
        ? 'claude-haiku-4-20250514'
        : 'claude-sonnet-4-20250514';

    const response = await this.client.messages.create({
      model,
      max_tokens: 4096,
      system: agent.prompt,
      messages: [
        {
          role: 'user',
          content: `TASK: ${task}\n\nPROJECT CONTEXT:\n${this.projectContext}`
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  /**
   * Perform QA review using A11
   */
  private async performQAReview(agentId: string, output: string): Promise<QAReview> {
    const reviewPrompt = `Review this output from ${agentId}:\n\n${output}\n\nProvide your review in this exact format:
STATUS: PASS | FAIL | NEEDS_WORK
ISSUES:
- [issue 1]
- [issue 2]
SUGGESTIONS:
- [suggestion 1]`;

    const response = await this.callAgent(A11_QA, reviewPrompt);

    // Parse the response
    const statusMatch = response.match(/STATUS:\s*(PASS|FAIL|NEEDS_WORK)/i);
    const issuesMatch = response.match(/ISSUES:\n([\s\S]*?)(?=SUGGESTIONS:|$)/i);
    const suggestionsMatch = response.match(/SUGGESTIONS:\n([\s\S]*?)$/i);

    return {
      status: (statusMatch?.[1]?.toUpperCase() as QAReview['status']) || 'NEEDS_WORK',
      issues: this.parseList(issuesMatch?.[1] || ''),
      suggestions: this.parseList(suggestionsMatch?.[1] || ''),
    };
  }

  /**
   * Perform scope validation using AG Guardian
   */
  private async performScopeCheck(agentId: string, task: string, output: string): Promise<ScopeCheck> {
    const checkPrompt = `Validate this work against project scope:

AGENT: ${agentId}
TASK: ${task}

OUTPUT:
${output.substring(0, 2000)}${output.length > 2000 ? '...[truncated]' : ''}

Respond in this exact format:
STATUS: APPROVED | REJECTED | WARNING
REASONING: [your reasoning]
ACTION: [what should happen next]`;

    const response = await this.callAgent(AG_GUARDIAN, checkPrompt);

    // Parse the response
    const statusMatch = response.match(/STATUS:\s*(APPROVED|REJECTED|WARNING)/i);
    const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)(?=ACTION:|$)/i);
    const actionMatch = response.match(/ACTION:\s*([\s\S]*?)$/i);

    return {
      status: (statusMatch?.[1]?.toUpperCase() as ScopeCheck['status']) || 'WARNING',
      reasoning: reasoningMatch?.[1]?.trim() || 'No reasoning provided',
      action: actionMatch?.[1]?.trim() || 'Review manually',
    };
  }

  /**
   * Group tasks by dependency level for parallel execution
   */
  private groupByDependencyLevel(tasks: PipelineTask[]): PipelineTask[][] {
    const levels: PipelineTask[][] = [];
    const remaining = [...tasks];
    const completed = new Set<string>();

    while (remaining.length > 0) {
      const level: PipelineTask[] = [];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const task = remaining[i];
        const deps = task.dependencies || [];
        const depsCompleted = deps.every(d => completed.has(d));

        if (depsCompleted) {
          level.push(task);
          remaining.splice(i, 1);
        }
      }

      if (level.length === 0 && remaining.length > 0) {
        // Circular dependency or missing dependency - force remaining
        this.log('warning', 'Possible circular dependency - forcing remaining tasks');
        levels.push(remaining);
        break;
      }

      level.forEach(t => completed.add(t.id));
      levels.push(level);
    }

    return levels;
  }

  /**
   * Parse a bullet list from text
   */
  private parseList(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Split array into chunks
   */
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Logging helper
   */
  private log(type: string, message: string): void {
    if (!this.config.verbose) return;

    const prefixes: Record<string, string> = {
      pipeline: chalk.blue('[PIPELINE]'),
      level: chalk.cyan('[LEVEL]'),
      agent: chalk.yellow('[AGENT]'),
      qa: chalk.magenta('[QA]'),
      'qa-fail': chalk.red('[QA FAIL]'),
      guardian: chalk.cyan('[GUARDIAN]'),
      'guardian-reject': chalk.red('[REJECTED]'),
      'guardian-warn': chalk.yellow('[WARNING]'),
      success: chalk.green('[OK]'),
      error: chalk.red('[ERROR]'),
      warning: chalk.yellow('[WARN]'),
    };

    const prefix = prefixes[type] || chalk.gray(`[${type.toUpperCase()}]`);
    console.log(`${prefix} ${message}`);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a simple task
 */
export function createTask(
  agentId: string,
  task: string,
  options: { id?: string; context?: string; dependencies?: string[] } = {}
): PipelineTask {
  return {
    id: options.id || `${agentId}-${Date.now()}`,
    agentId,
    task,
    context: options.context,
    dependencies: options.dependencies,
  };
}

/**
 * Create parallel tasks (no dependencies between them)
 */
export function parallelTasks(...tasks: Array<[string, string]>): PipelineTask[] {
  return tasks.map(([agentId, task], index) =>
    createTask(agentId, task, { id: `parallel-${index}` })
  );
}

/**
 * Create sequential tasks (each depends on previous)
 */
export function sequentialTasks(...tasks: Array<[string, string]>): PipelineTask[] {
  return tasks.map(([agentId, task], index) =>
    createTask(agentId, task, {
      id: `seq-${index}`,
      dependencies: index > 0 ? [`seq-${index - 1}`] : undefined,
    })
  );
}
