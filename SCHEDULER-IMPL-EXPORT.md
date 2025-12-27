# SchedulerPro Implementation: Export Features

## Overview

SchedulerPro provides multiple export capabilities:
- **PdfExport**: Generate PDF/PNG files via server
- **Print**: Browser print functionality
- **ExcelExporter**: Export to Excel/CSV (client-side)

## PDF Export

### Feature Configuration

```javascript
features: {
    pdfExport: {
        // Export server URL
        exportServer: 'https://export.bryntum.com/',

        // Convert relative URLs to absolute
        translateURLsToAbsolute: true,

        // Client URL for resource resolution
        clientURL: window.location.href,

        // Paper settings
        paperFormat: 'A4',        // A4, A3, Letter, Legal, etc.
        orientation: 'landscape', // landscape or portrait

        // Date range
        exporterType: 'singlepage', // singlepage or multipage
        scheduleRange: 'currentview', // completeview, currentview, daterange

        // Column export
        exportColumns: ['name', 'startDate', 'endDate'],

        // Show dialog before export
        showExportDialog: true
    }
}
```

### Export Methods

```javascript
// Export with defaults
await scheduler.features.pdfExport.export();

// Export with options
await scheduler.features.pdfExport.export({
    format: 'A4',
    orientation: 'landscape',
    scheduleRange: 'currentview',
    fileName: 'schedule.pdf'
});

// Export to PNG
await scheduler.features.pdfExport.export({
    fileFormat: 'png'
});

// Show export dialog
scheduler.features.pdfExport.showExportDialog();
```

### Export Options

```typescript
interface PdfExportOptions {
    // Output
    fileName?: string;
    fileFormat?: 'pdf' | 'png';

    // Page settings
    paperFormat?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Legal' | 'Executive' | 'Ledger' | 'Tabloid';
    orientation?: 'portrait' | 'landscape';

    // Date range
    scheduleRange?: 'completeview' | 'currentview' | 'daterange';
    rangeStart?: Date;
    rangeEnd?: Date;

    // Content
    exportColumns?: string[];
    exporterType?: 'singlepage' | 'multipage';

    // Appearance
    headerTpl?: Function;
    footerTpl?: Function;
    alignRows?: boolean;
    keepRegionSizes?: boolean;
    showHeader?: boolean;
}
```

### Export Dialog

```javascript
features: {
    pdfExport: {
        exportServer: 'https://export.bryntum.com/',

        // Customize dialog
        exportDialog: {
            title: 'Export Schedule',

            // Pre-select options
            items: {
                formatField: {
                    value: 'A4'
                },
                orientationField: {
                    value: 'landscape'
                },
                rangeField: {
                    value: 'currentview'
                }
            }
        }
    }
}
```

### Events

```javascript
scheduler.features.pdfExport.on({
    exportStep({ progress, text }) {
        console.log(`Export: ${progress}% - ${text}`);
    }
});
```

## Print Feature

Built on top of PdfExport, uses browser's print functionality.

### Configuration

```javascript
features: {
    print: {
        // Paper settings
        paperFormat: 'A4',
        orientation: 'landscape',

        // Content
        scheduleRange: 'currentview',

        // Show print dialog
        showExportDialog: true
    }
}
```

### Print Methods

```javascript
// Print with defaults
await scheduler.features.print.print();

// Print with options
await scheduler.features.print.print({
    orientation: 'portrait',
    scheduleRange: 'daterange',
    rangeStart: new Date(2024, 0, 1),
    rangeEnd: new Date(2024, 0, 31)
});

// Show print dialog
scheduler.features.print.showExportDialog();
```

## Excel Export

Client-side export using zipcelx library.

### Setup

```html
<!-- Include zipcelx library -->
<script src="https://cdn.jsdelivr.net/npm/zipcelx@1.6.2/dist/zipcelx.js"></script>
```

### Configuration

```javascript
features: {
    excelExporter: {
        // Library reference
        zipcelx: window.zipcelx,

        // Date format
        dateFormat: 'YYYY-MM-DD',

        // Export configuration
        exporterConfig: {
            // Custom columns to export
            columns: [
                { text: 'Name', field: 'name' },
                { text: 'Start Date', field: 'startDate', type: 'date' },
                { text: 'End Date', field: 'endDate', type: 'date' },
                { text: 'Duration', field: 'duration' }
            ]
        }
    }
}
```

### Export Methods

```javascript
// Export to Excel
scheduler.features.excelExporter.export({
    filename: 'schedule',
    exporterConfig: {
        columns: [
            { text: 'Event', field: 'name', width: 200 },
            { text: 'Start', field: 'startDate', type: 'date' },
            { text: 'End', field: 'endDate', type: 'date' }
        ]
    }
});

// Export to CSV
scheduler.features.excelExporter.export({
    filename: 'schedule',
    type: 'csv'  // csv or xlsx
});
```

### Custom Export

```javascript
features: {
    excelExporter: {
        zipcelx: window.zipcelx,

        exporterConfig: {
            // Custom rows generator
            rowsGenerator({ grid }) {
                const rows = [];

                grid.store.forEach(record => {
                    rows.push([
                        { value: record.name, type: 'string' },
                        { value: record.startDate, type: 'date' },
                        { value: record.endDate, type: 'date' },
                        { value: record.duration, type: 'number' }
                    ]);
                });

                return rows;
            }
        }
    }
}
```

## Toolbar Integration

```javascript
tbar: [
    {
        type: 'button',
        icon: 'b-fa b-fa-file-pdf',
        text: 'Export PDF',
        onClick: () => scheduler.features.pdfExport.showExportDialog()
    },
    {
        type: 'button',
        icon: 'b-fa b-fa-print',
        text: 'Print',
        onClick: () => scheduler.features.print.print()
    },
    {
        type: 'button',
        icon: 'b-fa b-fa-file-excel',
        text: 'Export Excel',
        onClick: () => scheduler.features.excelExporter.export({
            filename: 'schedule'
        })
    }
]
```

## Header/Footer Templates

```javascript
features: {
    pdfExport: {
        exportServer: 'https://export.bryntum.com/',

        // Header template
        headerTpl: ({ currentPage, totalPages }) => `
            <div style="text-align: center; padding: 10px;">
                <h2>My Schedule Report</h2>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
        `,

        // Footer template
        footerTpl: ({ currentPage, totalPages }) => `
            <div style="text-align: center; padding: 10px;">
                Page ${currentPage} of ${totalPages}
            </div>
        `
    }
}
```

## Multi-Page Export

```javascript
features: {
    pdfExport: {
        exportServer: 'https://export.bryntum.com/',

        // Use multipage exporter
        exporterType: 'multipage',

        // Rows per page
        rowsPerPage: 10
    }
}
```

## Complete Example

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    features: {
        // PDF Export
        pdfExport: {
            exportServer: 'https://export.bryntum.com/',
            translateURLsToAbsolute: true,
            clientURL: window.location.href,

            // Default settings
            paperFormat: 'A4',
            orientation: 'landscape',
            exporterType: 'singlepage',

            // Header
            headerTpl: ({ currentPage }) => `
                <div class="export-header">
                    <img src="/logo.png" alt="Logo" />
                    <h1>Schedule Report</h1>
                    <p>Exported: ${new Date().toLocaleString()}</p>
                </div>
            `,

            // Footer
            footerTpl: ({ currentPage, totalPages }) =>
                `<div class="export-footer">Page ${currentPage}/${totalPages}</div>`,

            listeners: {
                exportStep({ progress, text }) {
                    updateProgress(progress, text);
                }
            }
        },

        // Print
        print: {
            paperFormat: 'A4',
            orientation: 'landscape'
        },

        // Excel Export
        excelExporter: {
            zipcelx: window.zipcelx,
            dateFormat: 'YYYY-MM-DD HH:mm',

            exporterConfig: {
                columns: [
                    { text: 'Event Name', field: 'name', width: 250 },
                    { text: 'Resource', field: 'resourceId', width: 150 },
                    { text: 'Start Date', field: 'startDate', type: 'date', width: 150 },
                    { text: 'End Date', field: 'endDate', type: 'date', width: 150 },
                    { text: 'Duration', field: 'duration', type: 'number', width: 100 },
                    { text: 'Progress', field: 'percentDone', type: 'number', width: 100 }
                ]
            }
        }
    },

    tbar: [
        {
            type: 'button',
            ref: 'exportPdf',
            icon: 'b-fa b-fa-file-pdf',
            text: 'Export PDF',
            menu: {
                items: [
                    {
                        text: 'Export current view',
                        onClick: () => scheduler.features.pdfExport.export({
                            scheduleRange: 'currentview'
                        })
                    },
                    {
                        text: 'Export all',
                        onClick: () => scheduler.features.pdfExport.export({
                            scheduleRange: 'completeview'
                        })
                    },
                    {
                        text: 'Export options...',
                        onClick: () => scheduler.features.pdfExport.showExportDialog()
                    }
                ]
            }
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-print',
            text: 'Print',
            onClick: () => scheduler.features.print.print()
        },
        {
            type: 'button',
            icon: 'b-fa b-fa-file-excel',
            text: 'Excel',
            menu: {
                items: [
                    {
                        text: 'Export to Excel',
                        onClick: () => scheduler.features.excelExporter.export({
                            filename: 'schedule',
                            type: 'xlsx'
                        })
                    },
                    {
                        text: 'Export to CSV',
                        onClick: () => scheduler.features.excelExporter.export({
                            filename: 'schedule',
                            type: 'csv'
                        })
                    }
                ]
            }
        }
    ]
});

function updateProgress(progress, text) {
    console.log(`Export: ${progress}% - ${text}`);
}
```

## Self-Hosted Export Server

For on-premise deployments:

```javascript
features: {
    pdfExport: {
        // Your server URL
        exportServer: 'https://your-server.com/export/',

        // Headers for authentication
        fetchOptions: {
            headers: {
                'Authorization': 'Bearer your-token'
            }
        }
    }
}
```

## CSS for Export

```css
/* Styles applied during export */
@media print {
    .b-scheduler {
        /* Force colors in print */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* Hide non-printable elements */
    .b-toolbar,
    .b-panel-header {
        display: none !important;
    }
}

/* Export-specific header/footer */
.export-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ddd;
}

.export-footer {
    text-align: center;
    padding: 10px;
    color: #666;
    font-size: 12px;
}
```

## Best Practices

1. **Use export server for PDF** - Client-side PDF generation has limitations
2. **Optimize for print** - Use `@media print` CSS rules
3. **Include zipcelx** - Required for Excel export
4. **Handle long schedules** - Use multipage export for large date ranges
5. **Test all orientations** - Verify layout in both portrait and landscape
6. **Cache export server** - Self-host for production environments

## API Reference Links

- [PdfExport Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/export/PdfExport)
- [Print Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/export/Print)
- [ExcelExporter Feature](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/experimental/ExcelExporter)
- [Export Server Guide](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/guides/exporting.md)
