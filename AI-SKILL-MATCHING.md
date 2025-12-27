# Bryntum AI Skill Matching

Dit document beschrijft de AI-powered competency-based resource assignment voor Bryntum SchedulerPro, inclusief skill matching algoritmes en automatische toewijzing.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Skill Model](#skill-model)
3. [Matching Algoritme](#matching-algoritme)
4. [AI Enhancement](#ai-enhancement)
5. [UI Components](#ui-components)
6. [Backend Implementatie](#backend-implementatie)

---

## Overzicht

De AI Skill Matching feature automatiseert de toewijzing van resources aan taken gebaseerd op vereiste skills, beschikbaarheid, en workload balancing.

### Architectuur

```
┌────────────────────────────────────────────────────────────────┐
│                   AI Skill Matching                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Task Requirements                     │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │   │
│  │  │ Required  │  │  Skill    │  │  Task Duration    │    │   │
│  │  │  Skills   │  │  Levels   │  │  & Complexity     │    │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┴──────────────────────────────┐   │
│  │                    Resource Pool                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │   │
│  │  │ Resource  │  │  Skill    │  │  Availability     │    │   │
│  │  │  Skills   │  │  Matrix   │  │  & Workload       │    │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 AI Matching Engine                       │   │
│  │  • Skill compatibility scoring                           │   │
│  │  • Workload balancing                                    │   │
│  │  • Availability optimization                             │   │
│  │  • Team composition analysis                             │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Optimized Assignments                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Skill Model

### Skill Definition

```javascript
// lib/models/Skill.js
class Skill {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.category = config.category; // technical, soft, domain
        this.levels = config.levels || ['beginner', 'intermediate', 'advanced', 'expert'];
        this.parentSkill = config.parentSkill || null; // Voor hiërarchische skills
    }

    // Check of skill A gerelateerd is aan skill B
    isRelatedTo(otherSkill) {
        if (this.id === otherSkill.id) return true;
        if (this.category === otherSkill.category) return true;
        if (this.parentSkill === otherSkill.id) return true;
        return false;
    }
}

// Skill catalog
const skillCatalog = {
    technical: [
        { id: 'javascript', name: 'JavaScript', category: 'technical' },
        { id: 'typescript', name: 'TypeScript', category: 'technical', parentSkill: 'javascript' },
        { id: 'react', name: 'React', category: 'technical', parentSkill: 'javascript' },
        { id: 'nodejs', name: 'Node.js', category: 'technical', parentSkill: 'javascript' },
        { id: 'python', name: 'Python', category: 'technical' },
        { id: 'java', name: 'Java', category: 'technical' },
        { id: 'sql', name: 'SQL', category: 'technical' }
    ],
    domain: [
        { id: 'finance', name: 'Finance Domain', category: 'domain' },
        { id: 'healthcare', name: 'Healthcare Domain', category: 'domain' },
        { id: 'ecommerce', name: 'E-commerce Domain', category: 'domain' }
    ],
    soft: [
        { id: 'leadership', name: 'Leadership', category: 'soft' },
        { id: 'communication', name: 'Communication', category: 'soft' },
        { id: 'problemsolving', name: 'Problem Solving', category: 'soft' }
    ]
};
```

### Resource Skill Matrix

```javascript
// lib/models/ResourceSkillMatrix.js
class ResourceSkillMatrix {
    constructor(resource) {
        this.resource = resource;
        this.skills = new Map(); // skill_id -> { level, experience, lastUsed }
    }

    addSkill(skillId, level, experienceYears = 0) {
        this.skills.set(skillId, {
            level,
            levelScore: this.getLevelScore(level),
            experienceYears,
            lastUsed: new Date()
        });
    }

    getLevelScore(level) {
        const scores = {
            'beginner': 25,
            'intermediate': 50,
            'advanced': 75,
            'expert': 100
        };
        return scores[level] || 0;
    }

    hasSkill(skillId, minLevel = 'beginner') {
        const skill = this.skills.get(skillId);
        if (!skill) return false;
        return skill.levelScore >= this.getLevelScore(minLevel);
    }

    getSkillLevel(skillId) {
        return this.skills.get(skillId)?.level || null;
    }

    getSkillScore(skillId) {
        return this.skills.get(skillId)?.levelScore || 0;
    }

    /**
     * Bereken overall skill match score tegen requirements
     */
    calculateMatchScore(requirements) {
        let totalScore = 0;
        let maxPossibleScore = 0;

        for (const req of requirements) {
            const weight = req.weight || 1;
            maxPossibleScore += 100 * weight;

            const skillData = this.skills.get(req.skillId);
            if (skillData) {
                // Score based on level match
                const requiredScore = this.getLevelScore(req.minLevel);
                const actualScore = skillData.levelScore;

                if (actualScore >= requiredScore) {
                    // Full or bonus score
                    totalScore += Math.min(100, actualScore) * weight;
                } else {
                    // Partial score
                    totalScore += (actualScore / requiredScore) * 100 * weight * 0.5;
                }
            }
        }

        return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    }
}
```

### Task Skill Requirements

```javascript
// lib/models/TaskSkillRequirements.js
class TaskSkillRequirements {
    constructor(task) {
        this.task = task;
        this.requirements = []; // { skillId, minLevel, weight, isMandatory }
    }

    addRequirement(skillId, minLevel = 'intermediate', weight = 1, isMandatory = true) {
        this.requirements.push({
            skillId,
            minLevel,
            weight,
            isMandatory
        });
    }

    getMandatorySkills() {
        return this.requirements.filter(r => r.isMandatory);
    }

    getOptionalSkills() {
        return this.requirements.filter(r => !r.isMandatory);
    }

    /**
     * Check of een resource aan alle mandatory requirements voldoet
     */
    meetsMinimumRequirements(resourceMatrix) {
        return this.getMandatorySkills().every(req =>
            resourceMatrix.hasSkill(req.skillId, req.minLevel)
        );
    }
}
```

---

## Matching Algoritme

### Skill Matching Service

```javascript
// lib/SkillMatchingService.js
class SkillMatchingService {
    constructor(config = {}) {
        this.weights = {
            skillMatch: 0.4,
            availability: 0.25,
            workload: 0.2,
            experience: 0.1,
            preference: 0.05
        };
    }

    /**
     * Vind beste resources voor een taak
     */
    findBestMatches(task, resources, options = {}) {
        const taskRequirements = new TaskSkillRequirements(task);

        // Bouw requirements van task data
        if (task.requiredSkills) {
            task.requiredSkills.forEach(skill => {
                taskRequirements.addRequirement(
                    skill.id,
                    skill.minLevel || 'intermediate',
                    skill.weight || 1,
                    skill.mandatory !== false
                );
            });
        }

        // Score elke resource
        const scoredResources = resources
            .map(resource => ({
                resource,
                scores: this.calculateResourceScore(resource, taskRequirements, task),
                qualified: taskRequirements.meetsMinimumRequirements(
                    this.getResourceSkillMatrix(resource)
                )
            }))
            .filter(result => result.qualified || options.includePartialMatches)
            .sort((a, b) => b.scores.total - a.scores.total);

        return scoredResources.slice(0, options.limit || 5);
    }

    calculateResourceScore(resource, taskRequirements, task) {
        const skillMatrix = this.getResourceSkillMatrix(resource);

        const scores = {
            skillMatch: skillMatrix.calculateMatchScore(taskRequirements.requirements),
            availability: this.calculateAvailabilityScore(resource, task),
            workload: this.calculateWorkloadScore(resource),
            experience: this.calculateExperienceScore(resource, task),
            preference: this.calculatePreferenceScore(resource, task)
        };

        // Bereken gewogen totaal
        scores.total = Object.entries(this.weights).reduce(
            (total, [key, weight]) => total + (scores[key] || 0) * weight,
            0
        );

        return scores;
    }

    getResourceSkillMatrix(resource) {
        // Bouw matrix van resource data
        const matrix = new ResourceSkillMatrix(resource);

        if (resource.skills) {
            resource.skills.forEach(skill => {
                matrix.addSkill(skill.id, skill.level, skill.experience);
            });
        }

        return matrix;
    }

    calculateAvailabilityScore(resource, task) {
        // Check beschikbaarheid in task period
        const taskStart = task.startDate;
        const taskEnd = task.endDate;

        // Simplified - check tegen calendar
        const availableHours = this.getAvailableHours(resource, taskStart, taskEnd);
        const requiredHours = task.effort || task.duration;

        return Math.min(100, (availableHours / requiredHours) * 100);
    }

    calculateWorkloadScore(resource) {
        // Balance workload - prefer resources met minder current assignments
        const currentLoad = resource.currentAssignments?.length || 0;
        const maxLoad = resource.maxConcurrentTasks || 5;

        return ((maxLoad - currentLoad) / maxLoad) * 100;
    }

    calculateExperienceScore(resource, task) {
        // Score gebaseerd op vergelijkbare taken in verleden
        const similarTasksCompleted = resource.taskHistory?.filter(t =>
            this.isSimilarTask(t, task)
        ).length || 0;

        return Math.min(100, similarTasksCompleted * 20);
    }

    calculatePreferenceScore(resource, task) {
        // Resource preference voor bepaalde types taken
        if (resource.preferredTaskTypes?.includes(task.type)) {
            return 100;
        }
        if (resource.avoidedTaskTypes?.includes(task.type)) {
            return 0;
        }
        return 50;
    }

    getAvailableHours(resource, start, end) {
        // Simplified calculation
        return 8 * Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    isSimilarTask(historicTask, newTask) {
        return historicTask.type === newTask.type;
    }
}
```

### Batch Assignment Optimizer

```javascript
// lib/BatchAssignmentOptimizer.js
class BatchAssignmentOptimizer {
    constructor(matchingService) {
        this.matchingService = matchingService;
    }

    /**
     * Optimaliseer assignments voor meerdere taken tegelijk
     */
    async optimizeAssignments(tasks, resources) {
        const assignments = new Map();
        const resourceWorkload = new Map();

        // Initialiseer workload tracking
        resources.forEach(r => resourceWorkload.set(r.id, 0));

        // Sorteer taken op prioriteit
        const sortedTasks = [...tasks].sort((a, b) =>
            (b.priority || 0) - (a.priority || 0)
        );

        for (const task of sortedTasks) {
            const matches = this.matchingService.findBestMatches(task, resources, {
                limit: 10
            });

            // Kies beste beschikbare resource
            const selectedMatch = this.selectBestAvailable(matches, resourceWorkload, task);

            if (selectedMatch) {
                assignments.set(task.id, {
                    task,
                    resource: selectedMatch.resource,
                    scores: selectedMatch.scores
                });

                // Update workload
                const currentLoad = resourceWorkload.get(selectedMatch.resource.id) || 0;
                resourceWorkload.set(
                    selectedMatch.resource.id,
                    currentLoad + (task.effort || task.duration || 1)
                );
            }
        }

        return {
            assignments: Array.from(assignments.values()),
            unassigned: tasks.filter(t => !assignments.has(t.id)),
            resourceUtilization: this.calculateUtilization(resourceWorkload, resources)
        };
    }

    selectBestAvailable(matches, workloadMap, task) {
        for (const match of matches) {
            const currentLoad = workloadMap.get(match.resource.id) || 0;
            const maxLoad = match.resource.maxWorkload || 40;

            if (currentLoad + (task.effort || 1) <= maxLoad) {
                return match;
            }
        }
        return null;
    }

    calculateUtilization(workloadMap, resources) {
        return resources.map(r => ({
            resource: r,
            utilization: ((workloadMap.get(r.id) || 0) / (r.maxWorkload || 40)) * 100
        }));
    }
}
```

---

## AI Enhancement

### AI-Powered Skill Matching

```javascript
// lib/AISkillMatcher.js
class AISkillMatcher {
    constructor(config = {}) {
        this.apiEndpoint = config.apiEndpoint || '/api/ai-skillmatch';
        this.baseService = new SkillMatchingService();
    }

    /**
     * Enhanced matching met AI voor edge cases
     */
    async findBestMatchesWithAI(task, resources) {
        // Eerst basis matching
        const baseMatches = this.baseService.findBestMatches(task, resources, {
            limit: 10,
            includePartialMatches: true
        });

        // Als geen goede matches, vraag AI voor alternatieven
        if (baseMatches.length === 0 || baseMatches[0].scores.total < 60) {
            const aiSuggestions = await this.getAISuggestions(task, resources, baseMatches);
            return this.mergeResults(baseMatches, aiSuggestions);
        }

        return baseMatches;
    }

    async getAISuggestions(task, resources, currentMatches) {
        const response = await fetch(`${this.apiEndpoint}/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: {
                    name: task.name,
                    type: task.type,
                    description: task.description,
                    requiredSkills: task.requiredSkills
                },
                resources: resources.map(r => ({
                    id: r.id,
                    name: r.name,
                    skills: r.skills,
                    experience: r.yearsExperience
                })),
                currentMatches: currentMatches.map(m => ({
                    resourceId: m.resource.id,
                    score: m.scores.total
                })),
                prompt: `Analyze task requirements and resource capabilities.
                         Suggest resources that might have transferable skills or
                         could quickly learn the required skills.

                         Return JSON:
                         {
                             "suggestions": [
                                 {
                                     "resourceId": "id",
                                     "reason": "why this resource could work",
                                     "trainingNeeded": ["skill1", "skill2"],
                                     "confidence": 0-100
                                 }
                             ]
                         }`
            })
        });

        return response.json();
    }

    mergeResults(baseMatches, aiSuggestions) {
        const merged = [...baseMatches];

        for (const suggestion of aiSuggestions.suggestions) {
            const existingIndex = merged.findIndex(
                m => m.resource.id === suggestion.resourceId
            );

            if (existingIndex >= 0) {
                // Enhance existing match met AI insights
                merged[existingIndex].aiInsights = suggestion;
            } else {
                // Voeg nieuwe AI-suggested match toe
                merged.push({
                    resource: { id: suggestion.resourceId },
                    scores: { total: suggestion.confidence * 0.5 },
                    aiInsights: suggestion,
                    isAISuggested: true
                });
            }
        }

        return merged;
    }

    /**
     * Vraag AI om skill gap analyse
     */
    async analyzeSkillGaps(team, upcomingTasks) {
        const response = await fetch(`${this.apiEndpoint}/analyze-gaps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team: team.map(r => ({
                    name: r.name,
                    skills: r.skills
                })),
                upcomingTasks: upcomingTasks.map(t => ({
                    name: t.name,
                    requiredSkills: t.requiredSkills
                })),
                prompt: `Analyze the skill gaps between team capabilities and upcoming task requirements.
                         Identify:
                         1. Skills that are missing from the team
                         2. Skills that need improvement
                         3. Resources that could be trained
                         4. Potential hiring needs`
            })
        });

        return response.json();
    }
}
```

---

## UI Components

### Skill Match Panel

```javascript
// components/SkillMatchPanel.js
import { Panel, Grid, Toast } from '@bryntum/schedulerpro';

class SkillMatchPanel extends Panel {
    static type = 'skillmatchpanel';

    static configurable = {
        title: 'Resource Matching',
        width: 500,

        tools: {
            autoAssign: {
                icon: 'b-fa b-fa-magic',
                tooltip: 'Auto-assign best matches',
                onClick: 'up.onAutoAssign'
            }
        },

        items: {
            matchGrid: {
                type: 'grid',
                flex: 1,
                columns: [
                    { text: 'Resource', field: 'name', flex: 2 },
                    {
                        text: 'Skill Match',
                        field: 'skillScore',
                        type: 'percent',
                        width: 100
                    },
                    {
                        text: 'Overall Score',
                        field: 'totalScore',
                        type: 'percent',
                        width: 100
                    },
                    {
                        text: 'Status',
                        field: 'qualified',
                        renderer: ({ value }) => value
                            ? '<span class="qualified">✓ Qualified</span>'
                            : '<span class="partial">Partial</span>',
                        width: 100
                    }
                ],
                features: {
                    sort: { field: 'totalScore', ascending: false }
                }
            }
        }
    };

    async showMatchesForTask(task, resources) {
        const matcher = new AISkillMatcher();
        const matches = await matcher.findBestMatchesWithAI(task, resources);

        this.widgetMap.matchGrid.store.data = matches.map(m => ({
            id: m.resource.id,
            name: m.resource.name,
            skillScore: m.scores.skillMatch,
            totalScore: m.scores.total,
            qualified: m.qualified,
            aiInsights: m.aiInsights
        }));
    }

    async onAutoAssign() {
        const selectedTask = this.task;
        const topMatch = this.widgetMap.matchGrid.store.first;

        if (topMatch && topMatch.qualified) {
            // Assign
            this.trigger('assign', {
                task: selectedTask,
                resource: topMatch
            });

            Toast.show({
                html: `Assigned ${topMatch.name} to ${selectedTask.name}`,
                color: 'success'
            });
        }
    }
}

SkillMatchPanel.initClass();
```

---

## Backend Implementatie

### Node.js Skill Matching Service

```javascript
// server/ai-skillmatch.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai-skillmatch/suggest', async (req, res) => {
    const { task, resources, currentMatches, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a resource matching expert for software development teams.'
                },
                {
                    role: 'user',
                    content: `
                        Task: ${JSON.stringify(task)}
                        Available Resources: ${JSON.stringify(resources)}
                        Current Matches: ${JSON.stringify(currentMatches)}

                        ${prompt}
                    `
                }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        res.json(JSON.parse(response.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-skillmatch/analyze-gaps', async (req, res) => {
    const { team, upcomingTasks, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a team skills analyst providing actionable insights.'
                },
                {
                    role: 'user',
                    content: `
                        Team: ${JSON.stringify(team)}
                        Upcoming Tasks: ${JSON.stringify(upcomingTasks)}

                        ${prompt}
                    `
                }
            ],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        res.json(JSON.parse(response.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

---

## Gerelateerde Documentatie

- [AI-PEST-CONTROL.md](./AI-PEST-CONTROL.md) - Field service scheduling
- [SCHEDULER-DEEP-DIVE-RESOURCES.md](./SCHEDULER-DEEP-DIVE-RESOURCES.md) - Resource management
- [SCHEDULER-DEEP-DIVE-ASSIGNMENTS.md](./SCHEDULER-DEEP-DIVE-ASSIGNMENTS.md) - Assignment system

---

*Gegenereerd op basis van Bryntum SchedulerPro 7.1.0 trial*
*Bron: examples/ai-skillmatching/*
