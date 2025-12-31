# Bryntum AI Grid Generator

Dit document beschrijft de AI-powered code generatie UI voor Bryntum Grid, waarmee gebruikers via prompts grid configuraties kunnen genereren.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Architectuur](#architectuur)
3. [Prompt-Based Generation](#prompt-based-generation)
4. [Code Output](#code-output)
5. [Backend Implementatie](#backend-implementatie)
6. [Use Cases](#use-cases)

---

## Overzicht

De AI Grid Generator stelt gebruikers in staat om Bryntum Grid configuraties te genereren via natuurlijke taal prompts. Dit versnelt development en maakt Grid configuratie toegankelijk voor niet-developers.

### Functionaliteiten

```
┌────────────────────────────────────────────────────────────────┐
│                    AI Grid Generator                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 User Prompt Input                        │   │
│  │  "Create a grid with employee data, sortable columns,   │   │
│  │   and inline editing"                                    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AI Processing (OpenAI)                      │   │
│  │  • Parse requirements                                    │   │
│  │  • Generate column config                                │   │
│  │  • Add features                                          │   │
│  │  • Create store config                                   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Generated Code Output                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ JavaScript  │  │   Preview   │  │  Copy/Export    │  │   │
│  │  │    Code     │  │    Grid     │  │    Options      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Architectuur

### AI Generator Service

```javascript
// lib/AIGridGenerator.js
class AIGridGenerator {
    constructor(config = {}) {
        this.apiEndpoint = config.apiEndpoint || '/api/ai-generator';
        this.defaultFeatures = config.defaultFeatures || ['sort', 'filter', 'columnResize'];
    }

    /**
     * Genereer grid configuratie van prompt
     */
    async generateFromPrompt(prompt) {
        const response = await fetch(`${this.apiEndpoint}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                context: this.buildContext(),
                systemPrompt: this.getSystemPrompt()
            })
        });

        const result = await response.json();
        return this.validateAndEnhance(result);
    }

    getSystemPrompt() {
        return `
You are a Bryntum Grid configuration generator.
Generate valid JavaScript/TypeScript configuration objects for Bryntum Grid.

Available column types:
- text, number, date, check, rating, percent, action, widget, tree, template

Available features:
- sort, filter, group, columnResize, cellEdit, cellMenu, headerMenu,
  rowExpander, stripe, search, regionResize, cellTooltip

Output JSON:
{
    "columns": [...],
    "features": {...},
    "store": {...},
    "selectionMode": {...},
    "rowHeight": number,
    "tbar": [...],
    "bbar": [...]
}
        `;
    }

    buildContext() {
        return {
            bryntumVersion: '7.1.0',
            supportedColumnTypes: [
                'text', 'number', 'date', 'check', 'rating',
                'percent', 'action', 'widget', 'tree', 'template'
            ],
            supportedFeatures: [
                'sort', 'filter', 'group', 'columnResize', 'cellEdit',
                'cellMenu', 'headerMenu', 'rowExpander', 'stripe',
                'search', 'regionResize', 'cellTooltip', 'summary',
                'rowCopyPaste', 'cellCopyPaste', 'fillHandle'
            ]
        };
    }

    validateAndEnhance(config) {
        // Voeg defaults toe indien niet aanwezig
        config.features = {
            ...this.defaultFeatures.reduce((acc, f) => ({ ...acc, [f]: true }), {}),
            ...config.features
        };

        // Valideer kolommen
        if (config.columns) {
            config.columns = config.columns.map(col => this.validateColumn(col));
        }

        return config;
    }

    validateColumn(column) {
        // Zorg voor minimaal required properties
        return {
            text: column.text || column.field,
            field: column.field,
            type: column.type || 'text',
            flex: column.flex || 1,
            ...column
        };
    }
}
```

### Generator UI Component

```javascript
// components/AIGeneratorPanel.js
import { Panel, TextAreaField, Button, CodeEditor, Toast } from '@bryntum/grid';

class AIGeneratorPanel extends Panel {
    static type = 'aigeneratorpanel';

    static configurable = {
        title: 'AI Grid Generator',
        width: 800,
        height: 600,
        layout: 'vbox',

        items: {
            promptArea: {
                type: 'textarea',
                label: 'Describe your grid',
                height: 150,
                placeholder: `Examples:
- Create a grid for managing employees with name, department, salary columns
- Build a product catalog with sorting and filtering
- Generate an order management grid with status badges`
            },
            generateBtn: {
                type: 'button',
                text: 'Generate Grid',
                icon: 'b-fa b-fa-magic',
                cls: 'b-green',
                onClick: 'up.onGenerateClick'
            },
            outputTabs: {
                type: 'tabpanel',
                flex: 1,
                items: {
                    codeTab: {
                        title: 'Generated Code',
                        items: [{
                            type: 'widget',
                            ref: 'codeOutput',
                            html: '<pre><code></code></pre>'
                        }]
                    },
                    previewTab: {
                        title: 'Preview',
                        ref: 'previewContainer'
                    }
                }
            },
            toolbar: {
                type: 'toolbar',
                items: {
                    copyBtn: {
                        type: 'button',
                        text: 'Copy Code',
                        icon: 'b-fa b-fa-copy',
                        onClick: 'up.onCopyCode'
                    },
                    downloadBtn: {
                        type: 'button',
                        text: 'Download',
                        icon: 'b-fa b-fa-download',
                        onClick: 'up.onDownload'
                    },
                    applyBtn: {
                        type: 'button',
                        text: 'Apply to Grid',
                        icon: 'b-fa b-fa-check',
                        cls: 'b-blue',
                        onClick: 'up.onApply'
                    }
                }
            }
        }
    };

    construct(config) {
        super.construct(config);
        this.generator = new AIGridGenerator({
            apiEndpoint: config.apiEndpoint
        });
    }

    async onGenerateClick() {
        const prompt = this.widgetMap.promptArea.value;

        if (!prompt.trim()) {
            Toast.show({ html: 'Please enter a description', color: 'warning' });
            return;
        }

        this.mask('Generating...');

        try {
            const config = await this.generator.generateFromPrompt(prompt);
            this.generatedConfig = config;

            // Toon code
            this.displayCode(config);

            // Toon preview
            this.displayPreview(config);

            Toast.show({ html: 'Grid generated successfully!', color: 'success' });
        } catch (error) {
            Toast.show({ html: `Error: ${error.message}`, color: 'error' });
        } finally {
            this.unmask();
        }
    }

    displayCode(config) {
        const code = this.formatCode(config);
        const codeElement = this.widgetMap.codeOutput.element.querySelector('code');
        codeElement.textContent = code;

        // Syntax highlighting indien beschikbaar
        if (window.hljs) {
            window.hljs.highlightElement(codeElement);
        }
    }

    formatCode(config) {
        return `import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    columns: ${JSON.stringify(config.columns, null, 4)},

    features: ${JSON.stringify(config.features, null, 4)},

    store: ${JSON.stringify(config.store, null, 4)}${config.tbar ? `,

    tbar: ${JSON.stringify(config.tbar, null, 4)}` : ''}
});`;
    }

    displayPreview(config) {
        const container = this.widgetMap.previewContainer.element;
        container.innerHTML = '';

        // Maak preview grid
        this.previewGrid = new Grid({
            appendTo: container,
            height: 300,
            ...config,
            store: {
                ...config.store,
                data: this.generateSampleData(config.columns)
            }
        });
    }

    generateSampleData(columns) {
        // Genereer sample data gebaseerd op kolom types
        const data = [];
        for (let i = 0; i < 5; i++) {
            const row = { id: i + 1 };
            columns.forEach(col => {
                row[col.field] = this.generateSampleValue(col.type, col.field, i);
            });
            data.push(row);
        }
        return data;
    }

    generateSampleValue(type, field, index) {
        const samples = {
            text: ['Sample A', 'Sample B', 'Sample C', 'Sample D', 'Sample E'],
            number: [100, 250, 175, 320, 95],
            date: ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05', '2024-05-01'],
            check: [true, false, true, true, false],
            percent: [25, 50, 75, 100, 60],
            rating: [3, 5, 4, 2, 4]
        };

        return (samples[type] || samples.text)[index];
    }

    onCopyCode() {
        const code = this.formatCode(this.generatedConfig);
        navigator.clipboard.writeText(code);
        Toast.show({ html: 'Code copied to clipboard!', color: 'success' });
    }

    onDownload() {
        const code = this.formatCode(this.generatedConfig);
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-grid.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    onApply() {
        this.trigger('apply', { config: this.generatedConfig });
    }
}

AIGeneratorPanel.initClass();
```

---

## Prompt-Based Generation

### Prompt Examples

```javascript
// Voorbeeld prompts en verwachte output

// Prompt 1: Basic Employee Grid
const prompt1 = "Create a grid for employee management with name, email, department, and hire date";

// Generated output:
{
    columns: [
        { text: 'Name', field: 'name', type: 'text', flex: 2 },
        { text: 'Email', field: 'email', type: 'text', flex: 2 },
        { text: 'Department', field: 'department', type: 'text', flex: 1 },
        { text: 'Hire Date', field: 'hireDate', type: 'date', format: 'YYYY-MM-DD', flex: 1 }
    ],
    features: {
        sort: true,
        filter: true,
        columnResize: true
    },
    store: {
        fields: ['name', 'email', 'department', { name: 'hireDate', type: 'date' }]
    }
}

// Prompt 2: Product Grid with Actions
const prompt2 = "Build a product catalog with name, price, stock status badge, and edit/delete actions";

// Generated output:
{
    columns: [
        { text: 'Product', field: 'name', type: 'text', flex: 2 },
        {
            text: 'Price',
            field: 'price',
            type: 'number',
            format: { style: 'currency', currency: 'USD' },
            width: 100
        },
        {
            text: 'Status',
            field: 'status',
            type: 'template',
            template: ({ value }) => `<span class="status-badge ${value}">${value}</span>`
        },
        {
            text: 'Actions',
            type: 'action',
            actions: [
                { icon: 'b-fa b-fa-edit', tooltip: 'Edit', handler: 'onEdit' },
                { icon: 'b-fa b-fa-trash', tooltip: 'Delete', handler: 'onDelete' }
            ]
        }
    ],
    features: {
        sort: 'name',
        filter: true,
        cellTooltip: true
    }
}

// Prompt 3: Complex Tree Grid
const prompt3 = "Create a hierarchical project task grid with task name, assignee, progress bar, and due date";

// Generated output:
{
    columns: [
        { text: 'Task', field: 'name', type: 'tree', flex: 3 },
        { text: 'Assignee', field: 'assignee', type: 'text', flex: 1 },
        { text: 'Progress', field: 'progress', type: 'percent', width: 150 },
        { text: 'Due Date', field: 'dueDate', type: 'date', format: 'MMM DD, YYYY' }
    ],
    features: {
        tree: true,
        sort: false,
        filter: true,
        cellEdit: true
    },
    store: {
        tree: true,
        fields: ['name', 'assignee', 'progress', { name: 'dueDate', type: 'date' }]
    }
}
```

### Advanced Prompt Patterns

```javascript
// Pattern: Specificeer styling
const styledPrompt = `
Create a dark-themed sales dashboard grid with:
- Salesperson name with avatar
- Monthly sales as currency
- Target achievement as progress bar
- Ranking with star rating
- Use green for above target, red for below
`;

// Pattern: Specificeer features
const featurePrompt = `
Build an editable inventory grid with:
- Inline cell editing
- Row copy/paste support
- Excel-like fill handle
- Group by category
- Summary row with totals
`;

// Pattern: Specificeer interacties
const interactivePrompt = `
Create a customer list grid with:
- Double-click to view details in popup
- Right-click context menu for actions
- Keyboard navigation support
- Multi-select with checkboxes
- Drag-drop row reordering
`;
```

---

## Code Output

### Output Formaten

```javascript
// JavaScript (ES6+)
const jsOutput = `
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',
    columns: [...],
    features: {...}
});
`;

// TypeScript
const tsOutput = `
import { Grid, GridConfig } from '@bryntum/grid';

const config: Partial<GridConfig> = {
    columns: [...],
    features: {...}
};

const grid = new Grid({
    appendTo: 'container',
    ...config
});
`;

// React Component
const reactOutput = `
import { BryntumGrid } from '@bryntum/grid-react';

const MyGrid = () => {
    const gridConfig = {
        columns: [...],
        features: {...}
    };

    return <BryntumGrid {...gridConfig} />;
};
`;

// Vue Component
const vueOutput = `
<template>
    <bryntum-grid v-bind="gridConfig" />
</template>

<script>
export default {
    data() {
        return {
            gridConfig: {
                columns: [...],
                features: {...}
            }
        };
    }
};
</script>
`;
```

---

## Backend Implementatie

### Node.js Generator Service

```javascript
// server/ai-generator.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai-generator/generate', async (req, res) => {
    const { prompt, context, systemPrompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `
                        Context: Bryntum Grid version ${context.bryntumVersion}
                        Available column types: ${context.supportedColumnTypes.join(', ')}
                        Available features: ${context.supportedFeatures.join(', ')}

                        User request: ${prompt}

                        Generate a complete Bryntum Grid configuration.
                    `
                }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const config = JSON.parse(response.choices[0].message.content);

        // Validate en enhance
        const validated = validateGridConfig(config);

        res.json(validated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function validateGridConfig(config) {
    // Valideer columns
    if (!config.columns || !Array.isArray(config.columns)) {
        config.columns = [];
    }

    config.columns = config.columns.map(col => ({
        text: col.text || col.field || 'Column',
        field: col.field || 'field',
        type: col.type || 'text',
        ...col
    }));

    // Valideer features
    if (!config.features) {
        config.features = {};
    }

    // Valideer store
    if (!config.store) {
        config.store = {
            fields: config.columns.map(c => c.field)
        };
    }

    return config;
}

app.listen(3000);
```

---

## Use Cases

### Use Case 1: Rapid Prototyping

```javascript
// Snel een prototype grid maken
async function createPrototype(description) {
    const generator = new AIGridGenerator();

    const config = await generator.generateFromPrompt(description);

    // Direct renderen
    return new Grid({
        appendTo: 'prototype-container',
        ...config,
        store: {
            ...config.store,
            autoLoad: true,
            readUrl: '/api/sample-data'
        }
    });
}

// Gebruik
const grid = await createPrototype(
    'Create a project management grid with tasks, deadlines, and team members'
);
```

### Use Case 2: Config Migration

```javascript
// Migreer van legacy config naar Bryntum
async function migrateFromLegacy(legacyConfig) {
    const generator = new AIGridGenerator();

    const prompt = `
        Convert this legacy grid configuration to Bryntum Grid format:
        ${JSON.stringify(legacyConfig)}

        Map the columns and features to Bryntum equivalents.
    `;

    return generator.generateFromPrompt(prompt);
}
```

### Use Case 3: Template Library

```javascript
// Voorgedefinieerde templates met AI enhancement
const templates = {
    'crm-contacts': 'Create a CRM contact grid with name, company, email, phone, last contact date, and status badge',
    'inventory': 'Build an inventory management grid with SKU, product name, quantity, reorder level, and supplier',
    'timesheets': 'Generate a timesheet grid with employee, project, hours worked, date, and approval status',
    'analytics': 'Create an analytics dashboard grid with metrics, values, trends, and sparkline charts'
};

async function generateFromTemplate(templateKey, customizations = '') {
    const generator = new AIGridGenerator();
    const basePrompt = templates[templateKey];
    const fullPrompt = customizations
        ? `${basePrompt}. Additional requirements: ${customizations}`
        : basePrompt;

    return generator.generateFromPrompt(fullPrompt);
}
```

---

## Gerelateerde Documentatie

- [AI-GRID-ECOMMERCE.md](./AI-GRID-ECOMMERCE.md) - E-commerce AI patterns
- [GRID-DEEP-DIVE-COLUMNS.md](./GRID-DEEP-DIVE-COLUMNS.md) - Column configuratie
- [GRID-DEEP-DIVE-FEATURES.md](./GRID-DEEP-DIVE-FEATURES.md) - Features overzicht
- [CODE-PATTERNS.md](./CODE-PATTERNS.md) - Algemene code patterns

---

*Gegenereerd op basis van Bryntum Grid 7.1.0 trial*
*Bron: examples/ai-generator/*
