/**
 * Project Context Loader
 *
 * Loads and parses project documentation for agent context
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// =============================================================================
// TYPES
// =============================================================================

export interface Deliverable {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  dependencies: string[];
}

export interface Task {
  id: string;
  deliverable: string;
  section: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProjectContext {
  summary: string;
  deliverables: Deliverable[];
  tasks: Task[];
  outcomes: string[];
  keyResults: number;
}

// =============================================================================
// CONTEXT LOADER
// =============================================================================

/**
 * Load project context from documentation files
 */
export async function loadProjectContext(): Promise<ProjectContext> {
  const context: ProjectContext = {
    summary: '',
    deliverables: [],
    tasks: [],
    outcomes: [],
    keyResults: 0
  };

  try {
    // Load DELIVERABLES.md for overview
    const deliverablesContent = await loadFile('DELIVERABLES.md');
    context.deliverables = parseDeliverables(deliverablesContent);

    // Load OUTCOMES.md summary
    const outcomesContent = await loadFile('OUTCOMES.md');
    context.outcomes = parseOutcomes(outcomesContent);
    context.keyResults = countKeyResults(outcomesContent);

    // Load TASKS.md for task list
    const tasksContent = await loadFile('TASKS.md');
    context.tasks = parseTasks(tasksContent);

    // Build summary
    context.summary = buildSummary(context);

  } catch (error) {
    console.error('Error loading project context:', error);
  }

  return context;
}

/**
 * Load file from project root
 */
async function loadFile(filename: string): Promise<string> {
  const filepath = join(PROJECT_ROOT, filename);
  try {
    return await readFile(filepath, 'utf-8');
  } catch {
    console.warn(`Could not load ${filename}`);
    return '';
  }
}

/**
 * Parse deliverables from DELIVERABLES.md
 */
function parseDeliverables(content: string): Deliverable[] {
  const deliverables: Deliverable[] = [];

  // Pattern: | D1 | Foundation Module | Pending | - |
  const tablePattern = /\|\s*(D\d+|M\d+|P\d+)\s*\|\s*([^|]+)\|\s*(\w+)\s*\|\s*([^|]*)\|/g;
  let match;

  while ((match = tablePattern.exec(content)) !== null) {
    deliverables.push({
      id: match[1].trim(),
      name: match[2].trim(),
      status: match[3].trim().toLowerCase() as 'pending' | 'in_progress' | 'completed',
      dependencies: match[4].trim().split(',').map(d => d.trim()).filter(d => d && d !== '-')
    });
  }

  return deliverables;
}

/**
 * Parse outcomes from OUTCOMES.md
 */
function parseOutcomes(content: string): string[] {
  const outcomes: string[] = [];

  // Pattern: ## O1: Outcome Name
  const outcomePattern = /^##\s*O(\d+):\s*(.+)$/gm;
  let match;

  while ((match = outcomePattern.exec(content)) !== null) {
    outcomes.push(`O${match[1]}: ${match[2]}`);
  }

  return outcomes;
}

/**
 * Count key results from OUTCOMES.md
 */
function countKeyResults(content: string): number {
  // Pattern: KR1.1, KR2.15, etc.
  const krPattern = /KR\d+\.\d+/g;
  const matches = content.match(krPattern);
  return matches ? new Set(matches).size : 0;
}

/**
 * Parse tasks from TASKS.md
 */
function parseTasks(content: string): Task[] {
  const tasks: Task[] = [];

  // Pattern: ### T1.1.1: Task Name
  const taskPattern = /^###\s*(T[\d.]+):\s*(.+)$/gm;
  let match;

  while ((match = taskPattern.exec(content)) !== null) {
    const taskId = match[1];
    const parts = taskId.replace('T', '').split('.');

    tasks.push({
      id: taskId,
      deliverable: `D${parts[0]}`,
      section: `S${parts[0]}.${parts[1]}`,
      name: match[2].trim(),
      status: 'pending'
    });
  }

  return tasks;
}

/**
 * Build context summary
 */
function buildSummary(context: ProjectContext): string {
  return `
GANTT DASHBOARD PROJECT
=======================

A multi-workspace project management platform built with:
- Bryntum Suite 7.1.0 (Gantt, Calendar, TaskBoard, Grid)
- Next.js 16 with App Router
- React 18 + TypeScript
- Supabase (PostgreSQL, Auth, RLS)
- Vercel deployment

PROJECT SCOPE:
- ${context.outcomes.length} Outcomes
- ${context.keyResults} Key Results
- ${context.deliverables.length} Deliverables
- ${context.tasks.length} Tasks

OUTCOMES:
${context.outcomes.map(o => `  - ${o}`).join('\n')}

DELIVERABLE STATUS:
- Pending: ${context.deliverables.filter(d => d.status === 'pending').length}
- In Progress: ${context.deliverables.filter(d => d.status === 'in_progress').length}
- Completed: ${context.deliverables.filter(d => d.status === 'completed').length}

KEY ARCHITECTURE DECISIONS:
- ProjectModel as single source of truth for all Bryntum views
- CrudManager for frontend-backend data sync
- Row Level Security (RLS) for data isolation
- 5 user roles: Admin, Vault Medewerker, Medewerker, Klant Editor, Klant Viewer
- Vault system with Kanban workflow and 30-day retention
`.trim();
}

/**
 * Get deliverable by ID
 */
export function getDeliverableById(context: ProjectContext, id: string): Deliverable | undefined {
  return context.deliverables.find(d => d.id === id);
}

/**
 * Get tasks for deliverable
 */
export function getTasksForDeliverable(context: ProjectContext, deliverableId: string): Task[] {
  return context.tasks.filter(t => t.deliverable === deliverableId);
}

/**
 * Get pending deliverables
 */
export function getPendingDeliverables(context: ProjectContext): Deliverable[] {
  return context.deliverables.filter(d => d.status === 'pending');
}

/**
 * Get deliverables ready to start (all dependencies completed)
 */
export function getReadyDeliverables(context: ProjectContext): Deliverable[] {
  return context.deliverables.filter(d => {
    if (d.status !== 'pending') return false;
    if (d.dependencies.length === 0) return true;

    return d.dependencies.every(depId => {
      const dep = getDeliverableById(context, depId);
      return dep && dep.status === 'completed';
    });
  });
}
