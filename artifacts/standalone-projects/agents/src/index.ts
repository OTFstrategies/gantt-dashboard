/**
 * Gantt Dashboard Agents - Main Entry Point
 *
 * CLI tool for AI-powered project execution
 */

import { Command } from 'commander';
import { GanttDashboardOrchestrator } from './orchestrator.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('gantt-agents')
  .description('AI Agent Framework for Gantt Dashboard Project')
  .version('1.0.0');

program
  .command('start')
  .description('Start interactive orchestrator session')
  .action(async () => {
    const orchestrator = new GanttDashboardOrchestrator({ verbose: true });
    await orchestrator.startInteractiveSession();
  });

program
  .command('status')
  .description('Show project status')
  .action(async () => {
    const orchestrator = new GanttDashboardOrchestrator({ verbose: false });
    await orchestrator.initialize();
    const response = await orchestrator.processMessage('status');
    console.log(response);
  });

program
  .command('sprint <number>')
  .description('Execute a specific sprint (1-5)')
  .action(async (number: string) => {
    const orchestrator = new GanttDashboardOrchestrator({ verbose: true });
    await orchestrator.initialize();
    const response = await orchestrator.processMessage(`sprint ${number}`);
    console.log(response);
  });

program
  .command('delegate <agent> <task>')
  .description('Delegate a task to a specific agent (e.g., A3 "Build Gantt component")')
  .action(async (agent: string, task: string) => {
    const orchestrator = new GanttDashboardOrchestrator({ verbose: true });
    await orchestrator.initialize();
    const response = await orchestrator.processMessage(`delegate ${agent} ${task}`);
    console.log(response);
  });

program
  .command('ask <question>')
  .description('Ask the orchestrator a question')
  .action(async (question: string) => {
    const orchestrator = new GanttDashboardOrchestrator({ verbose: true });
    await orchestrator.initialize();
    const response = await orchestrator.processMessage(question);
    console.log(chalk.cyan('\nOrchestrator > ') + response);
  });

// Parse command line arguments
program.parse();

// If no command provided, start interactive mode
if (process.argv.length === 2) {
  const orchestrator = new GanttDashboardOrchestrator({ verbose: true });
  orchestrator.startInteractiveSession().catch(console.error);
}
