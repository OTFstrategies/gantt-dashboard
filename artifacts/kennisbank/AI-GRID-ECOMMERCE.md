# Bryntum AI E-commerce Grid

Dit document beschrijft de implementatie van AI-powered e-commerce functionaliteit met Bryntum Grid, inclusief product catalog AI, automatische SEO generatie, en AI-gestuurde filtering.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Complete Implementatie](#complete-implementatie)
3. [FormulaProviders](#formulaproviders)
4. [AI Filter Feature](#ai-filter-feature)
5. [Custom Columns](#custom-columns)
6. [Settings Panel](#settings-panel)
7. [Backend Integratie](#backend-integratie)
8. [Use Cases](#use-cases)

---

## Overzicht

De AI E-commerce Grid demo toont hoe Bryntum Grid kan worden gecombineerd met OpenAI voor:
- **AI Formula Columns**: Genereer content met `=AI(prompt)` syntax
- **AI Filtering**: Natuurlijke taal filtering van productgegevens
- **Automatische SEO**: AI-gegenereerde descriptions en keywords

### Architectuur

```
┌────────────────────────────────────────────────────────────────────┐
│                    AI E-commerce Grid Stack                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Bryntum Grid                              │   │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │   │
│  │  │ Product  │  │  Badge    │  │  Formula  │  │   Row     │  │   │
│  │  │ Column   │  │  Column   │  │  Column   │  │  Expander │  │   │
│  │  └──────────┘  └───────────┘  └───────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴─────────────────────────────────┐   │
│  │                    AI Layer                                  │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │   │
│  │  │ OpenAIPlugin │  │FormulaProvider│  │   AIFilter       │  │   │
│  │  └──────────────┘  └───────────────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┴─────────────────────────────────┐   │
│  │              PHP/Node.js Backend + OpenAI API               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Complete Implementatie

### Product Model

```
grid-7.1.0-trial/examples/ai-ecommerce-grid/app.module.js
```

```javascript
import { GridRowModel, Column, ColumnStore, StringHelper, Panel, Toast, Grid, OpenAIPlugin } from '@bryntum/grid';

// Product model met uitgebreide velden voor e-commerce
class Product extends GridRowModel {
    static fields = [
        // Basis productinformatie
        { name: 'name', label: 'Product name', description: 'Product name' },
        {
            name: 'category',
            description: `Product category, available values are: [Electronics, Footwear,
                          Accessories, Beverages, Wearables, Personal Care, Office Accessories,
                          Home & Office, Stationery, Home Automation, Furniture, Home Appliances,
                          Fitness, Gaming, Kitchen Appliances]`
        },
        { name: 'features', description: 'Product features' },
        { name: 'targetAudience', description: 'Target audience for the product' },
        { name: 'image', description: 'Product image URL or path' },
        { name: 'price', type: 'number', description: 'Product price' },
        { name: 'description', description: 'Product description' },

        // SEO velden (AI gegenereerd)
        { name: 'seoDescription', description: 'SEO description for the product' },
        { name: 'seoKeywords', description: 'SEO keywords for the product' },

        // Productspecificaties
        { name: 'weight', type: 'number', description: 'Product weight in grams (g)' },
        { name: 'dimensions', description: 'Product dimensions' },
        { name: 'material', description: 'Material of the product' },
        { name: 'color', description: 'Product color' },
        { name: 'warranty', description: 'Product warranty information' },
        { name: 'shipping', description: 'Shipping details for the product' },
        {
            name: 'availability',
            description: `Product availability status, available values are:
                          [In Stock, Limited Stock, Pre-Order, Out of stock]`
        },
        { name: 'brand', description: 'Product brand' }
    ];
}
```

### Badge Column (Custom Column Type)

```javascript
// Custom Column voor category badges met kleurcodering
class BadgeColumn extends Column {
    static type = 'badge';

    // Kleurenpalet voor categories
    colorPalette = [
        '#D6EAF8', '#FADBD8', '#D5F5E3', '#FCF3CF', '#E8DAEF',
        '#FDEBD0', '#AED6F1', '#F5B7B1', '#A9DFBF', '#F9E79F',
        '#D7BDE2', '#FAD7A0', '#85C1E9', '#E6B0AA', '#ABEBC6'
    ];

    // Map voor consistente kleuren per category
    colorMap = new Map();

    static defaults = {
        field: 'category',
        cellCls: 'b-badge-column',
        htmlEncode: false  // HTML rendering toestaan
    };

    renderer({ value }) {
        if (!value) {
            return '';
        }

        // Ondersteun zowel array als string values
        const categories = Array.isArray(value) ? value : [value];

        return categories.map(category => {
            // Wijs kleur toe indien nog niet gedaan
            if (!this.colorMap.has(category)) {
                const color = this.colorPalette[this.colorMap.size % this.colorPalette.length];
                this.colorMap.set(category, color);
            }

            return `<span class='badge' style='background-color: ${this.colorMap.get(category)};'>${category}</span>`;
        }).join(' ');
    }
}

// Registreer custom column type
ColumnStore.registerColumnType(BadgeColumn, true);
```

### Complete Grid Configuratie

```javascript
const grid = new Grid({
    appendTo: 'container',
    flex: '1 1 100%',
    columnLines: false,
    rowHeight: 60,

    // FormulaProviders voor AI functionaliteit
    formulaProviders: {
        AI: {
            url: './php/formulaPrompt.php',
            body: {
                max_tokens: 100,
                temperature: 1  // Hogere waarde = creatievere responses
            },

            // Augmenteer prompt met globale context
            onFormulaChange(event) {
                event.formula = `${event.formula}. ${grid.settingsPanel.widgetMap.extra.value}`;
            },

            onFormulaNetworkError({ response }) {
                Toast.show({
                    html: `<h2>AI Network Error: ${response.statusText}</h2>
                           <code>${response.url}</code>
                           <p>Ensure the server is running.</p>`,
                    timeout: 3000
                });
            }
        }
    },

    // Features configuratie
    features: {
        // AI Filter feature
        aiFilter: {
            promptUrl: './php/prompt.php',
            model: 'gpt-4-1',
            apiPlugin: OpenAIPlugin
        },

        // Standaard features
        sort: 'name',
        filter: true,
        cellTooltip: true,

        // Row Expander voor productdetails
        rowExpander: {
            columnPosition: 'last',
            refreshOnRecordChange: true,

            column: {
                width: 60,
                headerWidgets: [{
                    type: 'button',
                    style: 'order:1',
                    tooltip: 'Show settings panel',
                    icon: 'fa-cog',
                    rendition: 'text',
                    onClick: 'up.onSettingsClick'
                }]
            },

            // Renderer voor expanded content
            renderer({ record }) {
                return {
                    tag: 'div',
                    className: 'product-details-grid',
                    children: [
                        // Image Panel
                        {
                            tag: 'div',
                            className: 'detail-panel',
                            children: [
                                { tag: 'h2', text: record.name },
                                {
                                    tag: 'img',
                                    className: 'product-image',
                                    src: `resources/images/${record.image}`,
                                    alt: 'Product Image'
                                }
                            ]
                        },
                        // Specifications Panel
                        {
                            tag: 'div',
                            className: 'detail-panel',
                            children: [
                                { tag: 'strong', text: 'Weight: ' },
                                { tag: 'span', text: record.weight > 1000 ?
                                    record.weight / 1000 + 'kg' : record.weight + 'g' },
                                { tag: 'strong', text: 'Dimensions: ' },
                                { tag: 'span', text: record.dimensions },
                                { tag: 'strong', text: 'Material: ' },
                                { tag: 'span', text: record.material },
                                { tag: 'strong', text: 'Color: ' },
                                { tag: 'span', text: record.color },
                                { tag: 'strong', text: 'Warranty: ' },
                                { tag: 'span', text: record.warranty }
                            ]
                        },
                        // Pricing Panel
                        {
                            tag: 'div',
                            className: 'detail-panel',
                            children: [
                                { tag: 'strong', text: 'Price: ' },
                                { tag: 'span', text: record.price },
                                { tag: 'strong', text: 'Shipping: ' },
                                { tag: 'span', text: record.shipping },
                                { tag: 'strong', text: 'Availability: ' },
                                {
                                    tag: 'span',
                                    text: record.availability,
                                    class: record.availability === 'Out of stock' ?
                                        'out-of-stock' : ''
                                },
                                { tag: 'strong', text: 'Brand: ' },
                                { tag: 'span', text: record.brand },
                                { tag: 'strong', text: 'Category: ' },
                                { tag: 'span', text: record.category }
                            ]
                        },
                        // Actions
                        {
                            tag: 'div',
                            className: 'detail-panel',
                            children: [{
                                tag: 'button',
                                class: 'b-blue b-button b-mark-empty',
                                text: 'Mark out of stock'
                            }]
                        }
                    ]
                };
            }
        },

        // Cell editing features
        cellEdit: {
            autoSelect: false,
            autoEdit: true  // Start editing bij typing
        },

        // Copy/paste features
        cellCopyPaste: true,
        rowCopyPaste: { useNativeClipboard: true },

        // Context menu
        cellMenu: {
            items: {
                editText: {
                    text: 'Edit Text',
                    icon: 'fa fa-edit',
                    tooltip: 'Edit the (generated) text of this cell',
                    onItem: ({ cellElement, column, record }) => {
                        // Zet AI-gegenereerde waarde als bewerkbaar
                        record.set('#' + column.field, record.get(column.field));
                        grid.startEditing({ column, record });
                    }
                }
            }
        },

        // Fill handle voor bulk AI generation
        fillHandle: true
    },

    // Selection mode
    selectionMode: {
        cell: true,
        checkbox: true,
        dragSelect: true
    },

    // Kolommen configuratie
    columns: [
        {
            text: 'Product Name',
            field: 'name',
            readOnly: true,
            flex: 2,
            htmlEncode: false,
            renderer: ({ record }) =>
                (record.image ?
                    StringHelper.xss`<img alt="Picture of ${record.name || 'product'}"
                                          src="resources/images/${record.image}"/> ` : '') +
                StringHelper.encodeHtml(record.name)
        },
        {
            type: 'number',
            text: 'Price',
            field: 'price',
            format: { style: 'currency', currency: 'USD' },
            width: 100
        },
        {
            type: 'badge',
            text: 'Category',
            field: 'category',
            flex: 1
        },
        {
            text: 'Features',
            field: 'features',
            flex: 1
        },
        {
            text: 'Target Audience',
            field: 'targetAudience',
            flex: 1
        },
        {
            // AI Formula Column - SEO Description
            formula: true,
            text: 'SEO Description',
            field: 'seoDescription',
            tooltip: 'Try typing =AI(Write a SEO description about $name, max 30 words)',
            autoHeight: true,
            tooltipRenderer: ({ record, column }) => record[column.field],
            flex: 2
        },
        {
            // AI Formula Column - SEO Keywords
            formula: true,
            text: 'SEO Keywords',
            field: 'seoKeywords',
            tooltip: 'Try typing =AI(Write 1-3 SEO keywords about $name)',
            width: 180,
            tooltipRenderer: ({ record, column }) => record[column.field]
        }
    ],

    // Store configuratie
    store: {
        modelClass: Product,
        readUrl: 'data/data.json'
    },

    // Toolbar met AI filter
    tbar: [{
        type: 'aifilterfield',
        width: 400,
        placeholder: 'Ask AI to filter…'
    }],

    // Event handlers
    onPaint({ firstPaint }) {
        if (firstPaint) {
            // Maak settings panel
            this.settingsPanel = new Panel({
                drawer: true,
                width: '37em',
                title: 'Settings',
                labelPosition: 'align-before',
                items: {
                    extra: {
                        type: 'textarea',
                        height: '25em',
                        label: 'Global Prompt Suffix',
                        value: `Please return the result using the language of ${this.localeManager.locale.localeCode}.

Use natural language to describe the product, do not exaggerate or use too many words.

If message indicates just one word or number, character, image, or emoji is requested, return just *one* such item, and no extra text.`
                    },
                    temperature: {
                        type: 'slider',
                        label: 'Temperature',
                        showValue: 'thumb',
                        min: 0,
                        max: 1,
                        value: 1,
                        step: 0.1,
                        onchange: 'up.onTemperatureChange'
                    }
                }
            });

            // Click handler voor out-of-stock button
            this.element.addEventListener('click', this.onRootElementClick.bind(this));
        }
    },

    onRootElementClick({ target }) {
        if (target.matches('.b-mark-empty')) {
            const record = this.getRecordFromElement(target);
            record.set('availability', 'Out of stock');
        }
    },

    onSettingsClick() {
        const { settingsPanel } = this;
        settingsPanel[settingsPanel.isVisible ? 'hide' : 'show']();
    },

    onTemperatureChange({ value }) {
        this.formulaProviders.AI.body.temperature = value;
    },

    onLocaleChange({ localeCode, oldLocaleCode }) {
        const { settingsPanel } = this;
        if (settingsPanel) {
            const { value } = settingsPanel.widgetMap.extra;
            if (value) {
                settingsPanel.widgetMap.extra.value = value.replace(oldLocaleCode, localeCode);
            }
        }
    }
});

// Load data en selecteer eerste cel
grid.store.load().then(() => {
    grid.selectCell({ record: grid.store.first, column: grid.columns.get('seoDescription') });

    Toast.show({
        html: '<h3>Disclaimer</h3>' +
              '<p>AI generated content is dependent upon user input</p>' +
              '<p>Bryntum is not responsible for the accuracy or reliability of AI-generated content.</p>',
        timeout: 10000
    });
});
```

---

## FormulaProviders

### FormulaProvider Configuratie

```
grid.d.ts:18597-18814
```

```typescript
// FormulaProvider type definition
type FormulaProviderConfig = {
    // Input field waar formule wordt getypt
    inputField?: string

    // Event listeners
    listeners?: FormulaProviderListeners

    // Parameter naam voor API request
    paramName?: string

    // Response veld naam
    responseField?: string

    // API endpoint URL
    url?: string

    // Extra request body parameters
    body?: object
}

// Events
type FormulaProviderListenersTypes = {
    // Fired voordat formula naar API gaat
    formulaChange: (event: {
        source: FormulaProvider
        formula: string
        record: Model
    }) => void

    // Fired bij network error
    formulaNetworkError: (event: {
        source: FormulaProvider
        response: Response
    }) => void
}
```

### Formula Syntax

De `=AI(...)` syntax werkt als volgt:

```javascript
// Basis syntax
=AI(prompt text)

// Met veld referenties ($fieldName)
=AI(Write a description for $name)

// Met meerdere velden
=AI(Create SEO keywords for $name in category $category)

// Complexe prompts
=AI(Write a 30 word product description for $name. Target audience: $targetAudience. Key features: $features)
```

### Bulk AI Generation met Fill Handle

```javascript
// Fill handle configureert automatische propagatie
features: {
    fillHandle: true
}

// Bij fill down/right wordt de formule opnieuw uitgevoerd
// voor elke cel met de specifieke record data
```

---

## AI Filter Feature

### AIFilter Configuratie

```
grid.d.ts:128355-128470
```

```typescript
type AIFilterConfig = {
    // API plugin voor AI calls (OpenAIPlugin)
    apiPlugin?: typeof AbstractApiPlugin

    // Disabled state
    disabled?: boolean

    // Event listeners
    listeners?: AIFilterListeners

    // Beschikbare modellen
    models?: string[]
}

export class AIFilter extends AIBase {
    static readonly isAIFilter: boolean
}
```

### AIFilterField Widget

```typescript
// Het input veld voor AI filtering
type AIFilterFieldConfig = {
    // ARIA accessibility
    ariaDescription?: string
    ariaLabel?: string

    // Keyboard shortcuts
    keyMap?: object

    // Placeholder text
    placeholder?: string

    // Width
    width?: number
}
```

### Voorbeeld AI Filter Queries

```javascript
// Natural language filter voorbeelden:

// "Show electronics under $100"
// => Filters on: category = 'Electronics' AND price < 100

// "Products with low stock"
// => Filters on: availability IN ('Limited Stock', 'Out of stock')

// "Gaming accessories in red"
// => Filters on: category = 'Gaming' AND color CONTAINS 'red'

// "Heavy products over 1kg"
// => Filters on: weight > 1000
```

---

## Custom Columns

### Column met Formula Support

```javascript
// Formula column configuratie
{
    // Activeer formula support
    formula: true,

    text: 'AI Generated',
    field: 'generatedField',

    // Tooltip met voorbeeld prompt
    tooltip: 'Type =AI(your prompt here)',

    // Auto height voor lange content
    autoHeight: true,

    // Custom tooltip renderer
    tooltipRenderer: ({ record, column }) => record[column.field],

    // Flexibele width
    flex: 2
}
```

### Custom Badge Column

```javascript
// Registreer custom column type
class StatusBadgeColumn extends Column {
    static type = 'statusBadge';

    static defaults = {
        cellCls: 'b-status-badge-column',
        htmlEncode: false
    };

    // Status kleuren mapping
    statusColors = {
        'In Stock': '#28a745',
        'Limited Stock': '#ffc107',
        'Pre-Order': '#17a2b8',
        'Out of stock': '#dc3545'
    };

    renderer({ value }) {
        const color = this.statusColors[value] || '#6c757d';
        return `
            <span class="status-badge" style="background-color: ${color}">
                ${value}
            </span>
        `;
    }
}

ColumnStore.registerColumnType(StatusBadgeColumn, true);
```

---

## Settings Panel

### Panel Configuratie

```javascript
// Settings panel voor AI configuratie
const settingsPanel = new Panel({
    drawer: true,      // Slide-in gedrag
    width: '37em',
    title: 'AI Settings',
    labelPosition: 'align-before',

    items: {
        // Global prompt suffix
        promptSuffix: {
            type: 'textarea',
            height: '20em',
            label: 'Global Prompt Suffix',
            value: `
                Use natural language.
                Be concise and professional.
                Respect the target language.
            `
        },

        // Model selectie
        model: {
            type: 'combo',
            label: 'AI Model',
            value: 'gpt-4',
            items: ['gpt-4', 'gpt-3.5-turbo', 'claude-3']
        },

        // Temperature slider
        temperature: {
            type: 'slider',
            label: 'Creativity',
            showValue: 'thumb',
            min: 0,
            max: 1,
            value: 0.7,
            step: 0.1,
            onchange({ value }) {
                grid.formulaProviders.AI.body.temperature = value;
            }
        },

        // Max tokens
        maxTokens: {
            type: 'numberfield',
            label: 'Max Response Length',
            value: 100,
            min: 10,
            max: 500,
            step: 10
        }
    }
});
```

---

## Backend Integratie

### PHP Backend

```php
<?php
// php/formulaPrompt.php

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$prompt = $input['prompt'] ?? '';
$maxTokens = $input['max_tokens'] ?? 100;
$temperature = $input['temperature'] ?? 0.7;

// OpenAI API call
$apiKey = getenv('OPENAI_API_KEY');

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'gpt-4',
    'messages' => [
        ['role' => 'user', 'content' => $prompt]
    ],
    'max_tokens' => $maxTokens,
    'temperature' => $temperature
]));

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

echo json_encode([
    'content' => $data['choices'][0]['message']['content'] ?? 'Error generating content'
]);
```

### Node.js Backend

```javascript
// server/ai-formula.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Formula prompt endpoint
app.post('/api/formulaPrompt', async (req, res) => {
    const { prompt, max_tokens = 100, temperature = 0.7 } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens,
            temperature
        });

        res.json({
            content: response.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({
            content: `Error: ${error.message}`
        });
    }
});

// AI Filter endpoint
app.post('/api/prompt', async (req, res) => {
    const { query, columns } = req.body;

    const systemPrompt = `
        You are a filter assistant for an e-commerce product grid.
        Convert natural language queries into filter criteria.

        Available columns: ${columns.join(', ')}

        Return JSON:
        {
            "filters": [
                { "field": "fieldName", "operator": "=|>|<|contains", "value": "value" }
            ]
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
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

## Use Cases

### Use Case 1: Bulk SEO Generation

```javascript
// Genereer SEO voor alle producten
async function generateAllSEO(grid) {
    const records = grid.store.records.filter(r => !r.seoDescription);

    for (const record of records) {
        // Selecteer de SEO Description cel
        grid.selectCell({
            record,
            column: grid.columns.get('seoDescription')
        });

        // Voer formule in
        grid.startEditing();
        const editor = grid.features.cellEdit.editorContext.editor;
        editor.value = `=AI(Write a compelling SEO description for ${record.name}, max 30 words)`;

        // Wacht op AI response
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}
```

### Use Case 2: Dynamic Product Recommendations

```javascript
// AI-powered product recommendations
async function getRecommendations(grid, selectedProduct) {
    const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product: {
                name: selectedProduct.name,
                category: selectedProduct.category,
                price: selectedProduct.price,
                features: selectedProduct.features
            },
            catalog: grid.store.records.map(r => ({
                id: r.id,
                name: r.name,
                category: r.category,
                price: r.price
            }))
        })
    });

    const { recommendations } = await response.json();

    // Highlight aanbevolen producten
    recommendations.forEach(rec => {
        const record = grid.store.getById(rec.id);
        if (record) {
            record.cls = 'recommended';
        }
    });
}
```

### Use Case 3: Price Optimization Suggestions

```javascript
// AI prijsoptimalisatie
async function suggestPricing(grid) {
    const products = grid.store.records.map(r => ({
        id: r.id,
        name: r.name,
        currentPrice: r.price,
        category: r.category,
        availability: r.availability
    }));

    const response = await fetch('/api/ai-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            products,
            prompt: 'Suggest optimal pricing based on market positioning and availability'
        })
    });

    const suggestions = await response.json();

    // Toon suggesties in dialog
    new Dialog({
        title: 'AI Pricing Suggestions',
        width: 600,
        items: suggestions.map(s => ({
            type: 'widget',
            html: `
                <div class="pricing-suggestion">
                    <strong>${s.productName}</strong>
                    <span>Current: $${s.currentPrice}</span>
                    <span>Suggested: $${s.suggestedPrice}</span>
                    <span>Reason: ${s.reason}</span>
                </div>
            `
        }))
    }).show();
}
```

---

## CSS Styling

```css
/* Badge column styling */
.b-badge-column .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    margin: 2px;
}

/* Product details grid */
.product-details-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
}

.detail-panel {
    background: var(--panel-bg);
    padding: 15px;
    border-radius: 8px;
}

.detail-panel strong {
    display: block;
    margin-top: 10px;
    color: var(--text-muted);
}

.product-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.out-of-stock {
    color: #dc3545;
    font-weight: bold;
}

/* AI filter field */
.b-aifilterfield {
    background: linear-gradient(90deg, #f8f9fa, #e9ecef);
}

.b-aifilterfield:focus-within {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5);
}
```

---

## Gerelateerde Documentatie

- [AI-REVIEW-WORKFLOW.md](./AI-REVIEW-WORKFLOW.md) - AI review system
- [AI-GRID-GENERATOR.md](./AI-GRID-GENERATOR.md) - AI code generation
- [GRID-DEEP-DIVE-COLUMNS.md](./GRID-DEEP-DIVE-COLUMNS.md) - Column configuratie
- [GRID-DEEP-DIVE-FEATURES.md](./GRID-DEEP-DIVE-FEATURES.md) - Features overzicht

---

*Gegenereerd op basis van Bryntum Grid 7.1.0 trial*
*Bron: examples/ai-ecommerce-grid/app.module.js*
