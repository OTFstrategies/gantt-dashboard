# Grid Implementation: Print

> **Print** feature voor het afdrukken van de grid met custom header/footer.

---

## Overzicht

Bryntum Grid's Print feature biedt afdrukfunctionaliteit met paginering.

```
+--------------------------------------------------------------------------+
| GRID                              [Print...] [Quick print] [x] Header    |
+--------------------------------------------------------------------------+
|  #   |  First name   |  Surname     |  Score  |  Rank  |  Percent        |
+--------------------------------------------------------------------------+
|  1   |  John         |  Doe         |   85    |   1    |  ████ 85%       |
|  2   |  Jane         |  Smith       |   92    |   2    |  ████ 92%       |
|  3   |  Bob          |  Wilson      |   78    |   3    |  ███ 78%        |
+--------------------------------------------------------------------------+

                  PRINT PREVIEW
        ┌─────────────────────────────────┐
        │  [Logo]  Date: Dec 27, 2024     │  ← Header template
        │          Page: 1/3              │
        ├─────────────────────────────────┤
        │  #  | First name | Surname |...│
        ├─────────────────────────────────┤
        │  1  | John       | Doe     |...│
        │  2  | Jane       | Smith   |...│
        │  3  | Bob        | Wilson  |...│
        │ ... | ...        | ...     |...│
        ├─────────────────────────────────┤
        │       © 2024 Bryntum AB         │  ← Footer template
        └─────────────────────────────────┘
```

---

## 1. Basic Print Setup

### 1.1 Enable Print Feature

```javascript
import { Grid, DateHelper, DataGenerator } from '@bryntum/grid';

const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Company logo" src="resources/bryntum.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
`;

const footerTpl = () => `<h3>© ${new Date().getFullYear()} Bryntum AB</h3>`;

const grid = new Grid({
    appendTo: 'container',
    data: DataGenerator.generateData(50),

    features: {
        print: {
            headerTpl,
            footerTpl,
            // Filter out certain styles from print
            filterStyles: styles => styles.filter(item => {
                return !item.match(/<style .+monaco-colors/) &&
                       !item.match(/<link .+monaco/);
            })
        }
    },

    columns: [
        { type: 'rownumber', width: 80 },
        { text: 'First name', field: 'firstName', width: 400 },
        { text: 'Surname', field: 'surName', width: 400 },
        { text: 'Score', field: 'score', flex: 1, type: 'number' },
        { text: 'Rank', field: 'rank', flex: 1, type: 'number' },
        { text: 'Percent', field: 'percent', width: 150, type: 'percent' }
    ]
});
```

---

## 2. Toolbar Controls

### 2.1 Print Buttons

```javascript
tbar: [
    {
        ref: 'printButton',
        type: 'button',
        text: 'Print...',
        icon: 'fa-print',
        cls: 'b-print-button',
        tooltip: 'Shows Grid\'s print dialog',
        onClick: () => {
            grid.showPrintDialog();
        }
    },
    {
        ref: 'quickPrintButton',
        type: 'button',
        text: 'Quick print',
        icon: 'fa-bolt',
        cls: 'b-print-button',
        tooltip: 'Prints directly using default settings',
        onClick: () => {
            grid.print();
        }
    },
    {
        type: 'slidetoggle',
        text: 'Custom header/footer',
        cls: 'b-print-button',
        checked: true,
        onCheck({ checked }) {
            grid.features.print.headerTpl = checked ? headerTpl : null;
            grid.features.print.footerTpl = checked ? footerTpl : null;
        }
    }
]
```

---

## 3. Print Configuration

### 3.1 Feature Options

```javascript
features: {
    print: {
        // Header template function
        headerTpl: ({ currentPage, totalPages }) => `
            <div class="print-header">
                <img src="logo.png" alt="Logo" />
                <span>Page ${currentPage + 1} of ${totalPages}</span>
            </div>
        `,

        // Footer template function
        footerTpl: () => `
            <div class="print-footer">
                <span>Printed on ${new Date().toLocaleDateString()}</span>
            </div>
        `,

        // Filter CSS styles for print
        filterStyles: styles => styles.filter(s => !s.includes('monaco')),

        // Paper size
        paperFormat: 'A4',

        // Orientation
        orientation: 'landscape'
    }
}
```

### 3.2 Print Dialog Options

```javascript
// Show print dialog with options
grid.showPrintDialog({
    // Pre-select options
    paperFormat: 'Letter',
    orientation: 'portrait'
});

// Direct print with options
grid.print({
    paperFormat: 'A4',
    orientation: 'landscape'
});
```

---

## 4. Template Variables

### 4.1 Available Template Parameters

```javascript
headerTpl: ({
    currentPage,    // Current page number (0-based)
    totalPages,     // Total number of pages
    grid            // Grid instance
}) => {
    return `
        <div class="header">
            <span>Page ${currentPage + 1} of ${totalPages}</span>
            <span>Total records: ${grid.store.count}</span>
        </div>
    `;
}
```

---

## 5. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { DateHelper } from '@bryntum/grid';
import { useState, useRef, useCallback } from 'react';

function PrintableGrid({ data }) {
    const gridRef = useRef(null);
    const [useCustomHeaders, setUseCustomHeaders] = useState(true);

    const headerTpl = useCallback(({ currentPage, totalPages }) => `
        <div class="print-header">
            <img src="logo.svg" alt="Company Logo" />
            <div class="print-info">
                <div>Date: ${DateHelper.format(new Date(), 'll LT')}</div>
                <div>Page: ${currentPage + 1}/${totalPages || '-'}</div>
            </div>
        </div>
    `, []);

    const footerTpl = useCallback(() => `
        <div class="print-footer">
            <span>© ${new Date().getFullYear()} My Company</span>
        </div>
    `, []);

    const handlePrint = useCallback(() => {
        gridRef.current?.instance.showPrintDialog();
    }, []);

    const handleQuickPrint = useCallback(() => {
        gridRef.current?.instance.print();
    }, []);

    const toggleHeaders = useCallback((checked) => {
        setUseCustomHeaders(checked);
        const grid = gridRef.current?.instance;
        if (grid) {
            grid.features.print.headerTpl = checked ? headerTpl : null;
            grid.features.print.footerTpl = checked ? footerTpl : null;
        }
    }, [headerTpl, footerTpl]);

    const gridConfig = {
        features: {
            print: {
                headerTpl: useCustomHeaders ? headerTpl : null,
                footerTpl: useCustomHeaders ? footerTpl : null
            }
        },

        columns: [
            { type: 'rownumber', width: 60 },
            { text: 'First name', field: 'firstName', flex: 1 },
            { text: 'Surname', field: 'surName', flex: 1 },
            { text: 'Score', field: 'score', width: 100, type: 'number' },
            { text: 'Rank', field: 'rank', width: 80, type: 'number' }
        ]
    };

    return (
        <div className="printable-grid">
            <div className="toolbar">
                <button onClick={handlePrint}>
                    Print...
                </button>
                <button onClick={handleQuickPrint}>
                    Quick Print
                </button>
                <label>
                    <input
                        type="checkbox"
                        checked={useCustomHeaders}
                        onChange={(e) => toggleHeaders(e.target.checked)}
                    />
                    Custom header/footer
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

## 6. Styling

```css
/* Print header */
.print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 2px solid #333;
}

.print-header img {
    height: 40px;
}

.print-info {
    text-align: right;
    font-size: 12px;
}

/* Print footer */
.print-footer {
    text-align: center;
    padding: 10px;
    border-top: 1px solid #ccc;
    font-size: 11px;
    color: #666;
}

/* Print-specific styles */
@media print {
    /* Hide toolbar */
    .toolbar {
        display: none;
    }

    /* Page breaks */
    .b-grid-row {
        page-break-inside: avoid;
    }

    /* Adjust colors for print */
    .b-grid-cell {
        color: black !important;
        background: white !important;
    }

    /* Remove shadows */
    .b-grid {
        box-shadow: none !important;
    }
}

/* Print dialog */
.b-print-dialog {
    width: 400px;
}

.b-print-dialog .b-field {
    margin-bottom: 16px;
}

/* Print button styling */
.b-print-button {
    background: #1976d2;
    color: white;
}

.b-print-button:hover {
    background: #1565c0;
}
```

---

## 7. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Header niet zichtbaar | headerTpl: null | Definieer headerTpl functie |
| Styles missen in print | filterStyles te strict | Check filterStyles filter |
| Pagina's overlappen | Page breaks niet ingesteld | Voeg page-break CSS toe |
| Logo niet zichtbaar | Pad incorrect | Gebruik absolute URL |

---

## API Reference

### Print Feature Config

| Property | Type | Description |
|----------|------|-------------|
| `headerTpl` | Function | Header template |
| `footerTpl` | Function | Footer template |
| `filterStyles` | Function | Style filter |
| `paperFormat` | String | Paper size (A4, Letter) |
| `orientation` | String | portrait/landscape |

### Print Methods

| Method | Description |
|--------|-------------|
| `print(options)` | Direct print |
| `showPrintDialog(options)` | Show dialog |

### Template Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `currentPage` | Number | Current page (0-based) |
| `totalPages` | Number | Total pages |
| `grid` | Grid | Grid instance |

---

## Bronnen

- **Example**: `examples/print/`
- **Print Feature**: `Grid.feature.Print`

---

*Priority 2: Medium Priority Features*
