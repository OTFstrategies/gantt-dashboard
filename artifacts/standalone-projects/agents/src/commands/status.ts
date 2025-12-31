/**
 * Status Command - Show project status overview
 */

import { loadProjectContext, getPendingDeliverables, getReadyDeliverables } from '../context.js';
import chalk from 'chalk';

async function showStatus() {
  console.log(chalk.bold.cyan('\n========================================'));
  console.log(chalk.bold.cyan('  GANTT DASHBOARD - PROJECT STATUS'));
  console.log(chalk.bold.cyan('========================================\n'));

  const context = await loadProjectContext();

  // Summary
  console.log(chalk.bold('PROJECT SUMMARY'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`Outcomes:     ${context.outcomes.length}`);
  console.log(`Key Results:  ${context.keyResults}`);
  console.log(`Deliverables: ${context.deliverables.length}`);
  console.log(`Tasks:        ${context.tasks.length}`);
  console.log();

  // Deliverable Status
  const completed = context.deliverables.filter(d => d.status === 'completed');
  const inProgress = context.deliverables.filter(d => d.status === 'in_progress');
  const pending = context.deliverables.filter(d => d.status === 'pending');

  console.log(chalk.bold('DELIVERABLE STATUS'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(chalk.green(`✓ Completed:   ${completed.length}`));
  console.log(chalk.yellow(`◐ In Progress: ${inProgress.length}`));
  console.log(chalk.gray(`○ Pending:     ${pending.length}`));
  console.log();

  // Progress bar
  const total = context.deliverables.length;
  const completedPercent = Math.round((completed.length / total) * 100);
  const progressBar = '█'.repeat(Math.floor(completedPercent / 5)) + '░'.repeat(20 - Math.floor(completedPercent / 5));
  console.log(chalk.bold('PROGRESS'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`[${chalk.green(progressBar)}] ${completedPercent}%`);
  console.log();

  // Ready to start
  const ready = getReadyDeliverables(context);
  if (ready.length > 0) {
    console.log(chalk.bold('READY TO START'));
    console.log(chalk.gray('─'.repeat(40)));
    ready.forEach(d => {
      console.log(chalk.cyan(`  ${d.id}: ${d.name}`));
    });
    console.log();
  }

  // In Progress details
  if (inProgress.length > 0) {
    console.log(chalk.bold('IN PROGRESS'));
    console.log(chalk.gray('─'.repeat(40)));
    inProgress.forEach(d => {
      console.log(chalk.yellow(`  ${d.id}: ${d.name}`));
    });
    console.log();
  }

  // Outcomes
  console.log(chalk.bold('OUTCOMES'));
  console.log(chalk.gray('─'.repeat(40)));
  context.outcomes.forEach(o => {
    console.log(chalk.gray(`  ${o}`));
  });
  console.log();
}

showStatus().catch(console.error);
