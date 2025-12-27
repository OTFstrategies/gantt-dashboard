# Grid Implementation: Export (PDF, Excel, CSV, Print)

> **Complete export functionaliteit** met PDF export, Excel/CSV export, print feature, en custom styling.

---

## Overzicht

Bryntum Grid biedt meerdere export opties voor data en visuele output:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ GRID                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│  [Export PDF]  [Export Excel]  [Export CSV]  [Print...]                  │
├──────────────────────────────────────────────────────────────────────────┤
│  #  │ First name  │ Surname  │ Score │ Rank │ Percent                   │
│  1  │ John        │ Doe      │  85   │  3   │ 85%                       │
│  2  │ Jane        │ Smith    │  92   │  1   │ 92%                       │
│  3  │ Bob         │ Wilson   │  78   │  5   │ 78%                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PDF Export               Excel Export          Print                │ │
│  │ ┌─────────────┐          ┌─────────────┐       ┌─────────────┐     │ │
│  │ │ ┌─────────┐ │          │ xlsx │ csv  │       │ Preview     │     │ │
│  │ │ │ Header  │ │          │ .xlsx file  │       │ ┌─────────┐ │     │ │
│  │ │ ├─────────┤ │          │ with styles │       │ │ Page 1  │ │     │ │
│  │ │ │ Data    │ │          └─────────────┘       │ │ of 3    │ │     │ │
│  │ │ ├─────────┤ │                                │ └─────────┘ │     │ │
│  │ │ │ Footer  │ │                                └─────────────┘     │ │
│  │ └─┴─────────┴─┘                                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PDF Export

### 1.1 Basic PDF Export Setup

```javascript
import { Grid, DateHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        pdfExport: {
            // Export server URL (required)
            exportServer: 'http://localhost:8080/',

            // Convert relative URLs to absolute for resources
            translateURLsToAbsolute: 'http://localhost:8080/resources/',

            // Direct download vs link
            sendAsBinary: true
        }
    },

    columns: [
        { type: 'rownumber', width: 80 },
        { text: 'First name', field: 'firstName', width: 400 },
        { text: 'Surname', field: 'surName', width: 400 },
        { text: 'Score', field: 'score', type: 'number' }
    ],

    tbar: [
        {
            type: 'button',
            text: 'Export to PDF',
            icon: 'fa-file-export',
            onClick: () => grid.features.pdfExport.showExportDialog()
        }
    ]
});
```

### 1.2 Custom Header/Footer Templates

```javascript
// Header template with company logo and pagination
const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Company logo" src="resources/logo.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
`;

// Footer template
const footerTpl = () => `
    <h3>© ${new Date().getFullYear()} Company Name</h3>
`;

features: {
    pdfExport: {
        exportServer: 'http://localhost:8080/',
        headerTpl,
        footerTpl,
        sendAsBinary: true
    }
}
```

### 1.3 WebSocket Export Mode

```javascript
features: {
    pdfExport: {
        exportServer: 'http://localhost:8080/',
        // WebSocket provides progress feedback
        webSocketAvailable: true,
        sendAsBinary: true
    }
}

// Toggle WebSocket at runtime
tbar: [
    {
        type: 'slidetoggle',
        label: 'Use WebSocket',
        value: true,
        onChange({ value }) {
            grid.features.pdfExport.webSocketAvailable = value;
        }
    }
]
```

### 1.4 Export Specific Columns

```javascript
// Export dialog met voorgeselecteerde columns
grid.features.pdfExport.showExportDialog({
    items: {
        columnsField: {
            value: [
                grid.columns.getAt(1),  // firstName
                grid.columns.getAt(2)   // surName
            ]
        }
    }
});

// Programmatic export met specifieke columns
await grid.features.pdfExport.export({
    columns: ['firstName', 'surName', 'score']
});
```

### 1.5 Style Filtering

```javascript
features: {
    pdfExport: {
        exportServer: 'http://localhost:8080/',

        // Filter out unwanted styles
        filterStyles: styles => styles.filter(item => {
            // Exclude monaco editor styles
            return !item.match(/<style .+monaco-colors/) &&
                   !item.match(/<link .+monaco/);
        })
    }
}
```

---

## 2. Excel Export

### 2.1 Basic Excel Export

```javascript
import { Grid, WriteExcelFileProvider } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        excelExporter: {
            // Use built-in provider
            xlsProvider: WriteExcelFileProvider
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Export to Excel',
            icon: 'fa fa-file-excel',
            onAction: () => grid.features.excelExporter.export()
        }
    ]
});
```

### 2.2 Custom Column Configuration

```javascript
// Export met custom columns (niet grid columns)
grid.features.excelExporter.export({
    exporterConfig: {
        columns: [
            { text: 'First Name', field: 'firstName', width: 90 },
            { text: 'Age', field: 'age', width: 40 },
            { text: 'Start Date', field: 'start', width: 140 },
            { text: 'End Date', field: 'finish', width: 140 }
        ]
    }
});
```

### 2.3 CSV Export

```javascript
// Export als CSV in plaats van Excel
grid.features.excelExporter.export({
    csv: {
        delimiter: ','  // of ';' voor EU format
    }
});

// Toolbar met beide opties
tbar: [
    {
        type: 'button',
        text: 'Export Excel',
        icon: 'fa fa-file-excel',
        onAction: () => grid.features.excelExporter.export()
    },
    {
        type: 'button',
        text: 'Export CSV',
        icon: 'fa fa-file-csv',
        onAction: () => grid.features.excelExporter.export({
            csv: { delimiter: ',' }
        })
    }
]
```

### 2.4 Custom Excel Provider

```javascript
import { XlsProviderBase } from '@bryntum/grid';

// Type mapping voor Excel
const typeMap = {
    string: String,
    number: Number,
    date: Date,
    boolean: Boolean
};

class CustomExcelProvider extends XlsProviderBase {
    static write({ filename, columns, rows }) {
        // Process rows met conditional styling
        rows.forEach(row => {
            row.forEach(cell => {
                cell.type = typeMap[cell.type] || String;

                // Convert to string if needed
                if (cell.type === String && typeof cell.value !== 'string') {
                    cell.value = `${cell.value}`;
                }

                // Conditional styling based on value
                if (cell.type === Number) {
                    if (cell.value < 30) {
                        cell.backgroundColor = '#FFFF00';  // Yellow
                    }
                    else if (cell.value > 70) {
                        cell.backgroundColor = '#FF0000';  // Red
                    }
                }
            });
        });

        // Style header row
        columns.forEach(cell => {
            delete cell.type;
            delete cell.field;
            cell.fontWeight = 'bold';
            cell.align = 'center';
        });

        // Use write-excel-file library
        globalThis.writeXlsxFile(
            [columns, ...rows],
            {
                dateFormat: 'yyyy-mm-dd',
                fileName: filename,
                columns: columns.map(cell => ({
                    width: Math.round((cell.width || 100) / 10)
                }))
            }
        );
    }
}

// Use custom provider
features: {
    excelExporter: {
        xlsProvider: CustomExcelProvider
    }
}
```

### 2.5 Export Renderer Handling

```javascript
columns: [
    {
        text: 'Color',
        field: 'color',
        flex: 1,
        renderer({ cellElement, value, isExport }) {
            // Skip DOM manipulation during export
            if (!isExport) {
                cellElement.style.color = value
                    ? `var(--b-color-${value.toLowerCase()})`
                    : '';
            }
            return value;
        }
    }
]
```

---

## 3. Print Feature

### 3.1 Basic Print Setup

```javascript
import { Grid, DateHelper } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        print: {
            headerTpl: ({ currentPage, totalPages }) => `
                <img alt="Logo" src="resources/logo.svg"/>
                <dl>
                    <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
                    <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
                </dl>
            `,
            footerTpl: () => `<h3>© ${new Date().getFullYear()} Company</h3>`,

            // Filter out unnecessary styles
            filterStyles: styles => styles.filter(item =>
                !item.match(/<style .+monaco-colors/)
            )
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Print...',
            icon: 'fa-print',
            tooltip: 'Shows print dialog',
            onClick: () => grid.showPrintDialog()
        },
        {
            type: 'button',
            text: 'Quick print',
            icon: 'fa-bolt',
            tooltip: 'Print with default settings',
            onClick: () => grid.print()
        }
    ]
});
```

### 3.2 Dynamic Header/Footer Toggle

```javascript
const headerTpl = ({ currentPage, totalPages }) => `...`;
const footerTpl = () => `...`;

tbar: [
    {
        type: 'slidetoggle',
        text: 'Custom header/footer',
        checked: true,
        onCheck({ checked }) {
            grid.features.print.headerTpl = checked ? headerTpl : null;
            grid.features.print.footerTpl = checked ? footerTpl : null;
        }
    }
]
```

---

## 4. Gantt Export

### 4.1 Gantt PDF Export

```javascript
import { Gantt, ProjectModel, DateHelper } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',
    project: new ProjectModel({
        loadUrl: '/api/project'
    }),

    features: {
        pdfExport: {
            exportServer: 'http://localhost:8080/',
            translateURLsToAbsolute: 'http://localhost:8080/resources/',
            headerTpl: ({ currentPage, totalPages }) => `
                <img alt="Logo" src="resources/logo.svg"/>
                <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
                <dd>Page: ${currentPage + 1}/${totalPages}</dd>
            `,
            footerTpl: () => `<h3>© ${new Date().getFullYear()} Company</h3>`,
            sendAsBinary: true
        }
    },

    tbar: [
        {
            type: 'button',
            text: 'Export to PDF',
            icon: 'fa-file-export',
            onClick() {
                gantt.features.pdfExport.showExportDialog();
            }
        }
    ]
});
```

### 4.2 Gantt Excel Export

```javascript
import { Gantt, ProjectModel, WriteExcelFileProvider } from '@bryntum/gantt';

const gantt = new Gantt({
    appendTo: 'container',

    features: {
        excelExporter: {
            dateFormat: null,  // Use default date format
            xlsProvider: WriteExcelFileProvider
        }
    },

    columns: [
        { type: 'wbs' },
        { type: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'duration' },
        { type: 'effort' },
        { type: 'resourceassignment' },
        { type: 'percentdone', width: 70 },
        { type: 'predecessor', width: 112 },
        { type: 'successor', width: 112 },
        { type: 'schedulingmodecolumn' },
        { type: 'calendar' },
        { type: 'constrainttype' },
        { type: 'constraintdate' }
    ],

    tbar: [
        {
            type: 'button',
            text: 'Export as xlsx',
            icon: 'fa-file-export',
            onAction: () => {
                const filename = gantt.project.taskStore.first?.name;
                if (filename) {
                    gantt.features.excelExporter.export({ filename });
                }
            }
        },
        {
            type: 'button',
            text: 'Export as CSV',
            icon: 'fa-file-csv',
            onAction: () => {
                const filename = gantt.project.taskStore.first?.name;
                if (filename) {
                    gantt.features.excelExporter.export({
                        filename,
                        csv: { delimiter: ',' }
                    });
                }
            }
        }
    ]
});
```

---

## 5. Export Server Setup

### 5.1 Server Requirements

```javascript
// PDF export requires a server-side component
// Bryntum provides server implementations for:
// - Node.js
// - Java
// - .NET

// Server endpoint configuration
features: {
    pdfExport: {
        // HTTP endpoint
        exportServer: 'http://localhost:8080/',

        // WebSocket support
        webSocketAvailable: true
    }
}
```

### 5.2 Resource URL Translation

```javascript
features: {
    pdfExport: {
        exportServer: 'http://localhost:8080/',

        // Make relative URLs absolute for server rendering
        translateURLsToAbsolute: 'http://localhost:8080/resources/',

        // This ensures fonts, images, icons render correctly
        // e.g., /fonts/icon.woff becomes http://localhost:8080/resources/fonts/icon.woff
    }
}
```

---

## 6. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { useState, useRef } from 'react';

function ExportableGrid({ data }) {
    const gridRef = useRef(null);
    const [useWebSocket, setUseWebSocket] = useState(true);

    const handlePdfExport = () => {
        gridRef.current.instance.features.pdfExport.showExportDialog();
    };

    const handleExcelExport = () => {
        gridRef.current.instance.features.excelExporter.export();
    };

    const handleCsvExport = () => {
        gridRef.current.instance.features.excelExporter.export({
            csv: { delimiter: ',' }
        });
    };

    const handlePrint = () => {
        gridRef.current.instance.showPrintDialog();
    };

    const gridConfig = {
        features: {
            pdfExport: {
                exportServer: 'http://localhost:8080/',
                webSocketAvailable: useWebSocket,
                sendAsBinary: true
            },
            excelExporter: true,
            print: true
        }
    };

    return (
        <div className="export-grid-wrapper">
            <div className="export-toolbar">
                <button onClick={handlePdfExport}>
                    <i className="fa fa-file-pdf" /> PDF
                </button>
                <button onClick={handleExcelExport}>
                    <i className="fa fa-file-excel" /> Excel
                </button>
                <button onClick={handleCsvExport}>
                    <i className="fa fa-file-csv" /> CSV
                </button>
                <button onClick={handlePrint}>
                    <i className="fa fa-print" /> Print
                </button>
                <label>
                    <input
                        type="checkbox"
                        checked={useWebSocket}
                        onChange={(e) => setUseWebSocket(e.target.checked)}
                    />
                    Use WebSocket
                </label>
            </div>

            <BryntumGrid
                ref={gridRef}
                data={data}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 7. Styling

```css
/* Print-specific styles */
@media print {
    .b-grid-header {
        background: #f5f5f5 !important;
        -webkit-print-color-adjust: exact;
    }

    .b-grid-row:nth-child(even) {
        background: #fafafa !important;
    }
}

/* Export dialog styling */
.b-export-dialog {
    min-width: 400px;
}

.b-export-dialog .b-panel-header {
    background: var(--primary-color);
    color: white;
}

/* PDF header/footer styling */
.b-export-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
}

.b-export-header img {
    height: 40px;
}

.b-export-footer {
    text-align: center;
    padding: 10px;
    font-size: 0.9em;
    color: #666;
}

/* Export button styles */
.b-export-button {
    background: #4CAF50;
    color: white;
}

.b-print-button {
    background: #2196F3;
    color: white;
}
```

---

## 8. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| PDF export fails | Server niet bereikbaar | Check exportServer URL, CORS settings |
| Icons missing in PDF | Relative URLs | Gebruik translateURLsToAbsolute |
| Excel export error | Library niet geladen | Voeg write-excel-file library toe |
| Styles missing in PDF | Filtered out | Check filterStyles functie |
| WebSocket timeout | Server issue | Fallback naar HTTP mode |
| Print preview leeg | CSS issues | Check print media queries |
| CSV encoding issues | UTF-8 BOM | Voeg BOM toe aan CSV output |

---

## API Reference

### PdfExport Feature

| Property | Type | Description |
|----------|------|-------------|
| `exportServer` | String | Server URL for PDF generation |
| `translateURLsToAbsolute` | String | Base URL for resources |
| `headerTpl` | Function | Header template function |
| `footerTpl` | Function | Footer template function |
| `sendAsBinary` | Boolean | Direct download vs link |
| `webSocketAvailable` | Boolean | Use WebSocket for progress |
| `filterStyles` | Function | Filter CSS styles |

### ExcelExporter Feature

| Property | Type | Description |
|----------|------|-------------|
| `xlsProvider` | Class | Excel file provider class |
| `dateFormat` | String | Date format in export |

### Print Feature

| Property | Type | Description |
|----------|------|-------------|
| `headerTpl` | Function | Print header template |
| `footerTpl` | Function | Print footer template |
| `filterStyles` | Function | Filter CSS for print |

### Export Methods

| Method | Description |
|--------|-------------|
| `showExportDialog()` | Show PDF export dialog |
| `export(config)` | Programmatic export |
| `showPrintDialog()` | Show print dialog |
| `print()` | Quick print with defaults |

---

## Bronnen

- **Grid PDF Export**: `examples/export/`
- **Grid Excel Export**: `examples/exporttoexcel/`
- **Grid Print**: `examples/print/`
- **Gantt PDF Export**: `examples/export/`
- **Gantt Excel Export**: `examples/exporttoexcel/`
- **PdfExport Feature**: `Grid.feature.export.PdfExport`
- **ExcelExporter Feature**: `Grid.feature.experimental.ExcelExporter`
- **Print Feature**: `Grid.feature.Print`
- **3rd Party**: [write-excel-file (MIT)](https://www.npmjs.com/package/write-excel-file)

---

*Priority 1: Missing Core Functionality*
