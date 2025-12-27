# Bryntum AI Project Summary

Dit document beschrijft de AI-powered analytics en project summary functionaliteit voor Bryntum Grid, inclusief automatische insights generation en rapportage.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Analytics Engine](#analytics-engine)
3. [Insights Generation](#insights-generation)
4. [Summary Widgets](#summary-widgets)
5. [Backend Implementatie](#backend-implementatie)
6. [Use Cases](#use-cases)

---

## Overzicht

De AI Project Summary feature genereert automatisch samenvattingen en inzichten uit grid data, waardoor gebruikers snel overzicht krijgen van belangrijke trends en anomalieën.

### Architectuur

```
┌────────────────────────────────────────────────────────────────┐
│                 AI Project Summary                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Grid Data                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │ Records  │  │ Metrics  │  │ Trends   │               │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘               │   │
│  └───────┼─────────────┼─────────────┼─────────────────────┘   │
│          │             │             │                          │
│          ▼             ▼             ▼                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Aggregation Layer                      │   │
│  │  • Calculate statistics                                  │   │
│  │  • Identify patterns                                     │   │
│  │  • Detect anomalies                                      │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AI Summary Generator                        │   │
│  │  • Natural language summaries                            │   │
│  │  • Key insights extraction                               │   │
│  │  • Recommendations                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Analytics Engine

### Data Collector

```javascript
// lib/AIProjectAnalytics.js
class AIProjectAnalytics {
    constructor(grid, config = {}) {
        this.grid = grid;
        this.apiEndpoint = config.apiEndpoint || '/api/ai-summary';
        this.metricsConfig = config.metrics || {};
    }

    /**
     * Verzamel statistieken uit grid data
     */
    collectStatistics() {
        const { store } = this.grid;
        const records = store.records;

        const stats = {
            totalRecords: records.length,
            columns: {},
            overall: {}
        };

        // Analyseer elke kolom
        this.grid.columns.records.forEach(column => {
            if (column.field) {
                stats.columns[column.field] = this.analyzeColumn(records, column);
            }
        });

        // Overall metrics
        stats.overall = this.calculateOverallMetrics(records);

        return stats;
    }

    analyzeColumn(records, column) {
        const values = records.map(r => r.get(column.field)).filter(v => v != null);
        const type = this.detectColumnType(values);

        const analysis = {
            type,
            count: values.length,
            nullCount: records.length - values.length
        };

        if (type === 'number') {
            analysis.min = Math.min(...values);
            analysis.max = Math.max(...values);
            analysis.sum = values.reduce((a, b) => a + b, 0);
            analysis.avg = analysis.sum / values.length;
            analysis.median = this.calculateMedian(values);
        } else if (type === 'string') {
            const uniqueValues = [...new Set(values)];
            analysis.uniqueCount = uniqueValues.length;
            analysis.topValues = this.getTopValues(values, 5);
        } else if (type === 'date') {
            const dates = values.map(v => new Date(v).getTime());
            analysis.minDate = new Date(Math.min(...dates));
            analysis.maxDate = new Date(Math.max(...dates));
            analysis.range = analysis.maxDate - analysis.minDate;
        } else if (type === 'boolean') {
            analysis.trueCount = values.filter(v => v === true).length;
            analysis.falseCount = values.filter(v => v === false).length;
            analysis.truePercentage = (analysis.trueCount / values.length) * 100;
        }

        return analysis;
    }

    detectColumnType(values) {
        if (values.length === 0) return 'unknown';

        const sample = values[0];

        if (typeof sample === 'number') return 'number';
        if (typeof sample === 'boolean') return 'boolean';
        if (sample instanceof Date) return 'date';
        if (typeof sample === 'string') {
            // Check of het een date string is
            if (!isNaN(Date.parse(sample))) return 'date';
            return 'string';
        }

        return 'unknown';
    }

    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    getTopValues(values, limit) {
        const frequency = {};
        values.forEach(v => {
            frequency[v] = (frequency[v] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([value, count]) => ({ value, count }));
    }

    calculateOverallMetrics(records) {
        // Custom metrics gebaseerd op configuratie
        const metrics = {};

        if (this.metricsConfig.totalValue) {
            const { field } = this.metricsConfig.totalValue;
            metrics.totalValue = records.reduce(
                (sum, r) => sum + (r.get(field) || 0), 0
            );
        }

        if (this.metricsConfig.completionRate) {
            const { field, completedValue } = this.metricsConfig.completionRate;
            const completed = records.filter(
                r => r.get(field) === completedValue
            ).length;
            metrics.completionRate = (completed / records.length) * 100;
        }

        return metrics;
    }

    /**
     * Detecteer anomalieën in data
     */
    detectAnomalies() {
        const anomalies = [];
        const { store } = this.grid;
        const records = store.records;

        // Check voor numerieke outliers
        this.grid.columns.records.forEach(column => {
            if (column.type === 'number' || column.type === 'numberfield') {
                const values = records.map(r => r.get(column.field)).filter(v => v != null);
                const outliers = this.findOutliers(values);

                if (outliers.length > 0) {
                    anomalies.push({
                        type: 'outlier',
                        column: column.field,
                        values: outliers,
                        message: `${outliers.length} outlier value(s) detected in ${column.text}`
                    });
                }
            }
        });

        return anomalies;
    }

    findOutliers(values) {
        if (values.length < 4) return [];

        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        return values.filter(v => v < lowerBound || v > upperBound);
    }

    /**
     * Identificeer trends
     */
    identifyTrends() {
        const trends = [];
        const { store } = this.grid;

        // Check voor chronologische trends
        const dateColumns = this.grid.columns.records.filter(
            c => c.type === 'date'
        );

        dateColumns.forEach(dateCol => {
            const numericColumns = this.grid.columns.records.filter(
                c => c.type === 'number'
            );

            numericColumns.forEach(numCol => {
                const data = store.records
                    .map(r => ({
                        date: new Date(r.get(dateCol.field)),
                        value: r.get(numCol.field)
                    }))
                    .filter(d => d.date && d.value != null)
                    .sort((a, b) => a.date - b.date);

                if (data.length >= 3) {
                    const trend = this.calculateTrend(data.map(d => d.value));
                    if (Math.abs(trend) > 0.1) {
                        trends.push({
                            column: numCol.field,
                            direction: trend > 0 ? 'increasing' : 'decreasing',
                            strength: Math.abs(trend),
                            message: `${numCol.text} shows ${trend > 0 ? 'upward' : 'downward'} trend over time`
                        });
                    }
                }
            });
        });

        return trends;
    }

    calculateTrend(values) {
        // Simple linear regression slope
        const n = values.length;
        const xSum = (n * (n - 1)) / 2;
        const ySum = values.reduce((a, b) => a + b, 0);
        const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
        const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        return slope;
    }
}
```

---

## Insights Generation

### AI Summary Generator

```javascript
// lib/AISummaryGenerator.js
class AISummaryGenerator {
    constructor(analytics, config = {}) {
        this.analytics = analytics;
        this.apiEndpoint = config.apiEndpoint || '/api/ai-summary';
    }

    /**
     * Genereer complete project summary
     */
    async generateSummary(options = {}) {
        // Verzamel alle data
        const statistics = this.analytics.collectStatistics();
        const anomalies = this.analytics.detectAnomalies();
        const trends = this.analytics.identifyTrends();

        // Stuur naar AI voor natuurlijke taal samenvatting
        const response = await fetch(`${this.apiEndpoint}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                statistics,
                anomalies,
                trends,
                options,
                prompt: this.buildSummaryPrompt(options)
            })
        });

        const result = await response.json();

        return {
            summary: result.summary,
            keyInsights: result.keyInsights,
            recommendations: result.recommendations,
            statistics,
            anomalies,
            trends
        };
    }

    buildSummaryPrompt(options) {
        return `
            Generate a ${options.style || 'professional'} project summary based on the provided data.

            Include:
            1. Executive summary (2-3 sentences)
            2. Key metrics highlights
            3. Notable patterns or trends
            4. Any concerns or anomalies
            5. Recommendations for action

            Style: ${options.style || 'professional'}
            Audience: ${options.audience || 'management'}
            Focus areas: ${options.focusAreas?.join(', ') || 'all aspects'}
        `;
    }

    /**
     * Genereer specifieke insights
     */
    async generateInsight(topic) {
        const statistics = this.analytics.collectStatistics();

        const response = await fetch(`${this.apiEndpoint}/insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                statistics,
                topic,
                prompt: `Generate a specific insight about: ${topic}`
            })
        });

        return response.json();
    }

    /**
     * Genereer vergelijkende analyse
     */
    async compareDatasets(currentData, previousData) {
        const response = await fetch(`${this.apiEndpoint}/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current: currentData,
                previous: previousData,
                prompt: 'Compare these two datasets and highlight significant changes'
            })
        });

        return response.json();
    }
}
```

---

## Summary Widgets

### Summary Panel Component

```javascript
// components/ProjectSummaryPanel.js
import { Panel, Toast } from '@bryntum/grid';

class ProjectSummaryPanel extends Panel {
    static type = 'projectsummarypanel';

    static configurable = {
        title: 'Project Summary',
        collapsible: true,
        width: 400,

        tools: {
            refresh: {
                icon: 'b-fa b-fa-sync',
                tooltip: 'Refresh summary',
                onClick: 'up.refreshSummary'
            },
            export: {
                icon: 'b-fa b-fa-download',
                tooltip: 'Export summary',
                onClick: 'up.exportSummary'
            }
        },

        items: {
            summaryContainer: {
                type: 'container',
                ref: 'summary'
            },
            insightsContainer: {
                type: 'container',
                ref: 'insights'
            },
            metricsContainer: {
                type: 'container',
                ref: 'metrics',
                layout: 'hbox'
            }
        }
    };

    async refreshSummary() {
        if (!this.grid) return;

        this.mask('Generating summary...');

        try {
            const analytics = new AIProjectAnalytics(this.grid);
            const generator = new AISummaryGenerator(analytics);

            const result = await generator.generateSummary({
                style: 'executive',
                audience: 'management'
            });

            this.displaySummary(result);
        } catch (error) {
            Toast.show({ html: `Error: ${error.message}`, color: 'error' });
        } finally {
            this.unmask();
        }
    }

    displaySummary(result) {
        // Summary text
        this.widgetMap.summary.html = `
            <div class="summary-text">
                <h3>Executive Summary</h3>
                <p>${result.summary}</p>
            </div>
        `;

        // Key insights
        this.widgetMap.insights.html = `
            <div class="insights-list">
                <h3>Key Insights</h3>
                <ul>
                    ${result.keyInsights.map(insight => `
                        <li class="insight-item ${insight.type}">
                            <i class="b-fa ${this.getInsightIcon(insight.type)}"></i>
                            ${insight.text}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Metrics cards
        this.widgetMap.metrics.html = `
            <div class="metrics-grid">
                ${Object.entries(result.statistics.overall).map(([key, value]) => `
                    <div class="metric-card">
                        <span class="metric-value">${this.formatMetricValue(value)}</span>
                        <span class="metric-label">${this.formatMetricLabel(key)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getInsightIcon(type) {
        const icons = {
            positive: 'b-fa-arrow-up text-success',
            negative: 'b-fa-arrow-down text-danger',
            warning: 'b-fa-exclamation-triangle text-warning',
            info: 'b-fa-info-circle text-info'
        };
        return icons[type] || icons.info;
    }

    formatMetricValue(value) {
        if (typeof value === 'number') {
            return value >= 1000
                ? (value / 1000).toFixed(1) + 'K'
                : value.toFixed(1);
        }
        return value;
    }

    formatMetricLabel(key) {
        return key.replace(/([A-Z])/g, ' $1').trim();
    }

    exportSummary() {
        // Export als PDF of Word document
        window.print();
    }
}

ProjectSummaryPanel.initClass();
```

### Quick Stats Widget

```javascript
// components/QuickStatsWidget.js
class QuickStatsWidget extends Panel {
    static type = 'quickstats';

    static configurable = {
        layout: 'hbox',
        cls: 'quick-stats-widget'
    };

    updateFromGrid(grid) {
        const analytics = new AIProjectAnalytics(grid);
        const stats = analytics.collectStatistics();

        this.items = this.buildStatsCards(stats);
    }

    buildStatsCards(stats) {
        return [
            {
                type: 'widget',
                cls: 'stat-card',
                html: `
                    <div class="stat-value">${stats.totalRecords}</div>
                    <div class="stat-label">Total Records</div>
                `
            },
            // Voeg meer stats toe gebaseerd op data
            ...Object.entries(stats.overall).map(([key, value]) => ({
                type: 'widget',
                cls: 'stat-card',
                html: `
                    <div class="stat-value">${this.formatValue(value)}</div>
                    <div class="stat-label">${key}</div>
                `
            }))
        ];
    }

    formatValue(value) {
        if (typeof value === 'number') {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value.toFixed(value % 1 === 0 ? 0 : 2);
        }
        return value;
    }
}
```

---

## Backend Implementatie

### Node.js Summary Service

```javascript
// server/ai-summary.js
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai-summary/generate', async (req, res) => {
    const { statistics, anomalies, trends, options, prompt } = req.body;

    const systemPrompt = `
        You are a data analyst generating project summaries.

        Analyze the provided statistics and generate:
        1. A clear executive summary
        2. Key insights as an array
        3. Actionable recommendations

        Be concise and focus on actionable information.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `
                        Statistics: ${JSON.stringify(statistics)}
                        Anomalies: ${JSON.stringify(anomalies)}
                        Trends: ${JSON.stringify(trends)}

                        ${prompt}

                        Return JSON:
                        {
                            "summary": "Executive summary text",
                            "keyInsights": [
                                { "type": "positive|negative|warning|info", "text": "insight" }
                            ],
                            "recommendations": ["recommendation 1", "recommendation 2"]
                        }
                    `
                }
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

---

## Use Cases

### Use Case 1: Daily Project Dashboard

```javascript
// Dagelijkse project summary
async function showDailyDashboard(grid) {
    const panel = new ProjectSummaryPanel({
        appendTo: 'sidebar',
        grid,
        title: 'Daily Summary'
    });

    await panel.refreshSummary();
}
```

### Use Case 2: Automated Reporting

```javascript
// Genereer wekelijks rapport
async function generateWeeklyReport(grid) {
    const analytics = new AIProjectAnalytics(grid);
    const generator = new AISummaryGenerator(analytics);

    const report = await generator.generateSummary({
        style: 'detailed',
        audience: 'stakeholders',
        focusAreas: ['performance', 'issues', 'progress']
    });

    // Export als PDF
    exportToPDF(report);
}
```

---

## Gerelateerde Documentatie

- [AI-GRID-ECOMMERCE.md](./AI-GRID-ECOMMERCE.md) - E-commerce AI patterns
- [AI-REVIEW-WORKFLOW.md](./AI-REVIEW-WORKFLOW.md) - Review workflows
- [GRID-DEEP-DIVE-FEATURES.md](./GRID-DEEP-DIVE-FEATURES.md) - Features overzicht

---

*Gegenereerd op basis van Bryntum Grid 7.1.0 trial*
*Bron: examples/ai-project-summary/*
