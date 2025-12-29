/**
 * Sprint Command - Show sprint details and execute sprint
 */

import { SPRINTS, GanttDashboardOrchestrator } from '../orchestrator.js';
import { getAgentById } from '../agents.js';
import { loadProjectContext, getDeliverableById } from '../context.js';
import chalk from 'chalk';

async function showSprint(sprintNumber?: string) {
  const context = await loadProjectContext();

  if (!sprintNumber) {
    // Show all sprints overview
    console.log(chalk.bold.cyan('\n========================================'));
    console.log(chalk.bold.cyan('  GANTT DASHBOARD - SPRINT OVERVIEW'));
    console.log(chalk.bold.cyan('========================================\n'));

    SPRINTS.forEach((sprint, index) => {
      console.log(chalk.bold.yellow(`Sprint ${index + 1}: ${sprint.name}`));
      console.log(chalk.gray('─'.repeat(40)));

      // Deliverables
      console.log(chalk.bold('  Deliverables:'));
      sprint.deliverables.forEach(dId => {
        const deliverable = getDeliverableById(context, dId);
        const status = deliverable?.status || 'unknown';
        const statusIcon = status === 'completed' ? chalk.green('✓') :
                          status === 'in_progress' ? chalk.yellow('◐') :
                          chalk.gray('○');
        console.log(`    ${statusIcon} ${dId}: ${deliverable?.name || 'Unknown'}`);
      });

      // Agents
      console.log(chalk.bold('  Agents:'));
      sprint.agents.forEach(aId => {
        const agent = getAgentById(aId);
        console.log(chalk.cyan(`    ${aId}: ${agent?.name || 'Unknown'}`));
      });

      console.log();
    });

    return;
  }

  // Show specific sprint
  const sprintIndex = parseInt(sprintNumber) - 1;
  if (sprintIndex < 0 || sprintIndex >= SPRINTS.length) {
    console.log(chalk.red(`Invalid sprint number. Use 1-${SPRINTS.length}`));
    return;
  }

  const sprint = SPRINTS[sprintIndex];

  console.log(chalk.bold.cyan('\n========================================'));
  console.log(chalk.bold.cyan(`  SPRINT ${sprintNumber}: ${sprint.name.toUpperCase()}`));
  console.log(chalk.bold.cyan('========================================\n'));

  // Calculate sprint progress
  let completed = 0;
  let total = sprint.deliverables.length;

  console.log(chalk.bold('DELIVERABLES'));
  console.log(chalk.gray('─'.repeat(50)));

  for (const dId of sprint.deliverables) {
    const deliverable = getDeliverableById(context, dId);
    if (!deliverable) {
      console.log(chalk.gray(`  ${dId}: Not found`));
      continue;
    }

    const statusIcon = deliverable.status === 'completed' ? chalk.green('✓') :
                      deliverable.status === 'in_progress' ? chalk.yellow('◐') :
                      chalk.gray('○');

    if (deliverable.status === 'completed') completed++;

    console.log(`  ${statusIcon} ${deliverable.id}: ${deliverable.name}`);

    if (deliverable.dependencies.length > 0) {
      console.log(chalk.gray(`      Dependencies: ${deliverable.dependencies.join(', ')}`));
    }
  }

  // Progress
  const percent = Math.round((completed / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));

  console.log();
  console.log(chalk.bold('PROGRESS'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`  [${chalk.green(bar)}] ${percent}% (${completed}/${total})`);

  console.log();
  console.log(chalk.bold('ASSIGNED AGENTS'));
  console.log(chalk.gray('─'.repeat(50)));

  for (const aId of sprint.agents) {
    const agent = getAgentById(aId);
    if (agent) {
      console.log(chalk.cyan(`  ${agent.id} ${agent.name}`));
      console.log(chalk.gray(`      ${agent.role}`));
    }
  }

  console.log();
}

// Parse command line argument
const sprintNumber = process.argv[2];
showSprint(sprintNumber).catch(console.error);
