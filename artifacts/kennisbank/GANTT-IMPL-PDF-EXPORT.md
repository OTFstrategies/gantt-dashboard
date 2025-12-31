# Gantt Implementation: PDF Export

> **PDF Export** voor het exporteren van Gantt charts naar PDF formaat.

---

## Overzicht

Bryntum Gantt ondersteunt PDF export met timeline, dependencies en custom styling.

```
+--------------------------------------------------------------------------+
| GANTT                                        [📄 Export PDF] [⬇️ Download]|
+--------------------------------------------------------------------------+
|  Name              | Start       |        Timeline                       |
+--------------------------------------------------------------------------+
|  Project Alpha     | Jan 15      |  ████████████████████████████████████ |
|    Analysis        | Jan 15      |  ████████████                         |
|    Design          | Jan 22      |          ████████████████             |
|    Development     | Feb 01      |                    ██████████████████ |
+--------------------------------------------------------------------------+

                            ↓ Export to PDF ↓

+-- PDF Document --------------------------------------------------------+
|  [Logo]        PROJECT GANTT CHART           Date: Dec 27, 2024        |
+------------------------------------------------------------------------+
|  Name              | Start       |  Jan 15    Jan 22    Feb 01         |
+------------------------------------------------------------------------+
|  Project Alpha     | Jan 15      |  ████████████████████████████████   |
|    Analysis        | Jan 15      |  ████████                            |
|    Design          | Jan 22      |          ████████████                |
+------------------------------------------------------------------------+
|                    © 2024 Company Name                    Page 1/2     |
+------------------------------------------------------------------------+
```

---

## 1. Basic PDF Export Setup

### 1.1 Enable PDF Export

```javascript
import { Gantt, ProjectModel } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: { url: 'data/tasks.json' }
    }
});

const gantt = new Gantt({
    appendTo: 'container',
    project,

    features: {
        pdfExport: {
            // Export server URL
            exportServer: 'https://your-server.com/export',

            // Paper format
            paperFormat: 'A4',

            // Orientation
            orientation: 'landscape',

            // Schedule range
            scheduleRange: 'completeview'
        }
    },

    columns: [
        { type: 'name', width: 200 },
        { type: 'startdate' },
        { type: 'duration' }
    ],

    tbar: [
        {
            type: 'button',
            text: 'Export PDF',
            icon: 'b-fa b-fa-file-pdf',
            onClick() {
                gantt.features.pdfExport.showExportDialog();
            }
        }
    ]
});
```

---

## 2. Export Configuration

### 2.1 Export Options

```javascript
features: {
    pdfExport: {
        exportServer: 'https://your-server.com/export',

        // Paper settings
        paperFormat: 'A4',  // A3, A4, A5, Letter, Legal
        orientation: 'landscape',  // portrait, landscape

        // What to export
        scheduleRange: 'completeview',  // currentview, completeview, daterange

        // Date range (when scheduleRange is 'daterange')
        rangeStart: new Date('2024-01-01'),
        rangeEnd: new Date('2024-12-31'),

        // Columns to export
        exportColumns: true,

        // Rows per page
        rowsPerPage: 'auto',

        // File name
        fileName: 'gantt-export',

        // Keep rows together
        keepPathOnlyRegions: true,

        // Include dependencies
        exportDependencies: true
    }
}
```

### 2.2 Custom Header and Footer

```javascript
features: {
    pdfExport: {
        exportServer: 'https://your-server.com/export',

        // Header template
        headerTpl: ({ currentPage, totalPages }) => `
            <div style="display: flex; justify-content: space-between; padding: 15px 25px; border-bottom: 3px solid #1976d2;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="logo.png" height="40" />
                    <div>
                        <h1 style="margin: 0; font-size: 20px; color: #1976d2;">Project Timeline</h1>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Q1 2024 Schedule</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 12px;">Generated: ${new Date().toLocaleDateString()}</p>
                    <p style="margin: 4px 0 0; font-size: 12px;">Page ${currentPage} of ${totalPages}</p>
                </div>
            </div>
        `,

        // Footer template
        footerTpl: ({ currentPage, totalPages }) => `
            <div style="display: flex; justify-content: space-between; padding: 10px 25px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #666;">
                <span>Confidential - Internal Use Only</span>
                <span>© ${new Date().getFullYear()} Company Name</span>
            </div>
        `
    }
}
```

---

## 3. Export Methods

### 3.1 Programmatic Export

```javascript
// Show export dialog
gantt.features.pdfExport.showExportDialog();

// Export directly
async function exportToPDF() {
    try {
        const result = await gantt.features.pdfExport.export({
            paperFormat: 'A3',
            orientation: 'landscape',
            fileName: `gantt-${Date.now()}`,
            scheduleRange: 'completeview'
        });

        console.log('Export successful:', result);
    } catch (error) {
        console.error('Export failed:', error);
    }
}

// Export specific date range
async function exportDateRange(startDate, endDate) {
    await gantt.features.pdfExport.export({
        scheduleRange: 'daterange',
        rangeStart: startDate,
        rangeEnd: endDate,
        paperFormat: 'A4',
        orientation: 'landscape'
    });
}

// Export current view only
async function exportCurrentView() {
    await gantt.features.pdfExport.export({
        scheduleRange: 'currentview',
        paperFormat: 'A4',
        orientation: 'landscape'
    });
}
```

### 3.2 Export Events

```javascript
gantt.on({
    beforePdfExport({ config }) {
        console.log('Starting export with config:', config);

        // Modify config
        config.fileName = `project-${project.title}-${Date.now()}`;

        // Add watermark
        config.watermark = 'DRAFT';

        return true;  // Return false to cancel
    },

    pdfExport({ response }) {
        console.log('Export completed successfully');
        // Download automatically triggered
    },

    pdfExportFailed({ error }) {
        console.error('Export failed:', error);
        alert('PDF export failed. Please try again.');
    }
});
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { useRef, useMemo, useCallback, useState } from 'react';

function PDFExportGantt({ projectData }) {
    const ganttRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const handleExportDialog = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        gantt?.features.pdfExport?.showExportDialog();
    }, []);

    const handleQuickExport = useCallback(async (format) => {
        const gantt = ganttRef.current?.instance;
        if (!gantt) return;

        setIsExporting(true);
        setExportProgress(0);

        try {
            await gantt.features.pdfExport.export({
                paperFormat: format,
                orientation: 'landscape',
                scheduleRange: 'completeview',
                fileName: `project-export-${new Date().toISOString().split('T')[0]}`
            });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        features: {
            pdfExport: {
                exportServer: process.env.REACT_APP_EXPORT_SERVER,

                headerTpl: ({ currentPage, totalPages }) => `
                    <div class="pdf-header">
                        <h1>Project Timeline</h1>
                        <div class="page-info">Page ${currentPage}/${totalPages}</div>
                    </div>
                `,

                footerTpl: () => `
                    <div class="pdf-footer">
                        <span>Generated: ${new Date().toLocaleString()}</span>
                    </div>
                `,

                exportDependencies: true
            },

            dependencies: true
        },

        columns: [
            { type: 'wbs', width: 50 },
            { type: 'name', width: 200 },
            { type: 'startdate', width: 100 },
            { type: 'enddate', width: 100 },
            { type: 'duration', width: 80 }
        ],

        listeners: {
            beforePdfExport() {
                setIsExporting(true);
            },
            pdfExport() {
                setIsExporting(false);
            },
            pdfExportFailed() {
                setIsExporting(false);
            }
        }
    }), []);

    return (
        <div className="pdf-export-gantt">
            <div className="toolbar">
                <button onClick={handleExportDialog} disabled={isExporting}>
                    <i className="fa fa-file-pdf"></i>
                    Export Dialog
                </button>
                <div className="quick-export">
                    <span>Quick Export:</span>
                    <button onClick={() => handleQuickExport('A4')} disabled={isExporting}>
                        A4
                    </button>
                    <button onClick={() => handleQuickExport('A3')} disabled={isExporting}>
                        A3
                    </button>
                    <button onClick={() => handleQuickExport('Letter')} disabled={isExporting}>
                        Letter
                    </button>
                </div>
                {isExporting && (
                    <div className="export-status">
                        <span>Exporting...</span>
                    </div>
                )}
            </div>

            <BryntumGantt
                ref={ganttRef}
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 5. Export Server Setup

### 5.1 Server Requirements

```javascript
// Express.js + Puppeteer example
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '100mb' }));

app.post('/export', async (req, res) => {
    const {
        html,
        paperFormat = 'A4',
        orientation = 'landscape',
        fileName = 'export'
    } = req.body;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport for Gantt
        await page.setViewport({
            width: orientation === 'landscape' ? 1920 : 1080,
            height: orientation === 'landscape' ? 1080 : 1920
        });

        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Wait for Gantt to render
        await page.waitForSelector('.b-gantt', { timeout: 30000 });

        const pdf = await page.pdf({
            format: paperFormat,
            landscape: orientation === 'landscape',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '10mm',
                right: '10mm'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.send(pdf);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Export server running on port 3001');
});
```

---

## 6. Styling

```css
/* PDF header/footer styles (included in export) */
.pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 25px;
    border-bottom: 3px solid #1976d2;
    background: linear-gradient(to right, #e3f2fd, white);
}

.pdf-header h1 {
    margin: 0;
    font-size: 22px;
    color: #1976d2;
}

.pdf-header .page-info {
    font-size: 13px;
    color: #666;
}

.pdf-footer {
    display: flex;
    justify-content: center;
    padding: 10px 25px;
    border-top: 1px solid #e0e0e0;
    background: #fafafa;
    font-size: 11px;
    color: #666;
}

/* Print media queries */
@media print {
    /* Ensure colors print */
    .b-gantt-task-bar {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
    }

    /* Dependencies */
    .b-sch-dependency {
        print-color-adjust: exact !important;
    }

    /* Milestones */
    .b-gantt-task.b-milestone {
        print-color-adjust: exact !important;
    }

    /* Progress bar */
    .b-gantt-task-percent {
        print-color-adjust: exact !important;
    }

    /* Grid headers */
    .b-grid-header {
        background: #f5f5f5 !important;
        print-color-adjust: exact !important;
    }
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.quick-export {
    display: flex;
    align-items: center;
    gap: 8px;
}

.quick-export button {
    padding: 6px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.quick-export button:hover:not(:disabled) {
    background: #e3f2fd;
}

.export-status {
    margin-left: auto;
    padding: 6px 12px;
    background: #e3f2fd;
    border-radius: 4px;
    font-size: 13px;
    color: #1565c0;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Export mislukt | Server niet bereikbaar | Check exportServer URL |
| Dependencies missen | exportDependencies false | Enable exportDependencies |
| Lege pagina's | Content overflow | Adjust rowsPerPage |
| Kleuren missen | print-color-adjust | Add print CSS |
| Timeout | Grote dataset | Increase server timeout |

---

## API Reference

### PDF Export Config

| Property | Type | Description |
|----------|------|-------------|
| `exportServer` | String | Server URL for export |
| `paperFormat` | String | Paper size |
| `orientation` | String | portrait/landscape |
| `scheduleRange` | String | What to export |
| `rangeStart` | Date | Start date for daterange |
| `rangeEnd` | Date | End date for daterange |
| `headerTpl` | Function | Header template |
| `footerTpl` | Function | Footer template |
| `fileName` | String | Output file name |
| `exportDependencies` | Boolean | Include dependencies |
| `rowsPerPage` | Number/String | Rows per page |

### Schedule Range Options

| Value | Description |
|-------|-------------|
| `currentview` | Export visible area |
| `completeview` | Export all data |
| `daterange` | Export specific date range |

### Export Methods

| Method | Description |
|--------|-------------|
| `showExportDialog()` | Show export dialog |
| `export(config)` | Export directly |

### Events

| Event | Description |
|-------|-------------|
| `beforePdfExport` | Before export starts |
| `pdfExport` | Export completed |
| `pdfExportFailed` | Export failed |

---

## Bronnen

- **Feature**: `Gantt.feature.PdfExport`
- **Export Dialog**: `Gantt.widget.ExportDialog`

---

*Priority 2: Medium Priority Features*
