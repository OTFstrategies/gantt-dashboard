# Calendar Implementation: Export Features

> **Fase 6** - Implementatiegids voor Calendar export functionaliteit: Excel export, ICS export en Print feature.

---

## Overzicht

De Bryntum Calendar biedt meerdere export opties voor het delen van kalendergegevens in verschillende formaten.

### Export Types

| Type | Feature | Output Format | Use Case |
|------|---------|---------------|----------|
| **Excel Export** | ExcelExporter | .xlsx | Spreadsheet integratie |
| **ICS Export** | exportToICS() | .ics | Calendar apps (Outlook, Google) |
| **Print** | Print | HTML/PDF | Papieren kopie |

---

## 1. Excel Export Feature

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 11300
class ExcelExporter extends SchedulerExcelExporter {
    static readonly isExcelExporter: boolean;
    readonly isExcelExporter: boolean;
}

interface ExcelExporterConfig {
    type?: 'excelExporter';

    // Datum formaat voor export
    dateFormat?: string | null;

    // Excel file provider
    xlsProvider?: typeof WriteExcelFileProvider;

    // Kolom configuratie
    exporterConfig?: {
        resourceColumns?: ExportColumn[];
        eventColumns?: ExportColumn[];
    };
}

interface ExportColumn {
    text: string;       // Kolom header
    field: string;      // Data field naam
    width?: number;     // Kolom breedte
    renderer?: (value: any, record: any) => string;
}
```

### Basis Excel Export

```javascript
// Bron: examples/exporttoexcel/app.module.js
import { WriteExcelFileProvider, Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',
    date: new Date(2024, 3, 1),
    mode: 'week',

    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json'
    },

    tbar: {
        items: {
            export: {
                type: 'button',
                weight: 100,
                text: 'Export to Excel',
                icon: 'fa-file-excel',

                onAction: () => calendar.features.excelExporter.export({
                    filename: 'Calendar-events',

                    exporterConfig: {
                        // Resource kolommen
                        resourceColumns: [
                            { text: 'Staff', field: 'name' }
                        ],

                        // Event kolommen
                        eventColumns: [
                            { text: 'Task', field: 'name', width: 200 },
                            { text: 'Starts', field: 'startDate', width: 200 },
                            { text: 'Ends', field: 'endDate', width: 200 }
                        ]
                    }
                })
            }
        }
    },

    features: {
        excelExporter: {
            dateFormat: null,  // Gebruik default date format
            xlsProvider: WriteExcelFileProvider
        }
    }
});
```

### Advanced Excel Export

```javascript
features: {
    excelExporter: {
        xlsProvider: WriteExcelFileProvider,

        // Custom datum formaat
        dateFormat: 'YYYY-MM-DD HH:mm'
    }
},

methods: {
    async exportToExcel() {
        await calendar.features.excelExporter.export({
            filename: `Schedule-${DateHelper.format(new Date(), 'YYYY-MM-DD')}`,

            exporterConfig: {
                // Alle resource velden
                resourceColumns: [
                    { text: 'Name', field: 'name', width: 150 },
                    { text: 'Department', field: 'department', width: 120 },
                    { text: 'Email', field: 'email', width: 200 }
                ],

                // Alle event velden met custom renderers
                eventColumns: [
                    { text: 'Event', field: 'name', width: 250 },
                    { text: 'Start Date', field: 'startDate', width: 150 },
                    { text: 'End Date', field: 'endDate', width: 150 },
                    {
                        text: 'Duration',
                        field: 'duration',
                        width: 100,
                        renderer: (value, record) => `${value} ${record.durationUnit}`
                    },
                    {
                        text: 'All Day',
                        field: 'allDay',
                        width: 80,
                        renderer: value => value ? 'Yes' : 'No'
                    },
                    { text: 'Location', field: 'location', width: 150 }
                ]
            }
        });
    }
}
```

### Export Events

```javascript
calendar.features.excelExporter.on({
    beforeExport({ config }) {
        console.log('Exporting with config:', config);
        // Modify config before export
    },

    export({ blob }) {
        console.log('Export complete, size:', blob.size);
    },

    exportFailed({ error }) {
        console.error('Export failed:', error);
        Toast.show({
            html: 'Export failed: ' + error.message,
            color: 'b-red'
        });
    }
});
```

---

## 2. ICS Export (iCalendar)

### EventModel.exportToICS()

```typescript
// Bron: calendar.d.ts line 265480
class EventModel {
    /**
     * Exports het event naar ICS format en triggert download
     * @param icsEventConfig Extra ICS properties
     */
    exportToICS(icsEventConfig?: Record<string, string>): void;
}
```

### Basis ICS Export

```javascript
// Export single event
const event = calendar.eventStore.getById(1);

event.exportToICS();
// Downloadt: event-name.ics
```

### ICS Export met Custom Properties

```javascript
// Bron: examples/exporttoics/app.module.js
const event = calendar.features.eventEdit.eventRecord;

// RFC 5545 compliant properties
event.exportToICS({
    LOCATION: eventRecord.location,
    DESCRIPTION: eventRecord.notes,
    CATEGORIES: 'Meeting,Work',
    PRIORITY: '1',
    STATUS: 'CONFIRMED',
    ORGANIZER: 'mailto:organizer@company.com'
});
```

### ICS Export via Context Menu

```javascript
const calendar = new Calendar({
    features: {
        eventMenu: {
            items: {
                exportToIcs: {
                    text: 'Export to iCal',
                    icon: 'fa fa-calendar-alt',
                    separator: true,

                    onItem({ eventRecord }) {
                        eventRecord.exportToICS({
                            LOCATION: eventRecord.location
                        });
                    }
                }
            }
        }
    }
});
```

### ICS Export via Event Editor

```javascript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                // Location field
                roomSelector: {
                    name: 'location',
                    type: 'textfield',
                    label: 'Location',
                    weight: 110
                },

                // Export button in editor
                exportButton: {
                    type: 'button',
                    icon: 'fa fa-calendar-alt',
                    text: 'Add to Outlook (.ics)',
                    weight: 900,

                    onClick() {
                        const eventRecord = calendar.features.eventEdit.eventRecord;

                        eventRecord.exportToICS({
                            LOCATION: eventRecord.location
                        });
                    }
                }
            }
        }
    }
});
```

### Bulk ICS Export

```javascript
// Export meerdere events
function exportMultipleToICS(events) {
    events.forEach(event => {
        event.exportToICS({
            LOCATION: event.location,
            CATEGORIES: event.category
        });
    });
}

// Of gecombineerd in één ICS file (custom implementatie)
function exportToSingleICS(events) {
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//My Calendar//EN'
    ];

    events.forEach(event => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${event.id}@mycalendar.com`);
        icsContent.push(`DTSTART:${formatICSDate(event.startDate)}`);
        icsContent.push(`DTEND:${formatICSDate(event.endDate)}`);
        icsContent.push(`SUMMARY:${event.name}`);
        if (event.location) {
            icsContent.push(`LOCATION:${event.location}`);
        }
        icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    downloadFile('events.ics', icsContent.join('\r\n'), 'text/calendar');
}

function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
```

---

## 3. Print Feature

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 11335
interface PrintConfig {
    type?: 'print';

    // Title functie voor print document
    getTitleText?: () => string;
}

// Bron: calendar.d.ts line 11364
class Print {
    onPrint: (() => void) | string;

    constructor(config?: PrintConfig);

    /**
     * Print de huidige active view
     */
    print(): Promise<void>;
}
```

### Basis Print Setup

```javascript
// Bron: examples/print/app.module.js
const calendar = new Calendar({
    date: new Date(2020, 9, 12),

    tbar: {
        items: {
            print: {
                type: 'button',
                text: 'Print',
                color: 'b-deep-orange',
                icon: 'fa fa-print',
                cls: 'b-print-button',
                tooltip: 'Print the currently active view',

                // Roep calendar.print() aan
                onClick: 'up.print'
            }
        }
    },

    modes: {
        day: {
            dayStartTime: 6,
            dayEndTime: 22
        },
        week: {
            dayStartTime: 6,
            dayEndTime: 22
        }
    },

    features: {
        print: true
    }
});
```

### Programmatic Print

```javascript
// Print huidige view
await calendar.print();

// Met callback
calendar.features.print.on('print', () => {
    console.log('Print complete');
});

calendar.print();
```

### Print Styling

```css
/* Print-specifieke styles */
@media print {
    /* Verberg toolbar en sidebar */
    .b-toolbar,
    .b-calendar-sidebar {
        display: none !important;
    }

    /* Full width calendar */
    .b-calendar {
        width: 100% !important;
        height: auto !important;
    }

    /* Event kleuren behouden */
    .b-cal-event-wrap {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    /* Pagina oriëntatie */
    @page {
        size: landscape;
        margin: 1cm;
    }

    /* Headers op elke pagina */
    .b-dayview-header {
        position: static !important;
    }
}
```

### Custom Print Title

```javascript
features: {
    print: {
        getTitleText() {
            const view = calendar.activeView;
            return `Schedule - ${view.description || DateHelper.format(calendar.date, 'MMMM YYYY')}`;
        }
    }
}
```

---

## 4. Custom Export Formats

### JSON Export

```javascript
function exportToJSON() {
    const events = calendar.eventStore.records.map(event => ({
        id: event.id,
        name: event.name,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        allDay: event.allDay,
        resourceId: event.resourceId,
        recurrenceRule: event.recurrenceRule
    }));

    const json = JSON.stringify({ events }, null, 2);
    downloadFile('calendar-export.json', json, 'application/json');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```

### CSV Export

```javascript
function exportToCSV() {
    const headers = ['Name', 'Start Date', 'End Date', 'All Day', 'Resource'];

    const rows = calendar.eventStore.records.map(event => [
        escapeCSV(event.name),
        DateHelper.format(event.startDate, 'YYYY-MM-DD HH:mm'),
        DateHelper.format(event.endDate, 'YYYY-MM-DD HH:mm'),
        event.allDay ? 'Yes' : 'No',
        event.resource?.name || ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile('calendar-export.csv', csv, 'text/csv');
}

function escapeCSV(value) {
    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
```

### PDF Export (via Browser)

```javascript
function exportToPDF() {
    // Gebruik browser print dialoog met PDF optie
    window.print();
}

// Of met jsPDF library
async function exportToPDFAdvanced() {
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');

    const canvas = await html2canvas(calendar.element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save('calendar.pdf');
}
```

---

## 5. Export Toolbar Integration

### Complete Export Toolbar

```javascript
tbar: {
    items: {
        exportMenu: {
            type: 'button',
            text: 'Export',
            icon: 'fa fa-download',
            weight: 650,

            menu: {
                items: {
                    excel: {
                        text: 'Export to Excel',
                        icon: 'fa fa-file-excel',
                        onItem: () => calendar.features.excelExporter.export({
                            filename: 'Calendar'
                        })
                    },
                    csv: {
                        text: 'Export to CSV',
                        icon: 'fa fa-file-csv',
                        onItem: () => exportToCSV()
                    },
                    json: {
                        text: 'Export to JSON',
                        icon: 'fa fa-file-code',
                        onItem: () => exportToJSON()
                    },
                    separator1: { text: '-' },
                    print: {
                        text: 'Print',
                        icon: 'fa fa-print',
                        onItem: () => calendar.print()
                    }
                }
            }
        }
    }
}
```

---

## 6. Export Filters

### Date Range Export

```javascript
function exportDateRange(startDate, endDate) {
    const eventsInRange = calendar.eventStore.records.filter(event =>
        DateHelper.intersectSpans(
            startDate,
            endDate,
            event.startDate,
            event.endDate
        )
    );

    return eventsInRange;
}

// Export alleen huidige view
function exportCurrentView() {
    const view = calendar.activeView;
    return exportDateRange(view.startDate, view.endDate);
}

// Export met resource filter
function exportForResources(resourceIds) {
    return calendar.eventStore.records.filter(event =>
        resourceIds.includes(event.resourceId)
    );
}
```

### Filtered Excel Export

```javascript
async function exportFiltered(options = {}) {
    const {
        startDate = calendar.activeView.startDate,
        endDate = calendar.activeView.endDate,
        resourceIds = null
    } = options;

    // Filter events
    let events = calendar.eventStore.records.filter(event =>
        DateHelper.intersectSpans(startDate, endDate, event.startDate, event.endDate)
    );

    if (resourceIds) {
        events = events.filter(e => resourceIds.includes(e.resourceId));
    }

    // Create temporary store voor export
    const tempStore = new EventStore({ data: events.map(e => e.data) });

    await calendar.features.excelExporter.export({
        filename: `Calendar-${DateHelper.format(startDate, 'YYYY-MM-DD')}`,
        eventStore: tempStore
    });
}
```

---

## 7. Recurring Events Export

### Expand Recurrence voor Export

```javascript
function exportWithExpandedRecurrence(startDate, endDate) {
    const events = [];

    calendar.eventStore.forEach(event => {
        if (event.isRecurring) {
            // Genereer alle occurrences in range
            const occurrences = event.getOccurrencesForDateRange(startDate, endDate);
            occurrences.forEach(occ => {
                events.push({
                    ...event.data,
                    id: `${event.id}-${occ.startDate.getTime()}`,
                    startDate: occ.startDate,
                    endDate: occ.endDate,
                    isOccurrence: true,
                    originalEventId: event.id
                });
            });
        } else if (DateHelper.intersectSpans(startDate, endDate, event.startDate, event.endDate)) {
            events.push(event.data);
        }
    });

    return events;
}
```

---

## 8. Import Support

### ICS Import

```javascript
async function importICS(file) {
    const text = await file.text();
    const events = parseICS(text);

    calendar.eventStore.add(events);
}

function parseICS(icsContent) {
    const events = [];
    const lines = icsContent.split(/\r?\n/);

    let currentEvent = null;

    for (const line of lines) {
        if (line === 'BEGIN:VEVENT') {
            currentEvent = {};
        } else if (line === 'END:VEVENT') {
            if (currentEvent) {
                events.push(currentEvent);
            }
            currentEvent = null;
        } else if (currentEvent) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':');

            switch (key) {
                case 'SUMMARY':
                    currentEvent.name = value;
                    break;
                case 'DTSTART':
                    currentEvent.startDate = parseICSDate(value);
                    break;
                case 'DTEND':
                    currentEvent.endDate = parseICSDate(value);
                    break;
                case 'LOCATION':
                    currentEvent.location = value;
                    break;
                case 'DESCRIPTION':
                    currentEvent.notes = value;
                    break;
            }
        }
    }

    return events;
}

function parseICSDate(dateStr) {
    // Format: 20240115T140000Z
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(9, 11) || '00';
    const minute = dateStr.slice(11, 13) || '00';

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
}
```

### File Drop Import

```javascript
calendar.element.addEventListener('dragover', e => e.preventDefault());

calendar.element.addEventListener('drop', async e => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    for (const file of files) {
        if (file.name.endsWith('.ics')) {
            await importICS(file);
            Toast.show(`Imported: ${file.name}`);
        }
    }
});
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| ExcelExporter | 11300 |
| Print | 11364 |
| PrintConfig | 11335 |
| exportToICS | 265480 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `exporttoexcel/` | Excel export functionaliteit |
| `exporttoics/` | ICS export naar Outlook |
| `print/` | Print feature |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
