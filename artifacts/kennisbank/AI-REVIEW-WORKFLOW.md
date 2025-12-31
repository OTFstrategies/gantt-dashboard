# Bryntum AI Review Workflow

Dit document beschrijft de AI-powered review en approval workflow voor Bryntum Grid, inclusief automatische sentiment analyse, response generatie, en workflow automation.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Review Grid Implementatie](#review-grid-implementatie)
3. [AI Analyse Features](#ai-analyse-features)
4. [Response Generation](#response-generation)
5. [Workflow Automation](#workflow-automation)
6. [Backend Implementatie](#backend-implementatie)

---

## Overzicht

De AI Review Workflow demo toont hoe Bryntum Grid kan worden gecombineerd met AI voor het beheren van reviews, klantfeedback, en approval processen.

### Kern Functionaliteiten

```
┌────────────────────────────────────────────────────────────────┐
│                  AI Review Workflow                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Input Reviews                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │   │
│  │  │ Customer  │  │  Product  │  │    Raw Review     │    │   │
│  │  │   Info    │  │   Info    │  │      Text         │    │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AI Analysis Layer                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Sentiment   │  │   Entity     │  │   Intent     │   │   │
│  │  │  Analysis    │  │  Extraction  │  │  Detection   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Generated Output                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Response    │  │  Priority    │  │   Action     │   │   │
│  │  │  Draft       │  │  Score       │  │   Items      │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Review Grid Implementatie

### Restaurant Model

```
grid-7.1.0-trial/examples/ai-review-grid/app.module.js
```

```javascript
import { GridRowModel, StringHelper, Grid, Panel, Toast } from '@bryntum/grid';

// Review data model
class Restaurant extends GridRowModel {
    static fields = [
        { name: 'restaurant' },  // Restaurant naam
        { name: 'location' },    // Locatie
        { name: 'review' },      // Originele review tekst
        { name: 'response' },    // AI gegenereerde response
        { name: 'foodItem' },    // Geëxtraheerd food item
        { name: 'sentiment' },   // Sentiment analyse resultaat
        { name: 'notes' }        // Extra notities
    ];
}
```

### Complete Grid Configuratie

```javascript
const grid = new Grid({
    appendTo: 'container',
    flex: '1 1 100%',

    // FormulaProviders voor AI functionaliteit
    formulaProviders: {
        AI: {
            url: './php/formulaPrompt.php',
            body: {
                max_tokens: 100,
                temperature: 1  // Creatievere responses voor reviews
            },

            // Voeg global context toe aan elke prompt
            onFormulaChange(event) {
                event.formula = `${event.formula}. ${grid.settingsPanel.widgetMap.extra.value}`;
            },

            onFormulaNetworkError({ response }) {
                Toast.show({
                    html: `<h2>AI Network Error: ${response.statusText}</h2>
                           <code>${response.url}</code>
                           <p>Please ensure the server is running.</p>`,
                    timeout: 3000
                });
            }
        }
    },

    features: {
        sort: 'restaurant',
        cellEdit: {
            autoSelect: false,
            autoEdit: true
        },
        cellCopyPaste: true,
        rowCopyPaste: { useNativeClipboard: true },
        fillHandle: true  // Bulk AI generatie support
    },

    selectionMode: {
        cell: true,
        checkbox: true,
        dragSelect: true
    },

    columns: [
        {
            text: 'Restaurant',
            field: 'restaurant',
            readOnly: true,
            htmlEncode: false,
            width: 180,
            renderer({ record }) {
                return `${StringHelper.encodeHtml(record.restaurant)}<br>
                        <small><i class="fa fa-location-dot"></i>
                        ${StringHelper.encodeHtml(record.location)}</small>`;
            }
        },
        {
            text: 'Customer review',
            field: 'review',
            flex: 2,
            autoHeight: true
        },
        {
            // AI Response column
            formula: true,
            text: 'Response',
            field: 'response',
            flex: 2,
            tooltip: 'Try typing =AI(Write a nice response to the customer who left this review: $review)',
            autoHeight: true
        },
        {
            // AI Entity extraction
            formula: true,
            text: 'Food item',
            field: 'foodItem',
            tooltip: 'Try typing =AI(extract the food item from $review)',
            flex: 1
        },
        {
            // AI Sentiment analysis
            formula: true,
            text: 'Sentiment',
            field: 'sentiment',
            tooltip: 'Try typing =AI(Extract the sentiment from $review as one word)',
            flex: 1
        },
        {
            // Notes column met settings button
            formula: true,
            text: 'Notes',
            field: 'notes',
            flex: 1,
            headerWidgets: [{
                type: 'button',
                style: 'order:1',
                tooltip: 'Show settings panel',
                icon: 'fa fa-cog',
                rendition: 'text',
                onClick: 'up.onSettingsClick'
            }]
        }
    ],

    store: {
        modelClass: Restaurant,
        readUrl: 'data/data.json',
        autoLoad: true
    },

    // Settings panel voor AI configuratie
    onPaint({ firstPaint }) {
        if (firstPaint) {
            this.settingsPanel = new Panel({
                drawer: true,
                width: '37em',
                title: 'Settings',
                labelPosition: 'align-before',
                items: {
                    extra: {
                        type: 'textarea',
                        height: '15em',
                        label: 'Global Prompt Suffix',
                        value: `Please return the result using the language of ${this.localeManager.locale.localeCode}.

If message indicates just one word or number, character, image, or emoji is requested, return just *one* such item, and no extra text.`
                    },
                    temperature: {
                        type: 'slider',
                        label: 'Temperature',
                        min: 0,
                        max: 1,
                        value: 1,
                        step: 0.1,
                        onchange: 'up.onTemperatureChange'
                    }
                }
            });
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
    },

    // Reset functie voor demo herstart
    restart({ source }) {
        // Undo alle wijzigingen
        this.store.forEach(record => {
            record.set({
                response: null,
                foodItem: null,
                sentiment: null,
                notes: null
            });
        });
        this.store.commit();
        this.selectCell({ row: 0, column: 3 });
        source.up('hint').hintFlow.activeIndex = 0;
        this.columns.get('response').editor.fieldsList.widgetMap.fields.navigator.activeItem = null;
    }
});

// Disclaimer toast
setTimeout(() => {
    Toast.show({
        html: '<h3>Disclaimer</h3>' +
              '<p>AI generated content is dependent upon user input.</p>' +
              '<p>Bryntum is not responsible for the accuracy or reliability of AI-generated content.</p>',
        timeout: 10000
    });
}, 1000);
```

---

## AI Analyse Features

### Sentiment Analysis Service

```javascript
// lib/SentimentAnalyzer.js
class SentimentAnalyzer {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Analyseer sentiment van tekst
     */
    async analyze(text) {
        const response = await fetch(`${this.apiEndpoint}/sentiment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                prompt: `Analyze the sentiment of this text and return a single word:
                         Positive, Negative, Neutral, or Mixed.

                         Text: "${text}"`
            })
        });

        const result = await response.json();
        return {
            sentiment: result.content,
            confidence: result.confidence || 0.8
        };
    }

    /**
     * Batch analyse voor meerdere reviews
     */
    async batchAnalyze(texts) {
        const response = await fetch(`${this.apiEndpoint}/sentiment-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts,
                prompt: 'Analyze sentiment for each text, return array of sentiments'
            })
        });

        return response.json();
    }

    /**
     * Gedetailleerde sentiment breakdown
     */
    async detailedAnalysis(text) {
        const response = await fetch(`${this.apiEndpoint}/sentiment-detailed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                prompt: `Provide detailed sentiment analysis:
                         - Overall sentiment (positive/negative/neutral)
                         - Emotion (happy, angry, frustrated, satisfied, etc.)
                         - Urgency level (low/medium/high)
                         - Key phrases that indicate sentiment

                         Text: "${text}"`
            })
        });

        return response.json();
    }
}
```

### Entity Extraction

```javascript
// lib/EntityExtractor.js
class EntityExtractor {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Extraheer entiteiten uit review tekst
     */
    async extract(text, entityTypes = ['product', 'person', 'issue']) {
        const response = await fetch(`${this.apiEndpoint}/extract-entities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                entityTypes,
                prompt: `Extract the following types of entities from this text:
                         ${entityTypes.join(', ')}

                         Return JSON array of found entities.

                         Text: "${text}"`
            })
        });

        const result = await response.json();
        return {
            entities: result.entities || [],
            raw: result
        };
    }

    /**
     * Extraheer specifieke food items uit restaurant reviews
     */
    async extractFoodItems(text) {
        const response = await fetch(`${this.apiEndpoint}/extract-food`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                prompt: `Extract the main food item mentioned in this restaurant review.
                         Return just the food item name, nothing else.

                         Review: "${text}"`
            })
        });

        return response.json();
    }

    /**
     * Extraheer issues en klachten
     */
    async extractIssues(text) {
        const response = await fetch(`${this.apiEndpoint}/extract-issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                prompt: `Identify any issues, complaints, or problems mentioned in this review.
                         Return as JSON array of issues.

                         Review: "${text}"`
            })
        });

        return response.json();
    }
}
```

---

## Response Generation

### AI Response Generator

```javascript
// lib/ResponseGenerator.js
class ResponseGenerator {
    constructor(apiEndpoint, config = {}) {
        this.apiEndpoint = apiEndpoint;
        this.brandVoice = config.brandVoice || 'professional and friendly';
        this.templates = config.templates || {};
    }

    /**
     * Genereer response voor review
     */
    async generateResponse(review, options = {}) {
        const sentiment = options.sentiment || 'neutral';
        const template = this.getTemplate(sentiment);

        const response = await fetch(`${this.apiEndpoint}/generate-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                review,
                sentiment,
                template,
                brandVoice: this.brandVoice,
                prompt: `Generate a ${this.brandVoice} response to this customer review.

                         Review: "${review}"

                         Guidelines:
                         - Thank the customer for their feedback
                         - Address any specific concerns
                         - Be empathetic if negative
                         - Keep it concise (max 3 sentences)
                         ${sentiment === 'Negative' ? '- Offer to make things right' : ''}
                         ${sentiment === 'Positive' ? '- Express appreciation' : ''}`
            })
        });

        return response.json();
    }

    /**
     * Genereer bulk responses
     */
    async generateBulkResponses(reviews) {
        const responses = [];

        for (const review of reviews) {
            const response = await this.generateResponse(review.text, {
                sentiment: review.sentiment
            });
            responses.push({
                id: review.id,
                response: response.content
            });
        }

        return responses;
    }

    /**
     * Personaliseer response met klantdata
     */
    async personalizeResponse(review, customerData) {
        const response = await fetch(`${this.apiEndpoint}/personalize-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                review,
                customer: customerData,
                prompt: `Generate a personalized response for ${customerData.name || 'the customer'}.

                         Previous orders: ${customerData.orderCount || 'unknown'}
                         Customer since: ${customerData.memberSince || 'unknown'}

                         Review: "${review}"

                         Make the response personal and acknowledge their loyalty if applicable.`
            })
        });

        return response.json();
    }

    getTemplate(sentiment) {
        const templates = {
            Positive: 'Thank you for your wonderful feedback! We are thrilled...',
            Negative: 'We sincerely apologize for your experience. We would like to...',
            Neutral: 'Thank you for taking the time to share your feedback...',
            Mixed: 'Thank you for your honest feedback. We appreciate...'
        };

        return this.templates[sentiment] || templates[sentiment] || templates.Neutral;
    }
}
```

### Response Templates UI

```javascript
// components/ResponseTemplateEditor.js
class ResponseTemplateEditor extends Panel {
    static type = 'responsetemplates';

    static configurable = {
        title: 'Response Templates',
        collapsible: true,

        items: {
            positiveTemplate: {
                type: 'textarea',
                label: 'Positive Response Template',
                height: 100
            },
            negativeTemplate: {
                type: 'textarea',
                label: 'Negative Response Template',
                height: 100
            },
            neutralTemplate: {
                type: 'textarea',
                label: 'Neutral Response Template',
                height: 100
            },
            brandVoice: {
                type: 'combo',
                label: 'Brand Voice',
                items: [
                    { value: 'professional', text: 'Professional' },
                    { value: 'friendly', text: 'Friendly' },
                    { value: 'formal', text: 'Formal' },
                    { value: 'casual', text: 'Casual' }
                ]
            }
        }
    };

    getConfig() {
        const { widgetMap } = this;
        return {
            templates: {
                Positive: widgetMap.positiveTemplate.value,
                Negative: widgetMap.negativeTemplate.value,
                Neutral: widgetMap.neutralTemplate.value
            },
            brandVoice: widgetMap.brandVoice.value
        };
    }
}
```

---

## Workflow Automation

### Review Workflow Manager

```javascript
// lib/ReviewWorkflowManager.js
class ReviewWorkflowManager {
    constructor(grid, config = {}) {
        this.grid = grid;
        this.apiEndpoint = config.apiEndpoint;
        this.autoProcess = config.autoProcess || false;

        this.sentimentAnalyzer = new SentimentAnalyzer(this.apiEndpoint);
        this.entityExtractor = new EntityExtractor(this.apiEndpoint);
        this.responseGenerator = new ResponseGenerator(this.apiEndpoint, {
            brandVoice: config.brandVoice
        });

        if (this.autoProcess) {
            this.setupAutoProcessing();
        }
    }

    setupAutoProcessing() {
        this.grid.store.on({
            add: ({ records }) => this.processNewRecords(records),
            thisObj: this
        });
    }

    /**
     * Process nieuwe review records
     */
    async processNewRecords(records) {
        for (const record of records) {
            if (record.review && !record.sentiment) {
                await this.processReview(record);
            }
        }
    }

    /**
     * Process een enkele review
     */
    async processReview(record) {
        const review = record.review;

        try {
            // Stap 1: Sentiment analyse
            const sentimentResult = await this.sentimentAnalyzer.analyze(review);
            record.sentiment = sentimentResult.sentiment;

            // Stap 2: Entity extraction
            const entities = await this.entityExtractor.extractFoodItems(review);
            record.foodItem = entities.content;

            // Stap 3: Response generatie
            const response = await this.responseGenerator.generateResponse(
                review,
                { sentiment: sentimentResult.sentiment }
            );
            record.response = response.content;

            this.grid.store.commit();
        } catch (error) {
            console.error('Error processing review:', error);
            Toast.show({
                html: `Error processing review: ${error.message}`,
                color: 'error'
            });
        }
    }

    /**
     * Batch process alle unprocessed reviews
     */
    async processAllPending() {
        const pendingRecords = this.grid.store.records.filter(
            r => r.review && !r.sentiment
        );

        this.grid.mask(`Processing ${pendingRecords.length} reviews...`);

        try {
            for (const record of pendingRecords) {
                await this.processReview(record);
            }

            Toast.show({
                html: `Processed ${pendingRecords.length} reviews`,
                color: 'success'
            });
        } finally {
            this.grid.unmask();
        }
    }

    /**
     * Escalate negative reviews
     */
    async escalateNegativeReviews() {
        const negativeReviews = this.grid.store.records.filter(
            r => r.sentiment === 'Negative'
        );

        // Stuur naar escalation queue
        const response = await fetch(`${this.apiEndpoint}/escalate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviews: negativeReviews.map(r => ({
                    id: r.id,
                    review: r.review,
                    restaurant: r.restaurant
                }))
            })
        });

        return response.json();
    }
}
```

### Approval Workflow

```javascript
// lib/ApprovalWorkflow.js
class ApprovalWorkflow {
    constructor(grid) {
        this.grid = grid;
        this.pendingApprovals = new Map();
    }

    /**
     * Submit response voor approval
     */
    submitForApproval(record) {
        const approval = {
            id: record.id,
            response: record.response,
            submittedAt: new Date(),
            status: 'pending'
        };

        this.pendingApprovals.set(record.id, approval);

        // Update UI
        record.set('approvalStatus', 'pending');

        this.notifyReviewers(approval);

        return approval;
    }

    /**
     * Approve response
     */
    approve(recordId, approver) {
        const approval = this.pendingApprovals.get(recordId);
        if (!approval) return null;

        approval.status = 'approved';
        approval.approvedBy = approver;
        approval.approvedAt = new Date();

        const record = this.grid.store.getById(recordId);
        if (record) {
            record.set('approvalStatus', 'approved');
        }

        return approval;
    }

    /**
     * Reject response
     */
    reject(recordId, reason) {
        const approval = this.pendingApprovals.get(recordId);
        if (!approval) return null;

        approval.status = 'rejected';
        approval.rejectedAt = new Date();
        approval.rejectionReason = reason;

        const record = this.grid.store.getById(recordId);
        if (record) {
            record.set('approvalStatus', 'rejected');
        }

        return approval;
    }

    notifyReviewers(approval) {
        // Webhook of notification naar reviewers
        console.log('Notifying reviewers of pending approval:', approval);
    }
}
```

---

## Backend Implementatie

### Node.js Review Service

```javascript
// server/ai-review.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sentiment analysis endpoint
app.post('/api/ai-review/sentiment', async (req, res) => {
    const { text, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 10
        });

        res.json({
            content: response.choices[0].message.content.trim(),
            confidence: 0.9
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Response generation endpoint
app.post('/api/ai-review/generate-response', async (req, res) => {
    const { review, sentiment, brandVoice, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a customer service representative with a ${brandVoice} tone.`
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        res.json({
            content: response.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Entity extraction endpoint
app.post('/api/ai-review/extract-entities', async (req, res) => {
    const { text, entityTypes, prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
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

- [AI-GRID-ECOMMERCE.md](./AI-GRID-ECOMMERCE.md) - E-commerce AI patterns
- [AI-PROJECT-SUMMARY.md](./AI-PROJECT-SUMMARY.md) - Project summaries
- [GRID-DEEP-DIVE-COLUMNS.md](./GRID-DEEP-DIVE-COLUMNS.md) - Column configuratie

---

*Gegenereerd op basis van Bryntum Grid 7.1.0 trial*
*Bron: examples/ai-review-grid/app.module.js*
