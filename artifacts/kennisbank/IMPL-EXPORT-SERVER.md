# IMPL: Export Server & Document Generation

> **Implementation Guide** - Hoe Bryntum's export functionaliteit werkt.

---

## Overzicht

Bryntum biedt meerdere export mogelijkheden:

```
Export Types:
┌─────────────────────────────────────────────────────────────┐
│ 1. PDF Export      - Server-side rendering (puppeteer)      │
│ 2. Print           - Browser print dialog                   │
│ 3. Excel Export    - Client-side XLSX/CSV generation        │
│ 4. MSP Export      - Microsoft Project XML format           │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. PDF Export

### 1.1 Feature Configuratie

```javascript
const gantt = new Gantt({
    features: {
        pdfExport: {
            // Server URL voor PDF generatie
            exportServer: 'http://localhost:8080/',

            // Vertaal relatieve URLs naar absolute
            translateURLsToAbsolute: 'http://localhost:8080/resources/',

            // Download direct als binary (vs URL)
            sendAsBinary: true,

            // Header template
            headerTpl: ({ currentPage, totalPages }) => `
                <img src="logo.svg" alt="Logo"/>
                <span>Page ${currentPage + 1} of ${totalPages}</span>
            `,

            // Footer template
            footerTpl: () => `
                <span>© ${new Date().getFullYear()} Company</span>
            `,

            // Filter styles (remove unwanted CSS)
            filterStyles: styles => styles.filter(style =>
                !style.match(/monaco/)  // Remove monaco editor styles
            )
        }
    }
});
```

### 1.2 Export Dialog

```javascript
// Show built-in export dialog
gantt.features.pdfExport.showExportDialog();

// Or export directly with options
await gantt.features.pdfExport.export({
    // Paper size
    paperFormat: 'A4',  // 'A3', 'A4', 'A5', 'Legal', 'Letter'

    // Orientation
    orientation: 'landscape',  // 'portrait', 'landscape'

    // Schedule range
    scheduleRange: 'completeview',  // 'currentview', 'daterange', 'completeview'

    // For 'daterange':
    rangeStart: new Date('2024-01-01'),
    rangeEnd: new Date('2024-12-31'),

    // Rows to export
    rowsRange: 'all',  // 'all', 'visible'

    // Filename
    fileName: 'gantt-export.pdf'
});
```

### 1.3 Export Server Setup

```bash
# Clone Bryntum export server
git clone https://github.com/nickvbryntum/bryntum-pdf-export-server

cd bryntum-pdf-export-server
npm install
npm start
```

### 1.4 Server Request Format

```javascript
// POST naar exportServer
{
    // HTML content to render
    html: '<html>...</html>',

    // Paper configuration
    format: 'A4',
    orientation: 'landscape',

    // Margins (in pixels)
    margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    },

    // Filename for download
    fileName: 'export.pdf',

    // Return as binary (vs URL)
    sendAsBinary: true
}
```

### 1.5 Server Response

```javascript
// Als sendAsBinary: true
// Response: Binary PDF data

// Als sendAsBinary: false
{
    success: true,
    url: '/exports/export-12345.pdf'
}
```

### 1.6 WebSocket Support

```javascript
const gantt = new Gantt({
    features: {
        pdfExport: {
            exportServer: 'http://localhost:8080/',
            // Enable WebSocket for progress updates
            webSocketAvailable: true
        }
    }
});

// Progress events
gantt.features.pdfExport.on({
    exportStart() {
        console.log('Export started');
    },
    exportProgress({ progress }) {
        console.log(`Progress: ${progress}%`);
    },
    exportComplete({ response }) {
        console.log('Export complete:', response.url);
    }
});
```

---

## 2. Print Feature

### 2.1 Configuratie

```javascript
const gantt = new Gantt({
    features: {
        print: {
            // Header/Footer templates
            headerTpl: ({ currentPage, totalPages }) => `
                <div class="print-header">
                    <span>Project Timeline</span>
                    <span>Page ${currentPage + 1}/${totalPages}</span>
                </div>
            `,
            footerTpl: () => `
                <div class="print-footer">
                    Printed on ${new Date().toLocaleDateString()}
                </div>
            `,

            // Filter styles
            filterStyles: styles => styles.filter(s => !s.includes('monaco'))
        }
    }
});
```

### 2.2 Print Dialog

```javascript
// Show print dialog
gantt.features.print.showPrintDialog();

// Or print directly
await gantt.features.print.print({
    paperFormat: 'A4',
    orientation: 'landscape'
});
```

### 2.3 Print CSS

```css
@media print {
    /* Hide non-printable elements */
    .b-toolbar,
    .b-button {
        display: none !important;
    }

    /* Ensure colors print */
    .b-gantt-task {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    /* Page breaks */
    .b-grid-row {
        page-break-inside: avoid;
    }
}
```

---

## 3. Excel Export

### 3.1 Feature Setup

```javascript
import { WriteExcelFileProvider, Gantt } from '@bryntum/gantt';

const gantt = new Gantt({
    features: {
        excelExporter: {
            // Third-party library for XLSX generation
            xlsProvider: WriteExcelFileProvider,

            // Date format for date fields
            dateFormat: 'YYYY-MM-DD'
        }
    }
});
```

### 3.2 Export Methods

```javascript
// Export to XLSX
gantt.features.excelExporter.export({
    filename: 'project-tasks'
    // Extension .xlsx added automatically
});

// Export to CSV
gantt.features.excelExporter.export({
    filename: 'project-tasks',
    csv: {
        delimiter: ','  // or ';' for European locales
    }
});
```

### 3.3 Export Config

```javascript
gantt.features.excelExporter.export({
    filename: 'export',

    // Columns to export (default: all visible)
    columns: [
        { field: 'name', text: 'Task Name' },
        { field: 'startDate', text: 'Start' },
        { field: 'endDate', text: 'End' },
        { field: 'duration', text: 'Duration' }
    ],

    // Rows to export
    rows: gantt.taskStore.query(t => t.percentDone < 100),

    // Excel-specific options
    exporterConfig: {
        // Cell styles
        defaultColumnWidth: 15
    }
});
```

### 3.4 Events

```javascript
gantt.on({
    beforeExcelExport({ config }) {
        // Modify export config before export
        config.filename = `export-${Date.now()}`;
    },

    excelExportComplete({ data }) {
        console.log('Excel export complete');
    }
});
```

---

## 4. Microsoft Project Export

### 4.1 Feature Setup

```javascript
const gantt = new Gantt({
    features: {
        mspExport: true  // Enable MS Project export
    }
});
```

### 4.2 Export Method

```javascript
// Export to MSP XML format
gantt.features.mspExport.export({
    filename: 'project.xml'
});
```

### 4.3 Data Collected Event

```javascript
gantt.features.mspExport.on({
    dataCollected({ data }) {
        // Modify data before XML generation
        data.tasks.forEach(task => {
            // Add custom field
            task.customField = 'value';
        });
    }
});
```

### 4.4 XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
    <Name>Project Name</Name>
    <StartDate>2024-01-01T00:00:00</StartDate>
    <Tasks>
        <Task>
            <UID>1</UID>
            <Name>Task 1</Name>
            <Start>2024-01-01T08:00:00</Start>
            <Finish>2024-01-05T17:00:00</Finish>
            <Duration>PT40H0M0S</Duration>
            <PercentComplete>0</PercentComplete>
        </Task>
    </Tasks>
    <Resources>
        <Resource>
            <UID>1</UID>
            <Name>John Doe</Name>
        </Resource>
    </Resources>
    <Assignments>
        <Assignment>
            <TaskUID>1</TaskUID>
            <ResourceUID>1</ResourceUID>
            <Units>1</Units>
        </Assignment>
    </Assignments>
</Project>
```

---

## 5. Eigen Implementatie

### 5.1 PDF Export Server (Node.js + Puppeteer)

```typescript
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

interface ExportRequest {
    html: string;
    format: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    fileName: string;
    sendAsBinary: boolean;
}

app.post('/export', async (req, res) => {
    const {
        html,
        format = 'A4',
        orientation = 'portrait',
        margins = { top: 50, right: 50, bottom: 50, left: 50 },
        fileName = 'export.pdf',
        sendAsBinary = true
    }: ExportRequest = req.body;

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        // Generate PDF
        const pdf = await page.pdf({
            format,
            landscape: orientation === 'landscape',
            margin: {
                top: `${margins.top}px`,
                right: `${margins.right}px`,
                bottom: `${margins.bottom}px`,
                left: `${margins.left}px`
            },
            printBackground: true
        });

        if (sendAsBinary) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(pdf);
        } else {
            // Save to file and return URL
            const filePath = `/exports/${Date.now()}-${fileName}`;
            // fs.writeFileSync(filePath, pdf);
            res.json({ success: true, url: filePath });
        }
    } finally {
        await browser.close();
    }
});

app.listen(8080, () => {
    console.log('Export server running on port 8080');
});
```

### 5.2 Excel Export (Client-side)

```typescript
interface ExcelExportConfig {
    filename: string;
    columns: { field: string; text: string; width?: number }[];
    data: any[];
}

class SimpleExcelExporter {
    async export(config: ExcelExportConfig): Promise<void> {
        const { filename, columns, data } = config;

        // Build CSV content
        const header = columns.map(c => this.escapeCSV(c.text)).join(',');
        const rows = data.map(row =>
            columns.map(c => this.escapeCSV(row[c.field])).join(',')
        );

        const csv = [header, ...rows].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();

        URL.revokeObjectURL(url);
    }

    private escapeCSV(value: any): string {
        if (value == null) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}

// For XLSX, use a library like SheetJS or write-excel-file
import writeXlsxFile from 'write-excel-file';

class XLSXExporter {
    async export(config: ExcelExportConfig): Promise<void> {
        const { filename, columns, data } = config;

        // Header row
        const headerRow = columns.map(c => ({
            value: c.text,
            fontWeight: 'bold'
        }));

        // Data rows
        const dataRows = data.map(row =>
            columns.map(c => ({
                value: row[c.field],
                type: this.getType(row[c.field])
            }))
        );

        const sheet = [headerRow, ...dataRows];

        await writeXlsxFile(sheet, {
            fileName: `${filename}.xlsx`
        });
    }

    private getType(value: any): string {
        if (value instanceof Date) return 'Date';
        if (typeof value === 'number') return 'Number';
        return 'String';
    }
}
```

### 5.3 MSP XML Generator

```typescript
interface Task {
    id: string | number;
    name: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    percentDone: number;
    parentId?: string | number;
}

interface Resource {
    id: string | number;
    name: string;
}

interface Assignment {
    taskId: string | number;
    resourceId: string | number;
    units: number;
}

class MSPExporter {
    export(
        tasks: Task[],
        resources: Resource[],
        assignments: Assignment[],
        projectName: string
    ): string {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
    <Name>${this.escape(projectName)}</Name>
    <StartDate>${tasks[0]?.startDate.toISOString() || ''}</StartDate>
    <Tasks>
${tasks.map((t, i) => this.taskToXML(t, i + 1)).join('\n')}
    </Tasks>
    <Resources>
${resources.map((r, i) => this.resourceToXML(r, i + 1)).join('\n')}
    </Resources>
    <Assignments>
${assignments.map((a, i) => this.assignmentToXML(a, i + 1, tasks, resources)).join('\n')}
    </Assignments>
</Project>`;

        return xml;
    }

    private taskToXML(task: Task, uid: number): string {
        const duration = this.toDuration(task.duration);
        return `        <Task>
            <UID>${uid}</UID>
            <ID>${uid}</ID>
            <Name>${this.escape(task.name)}</Name>
            <Start>${task.startDate.toISOString()}</Start>
            <Finish>${task.endDate.toISOString()}</Finish>
            <Duration>${duration}</Duration>
            <PercentComplete>${task.percentDone}</PercentComplete>
        </Task>`;
    }

    private resourceToXML(resource: Resource, uid: number): string {
        return `        <Resource>
            <UID>${uid}</UID>
            <ID>${uid}</ID>
            <Name>${this.escape(resource.name)}</Name>
        </Resource>`;
    }

    private assignmentToXML(
        assignment: Assignment,
        uid: number,
        tasks: Task[],
        resources: Resource[]
    ): string {
        const taskUID = tasks.findIndex(t => t.id === assignment.taskId) + 1;
        const resourceUID = resources.findIndex(r => r.id === assignment.resourceId) + 1;

        return `        <Assignment>
            <UID>${uid}</UID>
            <TaskUID>${taskUID}</TaskUID>
            <ResourceUID>${resourceUID}</ResourceUID>
            <Units>${assignment.units}</Units>
        </Assignment>`;
    }

    private toDuration(days: number): string {
        const hours = days * 8; // Assuming 8-hour workday
        return `PT${hours}H0M0S`;
    }

    private escape(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    download(xml: string, filename: string): void {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }
}
```

### 5.4 Print Manager

```typescript
interface PrintConfig {
    title?: string;
    headerHtml?: string;
    footerHtml?: string;
    styles?: string;
}

class PrintManager {
    print(element: HTMLElement, config: PrintConfig = {}): void {
        const { title, headerHtml, footerHtml, styles } = config;

        // Create print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Clone element
        const content = element.cloneNode(true) as HTMLElement;

        // Build HTML
        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>${title || 'Print'}</title>
    <style>
        ${this.getStyles()}
        ${styles || ''}
    </style>
</head>
<body>
    ${headerHtml || ''}
    <div class="print-content">
        ${content.outerHTML}
    </div>
    ${footerHtml || ''}
</body>
</html>
        `);

        printWindow.document.close();

        // Wait for images to load
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    }

    private getStyles(): string {
        // Collect all stylesheets
        const styles: string[] = [];

        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    styles.push(rule.cssText);
                }
            } catch (e) {
                // Cross-origin stylesheets
            }
        }

        return styles.join('\n');
    }
}
```

---

## 6. Export Dialog Component (React)

```tsx
interface ExportDialogProps {
    onExport: (config: ExportConfig) => void;
    onClose: () => void;
}

interface ExportConfig {
    format: 'pdf' | 'excel' | 'csv' | 'msp';
    paperFormat?: string;
    orientation?: string;
    filename: string;
}

function ExportDialog({ onExport, onClose }: ExportDialogProps) {
    const [config, setConfig] = useState<ExportConfig>({
        format: 'pdf',
        paperFormat: 'A4',
        orientation: 'landscape',
        filename: 'export'
    });

    return (
        <div className="export-dialog">
            <h3>Export</h3>

            <div className="form-group">
                <label>Format</label>
                <select
                    value={config.format}
                    onChange={e => setConfig({ ...config, format: e.target.value as any })}
                >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel (XLSX)</option>
                    <option value="csv">CSV</option>
                    <option value="msp">MS Project (XML)</option>
                </select>
            </div>

            {config.format === 'pdf' && (
                <>
                    <div className="form-group">
                        <label>Paper Size</label>
                        <select
                            value={config.paperFormat}
                            onChange={e => setConfig({ ...config, paperFormat: e.target.value })}
                        >
                            <option value="A3">A3</option>
                            <option value="A4">A4</option>
                            <option value="Letter">Letter</option>
                            <option value="Legal">Legal</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Orientation</label>
                        <select
                            value={config.orientation}
                            onChange={e => setConfig({ ...config, orientation: e.target.value })}
                        >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>
                </>
            )}

            <div className="form-group">
                <label>Filename</label>
                <input
                    type="text"
                    value={config.filename}
                    onChange={e => setConfig({ ...config, filename: e.target.value })}
                />
            </div>

            <div className="dialog-actions">
                <button onClick={onClose}>Cancel</button>
                <button onClick={() => onExport(config)}>Export</button>
            </div>
        </div>
    );
}
```

---

## 7. Cross-References

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) | DOM generation |
| [DEEP-DIVE-THEMING](./DEEP-DIVE-THEMING.md) | Print styles |
| [IMPL-INFINITE-SCROLL](./IMPL-INFINITE-SCROLL.md) | Large data export |

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
