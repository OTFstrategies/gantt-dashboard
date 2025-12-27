# Bryntum AI-Powered Gantt Scheduling

Dit document beschrijft de integratie van AI-functionaliteiten met Bryntum Gantt voor intelligente projectplanning en automatische scheduling.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [AI Architectuur](#ai-architectuur)
3. [Backend Integratie](#backend-integratie)
4. [OpenAI Plugin](#openai-plugin)
5. [AI Scheduling Use Cases](#ai-scheduling-use-cases)
6. [Implementatie Patronen](#implementatie-patronen)
7. [Best Practices](#best-practices)

---

## Overzicht

Bryntum biedt AI-integratie mogelijkheden via de `OpenAIPlugin` en `FormulaProvider` infrastructuur. Hoewel de AI-functionaliteit primair in Grid is geïmplementeerd, kunnen dezelfde patronen worden toegepast op Gantt voor intelligente scheduling.

### Kern Componenten

```
┌─────────────────────────────────────────────────────────────┐
│                     Bryntum AI Stack                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ OpenAIPlugin│    │FormulaProvider│   │ AIFilter      │  │
│  └──────┬──────┘    └───────┬──────┘    └───────┬───────┘  │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AbstractApiPlugin                       │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Backend (PHP/Node.js + LLM API)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Architectuur

### OpenAIPlugin Structuur

```
gantt.d.ts / grid.d.ts
```

```typescript
// Core/feature/ai/apiPlugins/OpenAIPlugin
type OpenAIPluginConfig = {
    // Event bubbling configuratie
    bubbleEvents?: object

    // Function call handlers
    callOnFunctions?: boolean

    // Exception handling
    catchEventHandlerExceptions?: boolean

    // Plugin status
    disabled?: boolean

    // Event listeners
    listeners?: OpenAIPluginListeners

    // Localization
    localeClass?: typeof Base
    localizableProperties?: string[]
}

export class OpenAIPlugin extends AbstractApiPlugin {
    static readonly isOpenAIPlugin: boolean
    readonly isOpenAIPlugin: boolean
}
```

### FormulaProvider Systeem

```typescript
// Core/util/FormulaProvider
type FormulaProviderConfig = {
    // Input field binding
    inputField?: string

    // Event listeners
    listeners?: FormulaProviderListeners

    // Request parameter naam
    paramName?: string

    // Response veld naam
    responseField?: string

    // API endpoint URL
    url?: string
}

export class FormulaProvider extends Base {
    static readonly isFormulaProvider: boolean

    // Process prompt en return AI response
    processPrompt(prompt: string): Promise<string>
}
```

### FormulaProvider Events

```typescript
type FormulaProviderListenersTypes = {
    // Fired before formula is sent to API
    formulaChange: (event: {
        source: FormulaProvider
        formula: string
        record: Model
    }) => void

    // Fired on network error
    formulaNetworkError: (event: {
        source: FormulaProvider
        response: Response
    }) => void
}
```

---

## Backend Integratie

### PHP Backend Configuratie

De AI-Gantt demo gebruikt een PHP backend voor de OpenAI communicatie:

```
bryntum-gantt-trial/examples/ai-gantt/php/config.php
```

```php
<?php
// AI Gantt Backend Configuration

return [
    'openai' => [
        'api_key' => getenv('OPENAI_API_KEY'),
        'model' => 'gpt-4',
        'max_tokens' => 1000,
        'temperature' => 0.7
    ],

    'scheduling' => [
        'context_prompt' => 'You are a project scheduling assistant...',
        'optimize_resources' => true,
        'respect_constraints' => true
    ]
];
```

### Node.js Backend Voorbeeld

```javascript
// server/ai-scheduling.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateSchedule(projectData, prompt) {
    const systemPrompt = `
        You are a project scheduling expert. Analyze the following project data
        and provide optimized scheduling suggestions.

        Project constraints:
        - Respect task dependencies
        - Consider resource availability
        - Minimize project duration
        - Balance workload across resources
    `;

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Project data: ${JSON.stringify(projectData)}\n\nRequest: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
    });

    return response.choices[0].message.content;
}

export async function optimizeCriticalPath(tasks, dependencies) {
    // AI-powered critical path optimization
    const prompt = `
        Analyze the following tasks and dependencies.
        Identify the critical path and suggest optimizations.

        Tasks: ${JSON.stringify(tasks)}
        Dependencies: ${JSON.stringify(dependencies)}
    `;

    return generateSchedule({ tasks, dependencies }, prompt);
}
```

---

## OpenAI Plugin

### Configuratie in Grid (Referentie)

```javascript
// grid.d.ts referentie - toegepast op Gantt
const gantt = new Gantt({
    // FormulaProviders voor AI-gestuurde velden
    formulaProviders: {
        AI: {
            url: './api/ai-prompt',
            body: {
                max_tokens: 100,
                temperature: 1
            },

            onFormulaChange(event) {
                // Augmenteer prompt met context
                event.formula = `Project context: ${gantt.project.name}. ${event.formula}`;
            },

            onFormulaNetworkError({ response }) {
                Toast.show({
                    html: `AI Error: ${response.statusText}`,
                    timeout: 3000
                });
            }
        }
    },

    features: {
        // Potentiële AI-Filter voor Gantt taken
        // (Momenteel alleen beschikbaar in Grid)
    }
});
```

### AI-Powered Kolommen

```javascript
// Voorbeeld: AI-gestuurde kolommen voor taak analyse
const gantt = new Gantt({
    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 },
        {
            // AI-gestuurde risico analyse
            text: 'Risk Assessment',
            field: 'riskLevel',
            formula: true,
            tooltip: 'Type =AI(Assess the risk level for task $name)',
            renderer({ value }) {
                const colors = {
                    'Low': 'green',
                    'Medium': 'orange',
                    'High': 'red'
                };
                return `<span style="color: ${colors[value] || 'gray'}">${value || 'Unknown'}</span>`;
            }
        },
        {
            // AI-gestuurde suggesties
            text: 'AI Suggestions',
            field: 'aiSuggestion',
            formula: true,
            autoHeight: true,
            tooltip: 'Type =AI(Suggest optimizations for task $name with duration $duration)'
        }
    ]
});
```

---

## AI Scheduling Use Cases

### 1. Automatische Taak Planning

```javascript
// AI-gestuurde taak planning
class AISchedulingHelper {
    constructor(gantt, apiEndpoint) {
        this.gantt = gantt;
        this.apiEndpoint = apiEndpoint;
    }

    async suggestSchedule(prompt) {
        const projectData = this.extractProjectData();

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                projectData,
                context: {
                    projectStart: this.gantt.project.startDate,
                    projectEnd: this.gantt.project.endDate,
                    resources: this.gantt.project.resourceStore.records.map(r => ({
                        id: r.id,
                        name: r.name,
                        calendar: r.calendar?.name
                    }))
                }
            })
        });

        return response.json();
    }

    extractProjectData() {
        return {
            tasks: this.gantt.taskStore.records.map(task => ({
                id: task.id,
                name: task.name,
                startDate: task.startDate,
                endDate: task.endDate,
                duration: task.duration,
                percentDone: task.percentDone,
                constraintType: task.constraintType,
                constraintDate: task.constraintDate
            })),
            dependencies: this.gantt.dependencyStore.records.map(dep => ({
                from: dep.fromTask?.id,
                to: dep.toTask?.id,
                type: dep.type,
                lag: dep.lag
            })),
            assignments: this.gantt.assignmentStore.records.map(a => ({
                taskId: a.eventId,
                resourceId: a.resourceId,
                units: a.units
            }))
        };
    }

    async applyScheduleSuggestions(suggestions) {
        const { gantt } = this;

        gantt.project.suspendAutoSync();

        try {
            for (const suggestion of suggestions) {
                const task = gantt.taskStore.getById(suggestion.taskId);
                if (task) {
                    await task.setStartDate(new Date(suggestion.suggestedStart));
                }
            }

            await gantt.project.commitAsync();
        } finally {
            gantt.project.resumeAutoSync();
        }
    }
}
```

### 2. Resource Optimalisatie

```javascript
// AI-gestuurde resource allocatie
async function optimizeResourceAllocation(gantt) {
    const aiHelper = new AISchedulingHelper(gantt, '/api/ai-scheduling');

    const result = await aiHelper.suggestSchedule(`
        Analyze current resource allocation and suggest optimizations:
        - Identify over-allocated resources
        - Suggest task reassignments
        - Balance workload across team
        - Minimize resource conflicts
    `);

    // Verwerk AI suggesties
    if (result.suggestions) {
        // Toon dialog met suggesties
        new MessageDialog({
            title: 'AI Resource Optimization',
            message: formatSuggestions(result.suggestions),
            buttons: [{
                text: 'Apply Suggestions',
                onClick: () => applyResourceChanges(gantt, result.suggestions)
            }, {
                text: 'Cancel'
            }]
        });
    }
}
```

### 3. Critical Path Analyse

```javascript
// AI-enhanced critical path analyse
async function analyzeCriticalPath(gantt) {
    const criticalTasks = gantt.taskStore.records.filter(t => t.critical);

    const aiHelper = new AISchedulingHelper(gantt, '/api/ai-scheduling');

    const analysis = await aiHelper.suggestSchedule(`
        Analyze the critical path and provide insights:
        - Current critical path duration: ${calculateCriticalPathDuration(criticalTasks)} days
        - Critical tasks: ${criticalTasks.map(t => t.name).join(', ')}

        Suggest ways to:
        1. Reduce critical path duration
        2. Add buffers without extending project
        3. Identify tasks that could become critical
    `);

    return analysis;
}
```

### 4. Risico Analyse

```javascript
// AI-powered project risk analysis
async function analyzeProjectRisks(gantt) {
    const projectData = {
        tasks: gantt.taskStore.records.map(t => ({
            name: t.name,
            duration: t.duration,
            percentDone: t.percentDone,
            slackTime: t.totalSlack,
            resourceCount: t.assignments?.length || 0,
            hasConstraints: !!t.constraintType
        })),
        overallProgress: calculateOverallProgress(gantt),
        daysUntilDeadline: calculateDaysUntilDeadline(gantt)
    };

    const response = await fetch('/api/ai-risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: 'Analyze project risks and provide mitigation strategies',
            projectData
        })
    });

    return response.json();
}
```

---

## Implementatie Patronen

### Pattern 1: Toolbar AI Assistant

```javascript
const gantt = new Gantt({
    tbar: [
        {
            type: 'button',
            text: 'AI Assistant',
            icon: 'b-fa b-fa-robot',
            menu: {
                items: [
                    {
                        text: 'Optimize Schedule',
                        icon: 'b-fa b-fa-calendar-check',
                        onItem: () => optimizeSchedule(gantt)
                    },
                    {
                        text: 'Balance Resources',
                        icon: 'b-fa b-fa-users',
                        onItem: () => balanceResources(gantt)
                    },
                    {
                        text: 'Risk Analysis',
                        icon: 'b-fa b-fa-exclamation-triangle',
                        onItem: () => analyzeRisks(gantt)
                    },
                    {
                        text: 'Generate Report',
                        icon: 'b-fa b-fa-file-alt',
                        onItem: () => generateAIReport(gantt)
                    }
                ]
            }
        },
        {
            type: 'textfield',
            width: 300,
            placeholder: 'Ask AI about your project...',
            triggers: {
                send: {
                    cls: 'b-fa b-fa-paper-plane',
                    handler: 'up.onAIQuery'
                }
            }
        }
    ],

    onAIQuery({ source }) {
        const query = source.value;
        if (query) {
            processAIQuery(this, query);
            source.value = '';
        }
    }
});
```

### Pattern 2: Context Menu AI Actions

```javascript
const gantt = new Gantt({
    features: {
        taskMenu: {
            items: {
                aiSeparator: {
                    type: 'separator',
                    weight: 500
                },
                aiSuggest: {
                    text: 'AI Suggestions',
                    icon: 'b-fa b-fa-lightbulb',
                    weight: 510,
                    onItem({ taskRecord }) {
                        getAISuggestions(taskRecord);
                    }
                },
                aiOptimize: {
                    text: 'AI Optimize Duration',
                    icon: 'b-fa b-fa-clock',
                    weight: 520,
                    onItem({ taskRecord }) {
                        optimizeTaskDuration(taskRecord);
                    }
                }
            }
        }
    }
});

async function getAISuggestions(task) {
    const response = await fetch('/api/ai-task-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: {
                name: task.name,
                duration: task.duration,
                percentDone: task.percentDone,
                predecessors: task.predecessors?.map(p => p.name),
                successors: task.successors?.map(s => s.name),
                resources: task.resources?.map(r => r.name)
            },
            prompt: 'Provide optimization suggestions for this task'
        })
    });

    const suggestions = await response.json();
    showSuggestionsDialog(task, suggestions);
}
```

### Pattern 3: Real-time AI Validation

```javascript
const gantt = new Gantt({
    listeners: {
        beforeTaskDrop({ taskRecords, targetDate }) {
            // AI validatie van de drop
            return validateWithAI(taskRecords, targetDate);
        },

        beforeTaskResize({ taskRecord, startDate, endDate }) {
            // AI check voor impact
            return checkScheduleImpact(taskRecord, startDate, endDate);
        }
    }
});

async function validateWithAI(tasks, targetDate) {
    const response = await fetch('/api/ai-validate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tasks: tasks.map(t => ({ id: t.id, name: t.name })),
            targetDate,
            prompt: 'Validate if this schedule change is advisable'
        })
    });

    const result = await response.json();

    if (!result.valid) {
        Toast.show({
            html: `AI Warning: ${result.reason}`,
            color: 'warning'
        });
    }

    return result.valid;
}
```

---

## Best Practices

### 1. API Key Management

```javascript
// Nooit API keys in frontend code
// Gebruik altijd een backend proxy

// Backend proxy endpoint
app.post('/api/ai-proxy', async (req, res) => {
    const { prompt, context } = req.body;

    // Rate limiting
    if (!checkRateLimit(req.ip)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // API call naar OpenAI
    const result = await openai.chat.completions.create({
        model: process.env.AI_MODEL,
        messages: [{ role: 'user', content: prompt }]
    });

    res.json(result);
});
```

### 2. Error Handling

```javascript
class AISchedulingService {
    async makeRequest(prompt, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt }),
                    signal: AbortSignal.timeout(30000) // 30s timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (attempt === retries - 1) {
                    Toast.show({
                        html: 'AI service temporarily unavailable',
                        color: 'error'
                    });
                    throw error;
                }

                // Exponential backoff
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            }
        }
    }
}
```

### 3. Response Caching

```javascript
class AIResponseCache {
    constructor(ttlMs = 300000) { // 5 minuten default
        this.cache = new Map();
        this.ttl = ttlMs;
    }

    getCacheKey(prompt, context) {
        return JSON.stringify({ prompt, context });
    }

    get(prompt, context) {
        const key = this.getCacheKey(prompt, context);
        const entry = this.cache.get(key);

        if (entry && Date.now() - entry.timestamp < this.ttl) {
            return entry.value;
        }

        return null;
    }

    set(prompt, context, value) {
        const key = this.getCacheKey(prompt, context);
        this.cache.set(key, { value, timestamp: Date.now() });
    }
}
```

### 4. User Feedback Integration

```javascript
// Track AI suggestion acceptance rate
async function trackAISuggestion(suggestionId, accepted, feedback) {
    await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            suggestionId,
            accepted,
            feedback,
            timestamp: new Date().toISOString()
        })
    });
}

// Gebruik in dialog
function showSuggestionsDialog(task, suggestions) {
    new Dialog({
        title: `AI Suggestions for ${task.name}`,
        items: suggestions.map(s => ({
            type: 'widget',
            html: `<div class="suggestion">${s.text}</div>`
        })),
        buttons: [{
            text: 'Apply',
            onClick() {
                applySuggestion(suggestions);
                trackAISuggestion(suggestions.id, true);
            }
        }, {
            text: 'Dismiss',
            onClick() {
                trackAISuggestion(suggestions.id, false);
            }
        }]
    });
}
```

---

## Gerelateerde Documentatie

- [AI-GRID-ECOMMERCE.md](./AI-GRID-ECOMMERCE.md) - AI ecommerce grid implementatie
- [AI-REVIEW-WORKFLOW.md](./AI-REVIEW-WORKFLOW.md) - AI review workflows
- [IMPL-WEBSOCKET-SYNC.md](./IMPL-WEBSOCKET-SYNC.md) - Real-time synchronisatie
- [DEEP-DIVE-SCHEDULING.md](./DEEP-DIVE-SCHEDULING.md) - Scheduling engine details

---

*Gegenereerd op basis van Bryntum Gantt 7.1.0 trial*
*AI integratie vereist backend implementatie en API keys*
