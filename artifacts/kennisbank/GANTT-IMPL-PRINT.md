# Gantt Implementation: Print

> **Print** voor het printen van de Gantt chart met custom headers en footers.

---

## Overzicht

Bryntum Gantt ondersteunt printen met aangepaste headers, footers en stijlen.

```
+--------------------------------------------------------------------------+
| GANTT                                              [🖨️ Print]            |
+--------------------------------------------------------------------------+
|  Name              | Start date | Duration  |        Timeline            |
+--------------------------------------------------------------------------+
|  Project Planning  | Jan 15     | 30 days   |  ████████████████          |
|    Analysis        | Jan 15     | 10 days   |  ████████                  |
|    Design          | Jan 25     | 15 days   |          ██████████        |
|    Development     | Feb 10     | 20 days   |                   █████████|
+--------------------------------------------------------------------------+

                            ↓ Print Dialog ↓

+--------------------------------------------------------------------------+
|  [Logo]  Date: Dec 27, 2024 2:30 PM                    Page: 1/3         |
+--------------------------------------------------------------------------+
|  Name              | Start date | Duration  |        Timeline            |
+--------------------------------------------------------------------------+
|  Project Planning  | Jan 15     | 30 days   |  ████████████████          |
|    Analysis        | Jan 15     | 10 days   |  ████████                  |
+--------------------------------------------------------------------------+
|                         © 2024 Bryntum AB                                |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Print Setup

### 1.1 Enable Print Feature

```javascript
import { Gantt, ProjectModel, DateHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints: true,
    autoLoad: true,
    loadUrl: 'data/tasks.json'
});

// Header template function
const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Company logo" src="resources/logo.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
`;

// Footer template function
const footerTpl = () => `<h3>© ${new Date().getFullYear()} Bryntum AB</h3>`;

const gantt = new Gantt({
    appendTo: 'container',
    project,
    dependencyIdField: 'sequenceNumber',

    columns: [
        { type: 'name', field: 'name', text: 'Name', width: 200 },
        { type: 'startdate', text: 'Start date' },
        { type: 'duration', text: 'Duration' }
    ],

    columnLines: false,

    features: {
        print: {
            headerTpl,
            footerTpl,
            // Optional: Filter out certain styles
            filterStyles: styles => styles.filter(item => {
                return !item.match(/<style .+monaco-colors/);
            })
        }
    },

    tbar: [
        {
            type: 'button',
            ref: 'printButton',
            icon: 'fa-print',
            text: 'Print',
            onClick() {
                gantt.features.print.showPrintDialog();
            }
        }
    ]
});
```

---

## 2. Print Dialog

### 2.1 Show Print Dialog

```javascript
// Show the built-in print dialog
gantt.features.print.showPrintDialog();

// Or print directly without dialog
gantt.features.print.print({
    orientation: 'landscape',
    paperFormat: 'A4',
    range: 'all'
});
```

### 2.2 Print Options

```javascript
features: {
    print: {
        headerTpl,
        footerTpl,

        // Default options
        orientation: 'landscape',  // 'portrait' or 'landscape'
        paperFormat: 'A4',         // 'A3', 'A4', 'A5', 'Letter', 'Legal'
        range: 'all',              // 'all', 'currentView', 'dateRange'
        rowsPerPage: 'auto',       // Number or 'auto'
        exporterType: 'singlepage' // 'singlepage' or 'multipage'
    }
}
```

---

## 3. Custom Header/Footer Templates

### 3.1 Advanced Header Template

```javascript
const headerTpl = ({ currentPage, totalPages, gantt }) => {
    const startDate = DateHelper.format(gantt.startDate, 'MMM D, YYYY');
    const endDate = DateHelper.format(gantt.endDate, 'MMM D, YYYY');

    return `
        <div class="print-header">
            <div class="header-left">
                <img src="logo.png" alt="Logo" height="40">
                <div class="project-info">
                    <h2>Project Timeline</h2>
                    <p>${startDate} - ${endDate}</p>
                </div>
            </div>
            <div class="header-right">
                <p>Printed: ${DateHelper.format(new Date(), 'MMM D, YYYY h:mm A')}</p>
                ${totalPages ? `<p>Page ${currentPage + 1} of ${totalPages}</p>` : ''}
            </div>
        </div>
    `;
};
```

### 3.2 Advanced Footer Template

```javascript
const footerTpl = ({ currentPage, totalPages, gantt }) => {
    return `
        <div class="print-footer">
            <div class="footer-left">
                <p>Confidential - For internal use only</p>
            </div>
            <div class="footer-center">
                <p>© ${new Date().getFullYear()} Company Name</p>
            </div>
            <div class="footer-right">
                <p>Generated by Bryntum Gantt</p>
            </div>
        </div>
    `;
};
```

---

## 4. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { DateHelper } from '@bryntum/gantt';
import { useRef, useMemo, useCallback } from 'react';

function PrintableGantt({ projectData }) {
    const ganttRef = useRef(null);

    const headerTpl = useCallback(({ currentPage, totalPages }) => {
        return `
            <div class="print-header">
                <img src="/logo.png" alt="Logo" />
                <div class="print-date">
                    Date: ${DateHelper.format(new Date(), 'll LT')}
                </div>
                ${totalPages ? `<div class="print-page">Page ${currentPage + 1}/${totalPages}</div>` : ''}
            </div>
        `;
    }, []);

    const footerTpl = useCallback(() => {
        return `
            <div class="print-footer">
                <p>© ${new Date().getFullYear()} Your Company</p>
            </div>
        `;
    }, []);

    const handlePrint = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.print.showPrintDialog();
        }
    }, []);

    const handleDirectPrint = useCallback(() => {
        const gantt = ganttRef.current?.instance;
        if (gantt) {
            gantt.features.print.print({
                orientation: 'landscape',
                paperFormat: 'A4'
            });
        }
    }, []);

    const ganttConfig = useMemo(() => ({
        columns: [
            { type: 'name', width: 200 },
            { type: 'startdate' },
            { type: 'duration' }
        ],

        columnLines: false,

        features: {
            print: {
                headerTpl,
                footerTpl
            }
        }
    }), [headerTpl, footerTpl]);

    return (
        <div className="printable-gantt">
            <div className="toolbar">
                <button onClick={handlePrint}>
                    <i className="fa fa-print"></i> Print (Dialog)
                </button>
                <button onClick={handleDirectPrint}>
                    <i className="fa fa-file-pdf"></i> Print (Direct)
                </button>
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

## 5. Print Styles

```css
/* Screen styles */
.print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 2px solid #1976d2;
}

.print-header img {
    height: 40px;
}

.print-header .project-info h2 {
    margin: 0;
    font-size: 18px;
}

.print-header .project-info p {
    margin: 4px 0 0;
    color: #666;
    font-size: 14px;
}

.print-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
}

/* Print-specific styles */
@media print {
    /* Hide toolbar and navigation in print */
    .toolbar,
    .b-toolbar {
        display: none !important;
    }

    /* Ensure proper page breaks */
    .b-gantt-task {
        page-break-inside: avoid;
    }

    /* Optimize colors for print */
    .b-gantt-task-bar {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    /* Print header */
    .print-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
    }

    /* Print footer */
    .print-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
    }

    /* Page margins */
    @page {
        margin: 1.5cm;
    }

    /* Landscape mode */
    @page landscape {
        size: A4 landscape;
    }
}

/* Bryntum print styles */
.b-print .b-grid-headers {
    background: #f5f5f5 !important;
    print-color-adjust: exact;
}

.b-print .b-grid-cell {
    border-color: #ddd !important;
}

.b-print .b-gantt-task-bar {
    box-shadow: none;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Kleuren niet geprint | Browser blokkeert | Enable "Background graphics" |
| Header/footer mist | Template error | Check template functie |
| Afbeeldingen missen | Relatieve paden | Gebruik absolute URLs |
| Pagina's niet correct | rowsPerPage incorrect | Pas rowsPerPage aan |

---

## API Reference

### Print Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `headerTpl` | Function | Header template |
| `footerTpl` | Function | Footer template |
| `orientation` | String | 'portrait' or 'landscape' |
| `paperFormat` | String | Paper size |
| `range` | String | Print range |
| `filterStyles` | Function | Filter stylesheets |

### Template Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `currentPage` | Number | Current page (0-indexed) |
| `totalPages` | Number | Total pages |
| `gantt` | Gantt | Gantt instance |

### Print Methods

| Method | Description |
|--------|-------------|
| `showPrintDialog()` | Show print dialog |
| `print(options)` | Print directly |

### Paper Formats

| Format | Description |
|--------|-------------|
| `'A3'` | A3 size |
| `'A4'` | A4 size |
| `'A5'` | A5 size |
| `'Letter'` | US Letter |
| `'Legal'` | US Legal |

---

## Bronnen

- **Example**: `examples/print/`
- **Print Feature**: `Gantt.feature.Print`

---

*Priority 2: Medium Priority Features*
