# INTEGRATION-EXPORT.md

> **Export & Import Patterns** - PDF Export, Excel Export, CSV Export, MS Project Import, ICS Export en custom export configuraties.

---

## Overzicht

Bryntum biedt uitgebreide export/import mogelijkheden:
- **PDF Export** - Gantt/Scheduler naar PDF met custom headers/footers
- **Excel Export** - Data naar XLSX met WriteExcelFileProvider
- **CSV Export** - Comma-separated values export
- **MS Project Import** - MPP files importeren met MPXJ library
- **ICS Export** - Calendar events naar iCalendar format

---

## PDF Export Feature

### Basis Configuratie

```typescript
import { Gantt, ProjectModel, DateHelper } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints : true,
    autoLoad           : true,
    loadUrl            : 'data/project.json',
    validateResponse   : true
});

// Header template met logo en datum
const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Company logo" src="resources/logo.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
`;

// Footer template
const footerTpl = () => `
    <h3>© ${new Date().getFullYear()} My Company</h3>
`;

const gantt = new Gantt({
    appendTo : 'container',
    project,

    features : {
        pdfExport : {
            // Export server URL (required)
            exportServer : 'http://localhost:8080/',

            // Convert relative URLs to absolute for resources
            translateURLsToAbsolute : 'http://localhost:8080/resources/',

            // Filter out unwanted styles (e.g., monaco editor in demos)
            filterStyles : styles => styles.filter(item => {
                return !item.match(/<style .+monaco-colors/) &&
                       !item.match(/<link .+monaco/);
            }),

            // Custom header and footer
            headerTpl,
            footerTpl,

            // Send as binary for direct download
            sendAsBinary : true
        }
    },

    tbar : [
        {
            type : 'button',
            icon : 'fa-file-export',
            text : 'Export to PDF',
            onClick() {
                gantt.features.pdfExport.showExportDialog();
            }
        },
        {
            type  : 'slidetoggle',
            label : 'Use WebSocket',
            value : true,
            onChange({ value }) {
                gantt.features.pdfExport.webSocketAvailable = value;
            }
        },
        {
            type  : 'slidetoggle',
            label : 'Download directly',
            value : true,
            onChange({ value }) {
                gantt.features.pdfExport.sendAsBinary = value;
            }
        }
    ]
});
```

### PDF Export Opties

```typescript
interface PdfExportConfig {
    // Server configuratie
    exportServer: string;
    translateURLsToAbsolute?: string;

    // Templates
    headerTpl?: (data: HeaderData) => string;
    footerTpl?: () => string;

    // Export opties
    sendAsBinary?: boolean;          // Direct download vs file link
    webSocketAvailable?: boolean;    // Use WebSocket for progress
    filterStyles?: (styles: string[]) => string[];

    // Paper settings
    paperFormat?: 'A4' | 'A3' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';

    // Range settings
    rangeType?: 'all' | 'visible' | 'dateRange';
    dateRange?: { startDate: Date, endDate: Date };

    // Quality settings
    dpi?: number;
    repeatHeader?: boolean;
}

interface HeaderData {
    currentPage: number;
    totalPages: number;
}
```

### Programmatische Export

```typescript
// Export met custom opties
async function exportToPdf() {
    try {
        const result = await gantt.features.pdfExport.export({
            columns           : gantt.columns.visibleColumns,
            exporterType      : 'multipagevertical',
            orientation       : 'landscape',
            paperFormat       : 'A3',
            repeatHeader      : true,
            scheduleRange     : 'completeview',
            fileFormat        : 'pdf',
            fileName          : `Project_${DateHelper.format(new Date(), 'YYYY-MM-DD')}`
        });

        console.log('Export completed:', result);
    }
    catch (error) {
        console.error('Export failed:', error);
    }
}

// Export met progress callback
gantt.features.pdfExport.on({
    exportStep({ progress, text }) {
        console.log(`Export progress: ${progress}% - ${text}`);
    }
});
```

---

## Excel Export Feature

### WriteExcelFileProvider Configuratie

```typescript
import { WriteExcelFileProvider, Gantt, ProjectModel, Toast } from '@bryntum/gantt';

const project = new ProjectModel({
    autoSetConstraints : true,
    transport          : {
        load : { url : 'data/project.json' }
    },
    validateResponse   : true
});

const gantt = new Gantt({
    appendTo : 'container',
    project,

    features : {
        excelExporter : {
            // Date format for date fields (null = ISO format)
            dateFormat  : null,

            // Excel file provider
            xlsProvider : WriteExcelFileProvider
        }
    },

    subGridConfigs : {
        locked : { flex : 1 },
        normal : { flex : 2 }
    },

    columns : [
        { type : 'wbs' },
        { type : 'name', width : 250 },
        { type : 'startdate' },
        { type : 'duration' },
        { type : 'effort' },
        { type : 'resourceassignment' },
        { type : 'percentdone', width : 70 },
        { type : 'predecessor', width : 112 },
        { type : 'successor', width : 112 },
        { type : 'schedulingmodecolumn' },
        { type : 'calendar' },
        { type : 'constrainttype' },
        { type : 'constraintdate' },
        { type : 'addnew' }
    ],

    tbar : [
        {
            type     : 'button',
            text     : 'Export as XLSX',
            icon     : 'fa-file-export',
            onAction : () => {
                const filename = gantt.project.taskStore.first?.name || 'export';
                gantt.features.excelExporter.export({ filename });
            }
        },
        {
            type     : 'button',
            text     : 'Export as CSV',
            icon     : 'fa-file-csv',
            onAction : () => {
                const filename = gantt.project.taskStore.first?.name || 'export';
                gantt.features.excelExporter.export({
                    filename,
                    csv : {
                        delimiter : ','
                    }
                });
            }
        }
    ]
});

project.load();

// License notice
Toast.show({
    html    : `<p>This uses the <b>write-excel-file</b> library (MIT License).</p>`,
    timeout : 10000
});
```

### Excel Export Opties

```typescript
interface ExcelExportConfig {
    // File settings
    filename?: string;
    dateFormat?: string | null;

    // Provider
    xlsProvider?: typeof WriteExcelFileProvider;

    // CSV specific
    csv?: {
        delimiter: ',' | ';' | '\t';
    };

    // Column selection
    columns?: Column[];
    exportVisibleColumnsOnly?: boolean;
}

// Programmatic export with all options
gantt.features.excelExporter.export({
    filename                 : 'MyProject',
    dateFormat               : 'YYYY-MM-DD',
    exportVisibleColumnsOnly : true,

    // Custom column processors
    columns : gantt.columns.allRecords.map(column => ({
        ...column,
        // Custom value processor
        exportValue : record => record.get(column.field)
    }))
});
```

---

## MS Project Import

### Complete Importer Class

```typescript
import { ArrayHelper, Gantt, AjaxHelper, Toast } from '@bryntum/gantt';

class MSProjectImporter {
    constructor(config) {
        const me = this;

        me.gantt = config.gantt;
        me.defaultColumns = config.defaultColumns;

        // Bind methods for map/flatMap calls
        me.processAssignment = me.processAssignment.bind(me);
        me.processResource = me.processResource.bind(me);
        me.processDependency = me.processDependency.bind(me);
        me.processTask = me.processTask.bind(me);
        me.processCalendar = me.processCalendar.bind(me);
        me.processColumn = me.processColumn.bind(me);
    }

    async importData(data) {
        const me = this;

        const project = new me.gantt.projectModelClass({
            autoSetConstraints                                 : true,
            silenceInitialCommit                               : false,
            // Preserve started task dates
            startedTaskScheduling                              : 'Manual',
            skipNonWorkingTimeInDurationWhenSchedulingManually : true
        });

        me.project = project;
        me.calendarManager = project.calendarManagerStore;
        me.taskStore = project.taskStore;
        me.assignmentStore = project.assignmentStore;
        me.resourceStore = project.resourceStore;
        me.dependencyStore = project.dependencyStore;

        // Initialize ID mappings: MSProject ID => Bryntum ID
        me.calendarMap = {};
        me.resourceMap = {};
        me.taskMap = {};

        // Import in correct order
        me.importCalendars(data.calendars);

        me.taskStore.rootNode.appendChild(
            ArrayHelper.asArray(data.tasks).map(me.processTask)[0]?.children
        );

        me.importResources(data.resources);
        me.importAssignments(data.assignments);
        me.importDependencies(data.dependencies);
        me.importProject(data.project);

        // Assign project to Gantt before commit
        me.gantt.project = project;

        await project.commitAsync();

        me.importColumns(data.columns);

        return project;
    }

    // Resources
    importResources(resources) {
        this.resourceStore.add(resources.map(this.processResource));
    }

    processResource(resourceData) {
        const { id } = resourceData;
        delete resourceData.id;

        resourceData.calendar = this.calendarMap[resourceData.calendar];

        const resource = new this.resourceStore.modelClass(resourceData);
        this.resourceMap[id] = resource;

        return resource;
    }

    // Dependencies
    importDependencies(dependencies) {
        this.dependencyStore.add(dependencies.map(this.processDependency));
    }

    processDependency(dependencyData) {
        const me = this;
        const { fromEvent, toEvent } = dependencyData;

        delete dependencyData.id;

        const dep = new me.dependencyStore.modelClass(dependencyData);
        dep.fromEvent = me.taskMap[fromEvent].id;
        dep.toEvent = me.taskMap[toEvent].id;

        return dep;
    }

    // Assignments
    importAssignments(assignments) {
        this.assignmentStore.add(assignments.map(this.processAssignment));
    }

    processAssignment(assignmentData) {
        const me = this;
        delete assignmentData.id;

        return new me.assignmentStore.modelClass({
            units    : assignmentData.units,
            event    : me.taskMap[assignmentData.event],
            resource : me.resourceMap[assignmentData.resource]
        });
    }

    // Tasks (recursive)
    processTask(taskData) {
        const me = this;
        const { id, children } = taskData;

        delete taskData.children;
        delete taskData.id;
        delete taskData.milestone;

        taskData.calendar = me.calendarMap[taskData.calendar];

        const t = new me.taskStore.modelClass(taskData);

        if (children) {
            t.appendChild(children.map(me.processTask));
        }

        t._importedId = id;
        me.taskMap[id] = t;

        return t;
    }

    // Calendars (recursive)
    processCalendar(data) {
        const me = this;
        const { id, children, intervals } = data;

        delete data.children;
        delete data.id;

        const t = new me.calendarManager.modelClass(
            Object.assign(data, { intervals })
        );

        if (children) {
            t.appendChild(children.map(me.processCalendar.bind(me)));
        }

        t._importedId = id;
        me.calendarMap[id] = t;

        return t;
    }

    importCalendars(calendars) {
        this.calendarManager.add(
            calendars.children.map(this.processCalendar.bind(this))
        );
    }

    // Columns
    importColumns(columns) {
        columns = columns.flatMap(this.processColumn);
        columns = columns.length ? columns : this.defaultColumns || [];

        if (columns.length) {
            const columnStore = this.gantt.subGrids.locked.columns;
            columnStore.removeAll(true);
            columnStore.add(columns);
        }
    }

    processColumn(data) {
        const columnClass = this.gantt.columns.constructor.getColumnClass(data.type);

        if (columnClass) {
            return Object.assign({ region : 'locked' }, data);
        }

        return [];
    }

    importProject(project) {
        if ('calendar' in project) {
            project.calendar = this.calendarMap[project.calendar];
        }
        Object.assign(this.project, project);
    }
}
```

### Gantt met File Drop Import

```typescript
const gantt = new Gantt({
    appendTo  : 'container',
    emptyText : 'Drop a project file here to import it',

    features : {
        baselines : true,
        // Enable file drop for import
        fileDrop  : true
    },

    tbar : [
        {
            type         : 'filepicker',
            ref          : 'input',
            buttonConfig : {
                text : 'Pick a project file',
                icon : 'fa-folder-open'
            },
            fileFieldConfig : {
                // Restrict to certain files
                // accept : '.mpp'
            },
            listeners : {
                change : ({ files }) => {
                    sendBtn.disabled = files.length === 0;
                },
                clear : () => {
                    sendBtn.disable();
                }
            }
        },
        {
            type     : 'button',
            ref      : 'sendBtn',
            text     : 'Import data',
            icon     : 'fa-file-import',
            disabled : true,
            onClick  : 'up.onImportButtonClick'
        },
        {
            type   : 'button',
            href   : 'sampleproject.mpp',
            target : '_blank',
            text   : 'Download sample MPP',
            icon   : 'fa-file-download'
        }
    ],

    // Handle file drop
    onFileDrop({ file }) {
        this.importFile(file);
    },

    onImportButtonClick() {
        const { files } = this.widgetMap.input;
        if (files) {
            this.importFile(files[0]);
        }
    },

    async importFile(file) {
        const formData = new FormData();
        formData.append('mpp-file', file);

        gantt.maskBody('Importing project ...');

        try {
            const { parsedJson } = await AjaxHelper.post(
                'php/load.php',
                formData,
                { parseJson : true }
            );

            if (parsedJson.success && parsedJson.data) {
                const { project } = gantt;

                // Import and create new project
                await importer.importData(parsedJson.data);

                // Destroy old project
                project.destroy();

                // Set view to new project start
                gantt.setStartDate(gantt.project.startDate);
                await gantt.scrollToDate(gantt.project.startDate, { block : 'start' });

                gantt.widgetMap.input.clear();
                gantt.unmaskBody();

                Toast.show('File imported successfully!');
            }
            else {
                onError(`Import error: ${parsedJson.msg}`);
            }
        }
        catch (error) {
            onError(`Import error: ${error.error?.message || 'Import failed'}`);
        }
    }
});

const importer = new MSProjectImporter({
    gantt,
    defaultColumns : [
        { type : 'name', field : 'name', width : 250 },
        { type : 'addnew' }
    ]
});

function onError(text) {
    gantt.unmaskBody();
    console.error(text);
    Toast.show({
        html    : text,
        color   : 'b-red',
        style   : 'color:white',
        timeout : 3000
    });
}
```

---

## ICS Export (Calendar)

### Export naar iCalendar Format

```typescript
import { Calendar } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',

    features : {
        // ICS export configuratie
        icsExport : {
            // Include recurring events
            includeRecurrences : true,

            // Custom filename
            filename : 'my-calendar'
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Export to ICS',
            icon : 'fa-calendar-alt',
            onClick() {
                calendar.features.icsExport.export();
            }
        }
    ]
});
```

---

## Localization voor Export

### Vertaalde Export Labels

```typescript
import { LocaleManager, Localizable } from '@bryntum/gantt';

// Enable missing localization error throwing
LocaleManager.throwOnMissingLocale = true;

// Custom locale voor export
LocaleManager.registerLocale('nl', {
    PdfExport : {
        'Export to PDF' : 'Exporteren naar PDF',
        'Paper format'  : 'Papierformaat',
        'Orientation'   : 'Oriëntatie',
        'Portrait'      : 'Staand',
        'Landscape'     : 'Liggend'
    },
    ExcelExporter : {
        'Export to Excel' : 'Exporteren naar Excel'
    }
});

// Update UI when locale changes
function updateLocalization() {
    const title = Localizable().L('L{App.Export demo}');
    document.title = title;
}

LocaleManager.on('locale', updateLocalization);
```

---

## Print Feature

### Gantt Print Configuratie

```typescript
const gantt = new Gantt({
    appendTo : 'container',
    project,

    features : {
        print : {
            // Print range
            scheduleRange : 'currentview',

            // Include header/footer
            headerTpl : () => `<h1>${gantt.project.name}</h1>`,
            footerTpl : () => `<p>Printed: ${DateHelper.format(new Date(), 'LLL')}</p>`
        }
    },

    tbar : [
        {
            type : 'button',
            text : 'Print',
            icon : 'fa-print',
            onClick() {
                gantt.features.print.showPrintDialog();
            }
        }
    ]
});
```

---

## Export Server Setup

### Node.js Export Server

```javascript
// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.post('/export', async (req, res) => {
    const { html, options } = req.body;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil : 'networkidle0' });

    const pdf = await page.pdf({
        format      : options.paperFormat || 'A4',
        orientation : options.orientation || 'portrait',
        printBackground : true
    });

    await browser.close();

    res.contentType('application/pdf');
    res.send(pdf);
});

app.listen(8080, () => {
    console.log('Export server running on port 8080');
});
```

---

## Best Practices

### 1. Error Handling

```typescript
gantt.features.pdfExport.on({
    exportStep({ progress, text }) {
        updateProgressUI(progress, text);
    },
    error({ error }) {
        Toast.show({
            html    : `Export failed: ${error.message}`,
            color   : 'red',
            timeout : 5000
        });
    }
});
```

### 2. Custom Column Export

```typescript
columns : [
    {
        type  : 'name',
        field : 'name',
        // Custom export value
        exportValue : record => record.name.toUpperCase()
    },
    {
        type  : 'date',
        field : 'startDate',
        // Custom date format for export
        exportDateFormat : 'YYYY-MM-DD'
    }
]
```

### 3. Large Dataset Export

```typescript
// For large datasets, use streaming
gantt.features.excelExporter.export({
    filename : 'large-project',
    // Process in chunks
    chunkSize : 1000,
    onProgress({ processed, total }) {
        console.log(`Processed ${processed}/${total} rows`);
    }
});
```

---

## Gerelateerde Documenten

- [INTEGRATION-SHARED-PROJECT.md](./INTEGRATION-SHARED-PROJECT.md) - ProjectModel patterns
- [INTEGRATION-REALTIME.md](./INTEGRATION-REALTIME.md) - WebSocket synchronization
- [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) - React, Vue, Angular integratie
- [INTEGRATION-PERFORMANCE.md](./INTEGRATION-PERFORMANCE.md) - Big datasets, lazy loading
- [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md) - Data loading/saving

---

*Bryntum Suite 7.1.0 - Export & Import Integration*
