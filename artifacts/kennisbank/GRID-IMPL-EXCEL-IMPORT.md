# Grid Implementation: Excel Import

> **Excel file parsing** met SheetJS, automatische column type detectie, drag & drop file upload, en data mapping naar Bryntum Grid.

---

## Overzicht

Excel import stelt gebruikers in staat om spreadsheet data direct in de grid te laden via drag & drop of file picker, met automatische detectie van kolomtypes (dates, numbers, currency).

```
┌─────────────────────────────────────────────────────────────┐
│ [Pick Excel file...]  [Download sample Excel file...]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌──────────────────────────────────┐              │
│           │     📄 sales_data.xlsx           │              │
│           │     ────────────────────         │              │
│           │     Drop Excel file here         │              │
│           └──────────────────────────────────┘              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Product    │ Price   │ Quantity │ Date       │ Total       │
├────────────┼─────────┼──────────┼────────────┼─────────────┤
│ Widget A   │ $25.00  │ 100      │ 01/15/24   │ $2,500.00   │
│ Widget B   │ $35.00  │  75      │ 01/16/24   │ $2,625.00   │
└────────────┴─────────┴──────────┴────────────┴─────────────┘
```

---

## 1. Benodigde Libraries

### 1.1 SheetJS (xlsx)

```html
<!-- CDN include voor SheetJS -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>
```

Of via npm:
```bash
npm install xlsx
```

```javascript
import * as XLSX from 'xlsx';
window.XLSX = XLSX;  // Maak globaal beschikbaar
```

### 1.2 Bryntum Imports

```javascript
import { Grid } from '@bryntum/grid';
```

---

## 2. ExcelImporter Class

### 2.1 Basis Import Functie

```javascript
class ExcelImporter {
    /**
     * Import Excel file en genereer grid columns met auto-detected types
     * @param {string} file - Binary string content van Excel file
     * @returns {Object} Object met columns en data arrays
     */
    static import(file) {
        const
            // Parse Excel met SheetJS
            workbook = window.XLSX.read(file, {
                type: 'binary',
                cellDates: true,  // Converteer Excel dates naar JS Date
                cellNF: true      // Bewaar number format info
            }),
            // Pak eerste sheet
            sheet = workbook.Sheets[workbook.SheetNames[0]],
            // Converteer naar JSON
            data = window.XLSX.utils.sheet_to_json(sheet);

        // Genereer columns met auto-detected types
        const columns = this.generateColumnsFromSheet(sheet, data);

        return { columns, data };
    }
}
```

### 2.2 Column Generatie

```javascript
static generateColumnsFromSheet(sheet, data) {
    if (!data.length) {
        return [];
    }

    const
        range = window.XLSX.utils.decode_range(sheet['!ref']),
        columnMeta = this.extractColumnMetadata(sheet, range);

    return Object.keys(columnMeta).map(field => ({
        field,
        text: field.trim(),
        width: 150,
        ...this.getColumnConfig(columnMeta[field])
    }));
}
```

### 2.3 Metadata Extractie

```javascript
static extractColumnMetadata(sheet, range) {
    const
        metadata = {},
        headerRow = range.s.r;
    let dataRow = headerRow + 1;

    // Itereer door kolommen
    for (let col = range.s.c; col <= range.e.c; col++) {
        const
            headerAddr = window.XLSX.utils.encode_cell({ r: headerRow, c: col }),
            dataAddr = window.XLSX.utils.encode_cell({ r: dataRow, c: col }),
            headerCell = sheet[headerAddr],
            dataCell = sheet[dataAddr];

        if (headerCell && dataCell) {
            metadata[headerCell.v] = {
                cellType: dataCell.t,       // 's'=string, 'n'=number, 'd'=date
                format: dataCell.z || '',   // Excel format string
                value: dataCell.w || ''     // Formatted value
            };
        }
        else {
            // Skip lege rijen
            dataRow++;
            col--;
        }
    }

    return metadata;
}
```

---

## 3. Type Detectie

### 3.1 Column Config Generator

```javascript
static getColumnConfig(meta) {
    if (!meta) {
        return {};
    }

    const { cellType, format, value } = meta;

    // DATE: type 'd' of type 'n' met date format
    if (cellType === 'd' || (cellType === 'n' && this.isDateFormat(format))) {
        const hasTime = this.hasTimeFormat(format);

        return {
            type: 'date',
            format: hasTime ? 'MM/DD/YY HH:mm' : 'MM/DD/YY',
            ...(hasTime && {
                editor: { type: 'datetimefield' }
            })
        };
    }

    // CURRENCY: number met currency symbol
    if (cellType === 'n' && this.isCurrencyFormat(format) && value.trim()) {
        const currencyCode = this.getCurrencyCodeBySymbol(value.trim());
        return {
            type: 'number',
            format: {
                style: 'currency',
                currency: currencyCode
            }
        };
    }

    // NUMBER: type 'n'
    if (cellType === 'n') {
        return { type: 'number' };
    }

    // STRING: default
    return {};
}
```

### 3.2 Format Detection Helpers

```javascript
// Check of format een datum bevat
static isDateFormat(format) {
    // Excel date formats bevatten d, m, y, h, s
    return /[dmyhis]/i.test(format);
}

// Check of format tijd componenten bevat
static hasTimeFormat(format) {
    return /\b(d{1,4}|m{1,4}|y{2,4}|h{1,2}|s{1,2})\b/i.test(format);
}

// Check of format currency is
static isCurrencyFormat(format) {
    return /(?:R\$|kr|Fr|zł|Kč|[\$€£¥₹₽₩₪₱₦₡₴₺₵﷼])/.test(format);
}
```

### 3.3 Currency Symbol Mapping

```javascript
static getCurrencyCodeBySymbol(value) {
    const symbolMap = {
        'R$': 'BRL',    // Brazilian Real
        'kr': 'SEK',    // Swedish Krona
        'Fr': 'CHF',    // Swiss Franc
        'zł': 'PLN',    // Polish Zloty
        'Kč': 'CZK',    // Czech Koruna
        '$': 'USD',     // US Dollar
        '€': 'EUR',     // Euro
        '£': 'GBP',     // British Pound
        '¥': 'JPY',     // Japanese Yen
        '₹': 'INR',     // Indian Rupee
        '₽': 'RUB',     // Russian Ruble
        '₩': 'KRW',     // Korean Won
        '₪': 'ILS',     // Israeli Shekel
        '₱': 'PHP',     // Philippine Peso
        '₦': 'NGN',     // Nigerian Naira
        '₡': 'CRC',     // Costa Rican Colón
        '₴': 'UAH',     // Ukrainian Hryvnia
        '₺': 'TRY',     // Turkish Lira
        '₵': 'GHS',     // Ghanaian Cedi
        '﷼': 'SAR'      // Saudi Riyal
    };

    for (const symbol of Object.keys(symbolMap)) {
        if (value.startsWith(symbol)) {
            return symbolMap[symbol];
        }
    }

    return 'USD';  // Default
}
```

---

## 4. Grid Configuratie

### 4.1 Basis Grid met FileDrop

```javascript
const grid = new Grid({
    appendTo: 'container',

    features: {
        fileDrop: true  // Enable drag & drop
    },

    emptyText: 'Drop an Excel file here to import',

    // Placeholder columns (vervangen bij import)
    columns: [
        { text: 'Name', field: 'name', flex: 2 },
        { text: 'Value', field: 'value', type: 'number' }
    ],

    // File drop handler
    onFileDrop({ file }) {
        this.importExcelFile(file);
    },

    // Helper method
    importExcelFile(file) {
        if (!this.fileReader) {
            this.fileReader = new FileReader();
            this.fileReader.addEventListener('load', this.onFileRead.bind(this));
        }
        this.fileReader.readAsBinaryString(file);
    },

    onFileRead(event) {
        const
            file = event.target.result,
            { columns, data } = ExcelImporter.import(file);

        this.columns.data = columns;
        this.store.data = data;
    }
});
```

### 4.2 Toolbar met File Picker

```javascript
const grid = new Grid({
    // ... base config

    tbar: [
        {
            type: 'filepicker',
            fileFieldConfig: {
                accept: '.xls,.xlsx',
                ariaLabel: 'Pick an Excel file'
            },
            buttonConfig: {
                text: 'Pick an Excel file...',
                icon: 'fa fa-file-excel'
            },
            onChange: 'up.onFilePickerChange'
        },
        '->',
        {
            href: 'data/sample.xlsx',
            tooltip: 'Download sample Excel file',
            icon: 'fa fa-download',
            text: 'Download sample...'
        }
    ],

    onFilePickerChange({ files }) {
        if (files.length > 0) {
            this.importExcelFile(files[0]);
        }
    }
});
```

---

## 5. Geavanceerde Features

### 5.1 Multi-Sheet Support

```javascript
class ExcelImporter {
    static import(file, sheetIndex = 0) {
        const workbook = window.XLSX.read(file, {
            type: 'binary',
            cellDates: true,
            cellNF: true
        });

        // Alle sheet namen beschikbaar
        const sheetNames = workbook.SheetNames;

        // Specifieke sheet selecteren
        const sheet = workbook.Sheets[sheetNames[sheetIndex]];
        const data = window.XLSX.utils.sheet_to_json(sheet);

        return {
            columns: this.generateColumnsFromSheet(sheet, data),
            data,
            sheetNames  // Return voor UI
        };
    }
}

// Usage met sheet selector
const result = ExcelImporter.import(file);

if (result.sheetNames.length > 1) {
    // Toon sheet selector UI
    showSheetSelector(result.sheetNames, selectedIndex => {
        const { columns, data } = ExcelImporter.import(file, selectedIndex);
        grid.columns.data = columns;
        grid.store.data = data;
    });
}
```

### 5.2 Data Validatie

```javascript
class ExcelImporter {
    static import(file, options = {}) {
        const { columns, data } = this.parseFile(file);

        // Validate data
        const validationResult = this.validateData(data, options.validators || {});

        return {
            columns,
            data: validationResult.validRows,
            errors: validationResult.errors
        };
    }

    static validateData(data, validators) {
        const validRows = [];
        const errors = [];

        data.forEach((row, index) => {
            const rowErrors = [];

            for (const [field, validator] of Object.entries(validators)) {
                if (!validator(row[field])) {
                    rowErrors.push({
                        row: index,
                        field,
                        value: row[field]
                    });
                }
            }

            if (rowErrors.length === 0) {
                validRows.push(row);
            }
            else {
                errors.push(...rowErrors);
            }
        });

        return { validRows, errors };
    }
}

// Usage
const { columns, data, errors } = ExcelImporter.import(file, {
    validators: {
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        price: value => typeof value === 'number' && value >= 0
    }
});

if (errors.length) {
    Toast.show(`${errors.length} rows had validation errors`);
}
```

### 5.3 Column Mapping

```javascript
class ExcelImporter {
    static import(file, columnMapping = null) {
        const { columns, data } = this.parseFile(file);

        if (columnMapping) {
            // Map Excel column names naar expected field names
            const mappedData = data.map(row => {
                const newRow = {};
                for (const [excelCol, fieldName] of Object.entries(columnMapping)) {
                    newRow[fieldName] = row[excelCol];
                }
                return newRow;
            });

            // Update column fields
            const mappedColumns = columns.map(col => ({
                ...col,
                field: columnMapping[col.field] || col.field
            }));

            return { columns: mappedColumns, data: mappedData };
        }

        return { columns, data };
    }
}

// Usage
const result = ExcelImporter.import(file, {
    'Product Name': 'name',
    'Unit Price': 'price',
    'Qty': 'quantity',
    'Order Date': 'date'
});
```

---

## 6. Progress & Error Handling

### 6.1 Loading Indicator

```javascript
async importExcelFile(file) {
    // Toon loading
    this.mask('Importing Excel file...');

    try {
        const fileContent = await this.readFileAsBinary(file);
        const { columns, data } = ExcelImporter.import(fileContent);

        this.columns.data = columns;
        this.store.data = data;

        Toast.show(`Imported ${data.length} rows successfully`);
    }
    catch (error) {
        MessageDialog.alert({
            title: 'Import Error',
            message: `Failed to import file: ${error.message}`
        });
    }
    finally {
        this.unmask();
    }
}

readFileAsBinary(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsBinaryString(file);
    });
}
```

### 6.2 Error Feedback

```javascript
class ExcelImporter {
    static import(file) {
        try {
            const workbook = window.XLSX.read(file, {
                type: 'binary',
                cellDates: true,
                cellNF: true
            });

            if (!workbook.SheetNames.length) {
                throw new Error('Excel file contains no sheets');
            }

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            if (!sheet['!ref']) {
                throw new Error('Sheet is empty');
            }

            const data = window.XLSX.utils.sheet_to_json(sheet);

            if (!data.length) {
                throw new Error('No data rows found');
            }

            return {
                columns: this.generateColumnsFromSheet(sheet, data),
                data,
                success: true
            };
        }
        catch (error) {
            return {
                columns: [],
                data: [],
                success: false,
                error: error.message
            };
        }
    }
}
```

---

## 7. Styling

### 7.1 Dropzone Styling

```css
/* Dropzone actief */
.b-grid.b-file-drop-active {
    outline: 3px dashed var(--b-primary-color);
    outline-offset: -3px;
}

.b-grid.b-file-drop-active::before {
    content: 'Drop Excel file here';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5em;
    color: var(--b-primary-color);
    z-index: 100;
}
```

### 7.2 Empty State

```css
.b-grid-empty-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    color: var(--b-text-color-secondary);
}

.b-grid-empty-text::before {
    content: '\f1c3';  /* Excel icon */
    font-family: 'Font Awesome 6 Free';
    font-size: 3em;
    margin-bottom: 1em;
}
```

---

## 8. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import * as XLSX from 'xlsx';
import { ExcelImporter } from './ExcelImporter';

function ExcelGrid() {
    const gridRef = useRef();
    const [columns, setColumns] = useState(defaultColumns);
    const [data, setData] = useState([]);

    const handleFileDrop = useCallback(({ file }) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const result = ExcelImporter.import(e.target.result);
            setColumns(result.columns);
            setData(result.data);
        };

        reader.readAsBinaryString(file);
    }, []);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileDrop({ file });
        }
    }, [handleFileDrop]);

    return (
        <div className="excel-grid-container">
            <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
            />

            <BryntumGrid
                ref={gridRef}
                columns={columns}
                data={data}
                features={{
                    fileDrop: true
                }}
                onFileDrop={handleFileDrop}
                emptyText="Drop Excel file here to import"
            />
        </div>
    );
}
```

---

## 9. Export Roundtrip

### 9.1 Export naar Excel

```javascript
// Gebruik ingebouwde export feature
const grid = new Grid({
    features: {
        excelExporter: true
    },

    tbar: [
        {
            text: 'Export to Excel',
            icon: 'fa fa-file-export',
            onClick() {
                grid.features.excelExporter.export({
                    filename: 'exported_data.xlsx'
                });
            }
        }
    ]
});
```

### 9.2 Custom Export

```javascript
exportToExcel() {
    // Creëer worksheet van grid data
    const ws = XLSX.utils.json_to_sheet(
        this.store.records.map(r => r.data)
    );

    // Creëer workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Download
    XLSX.writeFile(wb, 'export.xlsx');
}
```

---

## 10. Best Practices

### 10.1 File Validation

```javascript
onFileDrop({ file }) {
    // Check file type
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type)) {
        Toast.show('Please drop a valid Excel file (.xls or .xlsx)');
        return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        Toast.show('File too large. Maximum size is 10MB');
        return;
    }

    this.importExcelFile(file);
}
```

### 10.2 Large File Handling

```javascript
async importLargeFile(file) {
    // Process in chunks voor grote files
    const CHUNK_SIZE = 1000;
    const { columns, data } = ExcelImporter.import(file);

    this.columns.data = columns;
    this.store.data = [];  // Start leeg

    // Load in batches
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        this.store.add(chunk);

        // Update progress
        this.mask(`Loading... ${Math.min(i + CHUNK_SIZE, data.length)} / ${data.length}`);

        // Allow UI to update
        await new Promise(r => setTimeout(r, 0));
    }

    this.unmask();
}
```

---

## 11. Troubleshooting

### 11.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| XLSX not defined | SheetJS niet geladen | Include script voor Grid module |
| Dates als numbers | cellDates niet true | Zet `cellDates: true` in read() |
| Encoding issues | Binary vs array buffer | Gebruik `readAsBinaryString()` |
| Currency niet herkend | Symbol niet in map | Voeg symbol toe aan getCurrencyCodeBySymbol |

### 11.2 Debug

```javascript
// Log parsed data
const workbook = XLSX.read(file, { type: 'binary', cellDates: true, cellNF: true });
console.log('Sheets:', workbook.SheetNames);
console.log('First sheet:', workbook.Sheets[workbook.SheetNames[0]]);

// Log cell details
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('Range:', range);

// Log specific cell
const cell = sheet['A2'];
console.log('Cell A2:', cell);
// { t: 'n', v: 123.45, z: '$#,##0.00', w: '$123.45' }
```

---

## Bronnen

- **Example**: `examples/import-from-excel/`
- **SheetJS**: https://sheetjs.com/
- **FileDrop Feature**: `Grid.feature.FileDrop`
- **ExcelExporter**: `Grid.feature.ExcelExporter`

---

*Track A: Foundation - Grid Core Extensions (A1.5)*
