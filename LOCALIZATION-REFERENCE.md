# Bryntum Localization Reference

> **Bron**: Officiële Bryntum Gantt v7.1.0 locale files - `build/locales/`

---

## Ondersteunde Talen (45)

| Code | Taal | Locale File |
|------|------|-------------|
| `Ar` | Arabic | gantt.locale.Ar.js |
| `Bg` | Bulgarian | gantt.locale.Bg.js |
| `Ca` | Catalan | gantt.locale.Ca.js |
| `Cs` | Czech | gantt.locale.Cs.js |
| `Da` | Danish | gantt.locale.Da.js |
| `De` | German | gantt.locale.De.js |
| `El` | Greek | gantt.locale.El.js |
| `En` | English (US) | gantt.locale.En.js |
| `EnGb` | English (UK) | gantt.locale.EnGb.js |
| `Es` | Spanish | gantt.locale.Es.js |
| `Et` | Estonian | gantt.locale.Et.js |
| `Eu` | Basque | gantt.locale.Eu.js |
| `Fi` | Finnish | gantt.locale.Fi.js |
| `FrFr` | French | gantt.locale.FrFr.js |
| `Gl` | Galician | gantt.locale.Gl.js |
| `He` | Hebrew | gantt.locale.He.js |
| `Hi` | Hindi | gantt.locale.Hi.js |
| `Hr` | Croatian | gantt.locale.Hr.js |
| `Hu` | Hungarian | gantt.locale.Hu.js |
| `Id` | Indonesian | gantt.locale.Id.js |
| `It` | Italian | gantt.locale.It.js |
| `Ja` | Japanese | gantt.locale.Ja.js |
| `Kk` | Kazakh | gantt.locale.Kk.js |
| `Ko` | Korean | gantt.locale.Ko.js |
| `Lt` | Lithuanian | gantt.locale.Lt.js |
| `Lv` | Latvian | gantt.locale.Lv.js |
| `Ms` | Malay | gantt.locale.Ms.js |
| `Nl` | Dutch | gantt.locale.Nl.js |
| `No` | Norwegian | gantt.locale.No.js |
| `Pl` | Polish | gantt.locale.Pl.js |
| `Pt` | Portuguese | gantt.locale.Pt.js |
| `PtBr` | Portuguese (Brazil) | gantt.locale.PtBr.js |
| `Ro` | Romanian | gantt.locale.Ro.js |
| `Ru` | Russian | gantt.locale.Ru.js |
| `Sk` | Slovak | gantt.locale.Sk.js |
| `Sl` | Slovenian | gantt.locale.Sl.js |
| `Sr` | Serbian | gantt.locale.Sr.js |
| `SrRs` | Serbian (Cyrillic) | gantt.locale.SrRs.js |
| `SvSE` | Swedish | gantt.locale.SvSE.js |
| `Th` | Thai | gantt.locale.Th.js |
| `Tr` | Turkish | gantt.locale.Tr.js |
| `Uk` | Ukrainian | gantt.locale.Uk.js |
| `Vi` | Vietnamese | gantt.locale.Vi.js |
| `ZhCn` | Chinese (Simplified) | gantt.locale.ZhCn.js |
| `ZhTw` | Chinese (Traditional) | gantt.locale.ZhTw.js |

---

## Locale Laden

### Via Script Tag

```html
<script src="gantt.module.js"></script>
<script src="locales/gantt.locale.Nl.js"></script>
```

### Via Import (ES6)

```javascript
import '../locales/gantt.locale.Nl.js';
```

### Via NPM

```javascript
import '@bryntum/gantt/locales/gantt.locale.Nl.js';
```

### Runtime Switching

```javascript
import { LocaleHelper } from '@bryntum/gantt';

// Switch locale
LocaleHelper.locale = 'Nl';
```

---

## Locale Structuur Categorieën

### Core Object Strings

```javascript
Object: {
    Yes: "Yes",
    No: "No",
    Cancel: "Cancel",
    Ok: "OK",
    Week: "Week",
    None: "None",
    Save: "Save",
    close: "Close",
    go: "Go",
    today: "Today"
}
```

### Grid Strings

```javascript
GridBase: {
    loadMask: "Loading...",
    syncMask: "Saving changes, please wait...",
    loadFailedMessage: "Data loading failed!",
    noRows: "No records to display"
}

CellMenu: {
    removeRow: "Delete"
}

ColumnPicker: {
    column: "Column",
    columnsMenu: "Columns",
    hideColumn: "Hide column"
}
```

### Filter Strings

```javascript
Filter: {
    applyFilter: "Apply filter",
    filter: "Filter",
    editFilter: "Edit filter",
    removeFilter: "Remove filter",
    equals: "Equals",
    lessThan: "Less than",
    moreThan: "More than"
}

FilterBar: {
    enableFilterBar: "Show filter bar",
    disableFilterBar: "Hide filter bar"
}
```

### Date Helper Strings

```javascript
DateHelper: {
    locale: "en-US",
    weekStartDay: 0,
    nonWorkingDays: { 0: true, 6: true },
    weekends: { 0: true, 6: true },
    unitNames: [
        { single: "millisecond", plural: "ms", abbrev: "ms" },
        { single: "second", plural: "seconds", abbrev: "s" },
        { single: "minute", plural: "minutes", abbrev: "min" },
        { single: "hour", plural: "hours", abbrev: "h" },
        { single: "day", plural: "days", abbrev: "d" },
        { single: "week", plural: "weeks", abbrev: "w" },
        { single: "month", plural: "months", abbrev: "mon" },
        { single: "year", plural: "years", abbrev: "yr" }
    ],
    parsers: {
        L: "MM/DD/YYYY",
        LT: "HH:mm A",
        LTS: "HH:mm:ss A"
    }
}
```

### Scheduler/Gantt Strings

```javascript
DependencyType: {
    SS: "SS",
    SF: "SF",
    FS: "FS",
    FF: "FF",
    long: ["Start-to-Start", "Start-to-Finish", "Finish-to-Start", "Finish-to-Finish"]
}

DependencyEdit: {
    From: "From",
    To: "To",
    Type: "Type",
    Lag: "Lag",
    "Edit dependency": "Edit dependency",
    Save: "Save",
    Delete: "Delete"
}

EventEdit: {
    Name: "Name",
    Resource: "Resource",
    Start: "Start",
    End: "End",
    Save: "Save",
    Delete: "Delete"
}
```

### Gantt Specific Strings

```javascript
Gantt: {
    Edit: "Edit",
    Indent: "Indent",
    Outdent: "Outdent",
    "Convert to milestone": "Convert to milestone",
    Add: "Add...",
    "New task": "New task",
    "New milestone": "New milestone",
    "Task above": "Task above",
    "Task below": "Task below",
    "Delete task": "Delete"
}

TaskEditorBase: {
    Information: "Task information",
    Save: "Save",
    Cancel: "Cancel",
    Delete: "Delete"
}

GeneralTab: {
    General: "General",
    Name: "Name",
    "% complete": "% complete",
    Duration: "Duration",
    Start: "Start",
    Finish: "Finish",
    Effort: "Effort"
}

AdvancedTab: {
    Advanced: "Advanced",
    Calendar: "Calendar",
    "Scheduling mode": "Scheduling mode",
    "Effort driven": "Effort driven",
    "Manually scheduled": "Manually scheduled",
    "Constraint type": "Constraint type",
    "Constraint date": "Constraint date"
}

DependencyTab: {
    Predecessors: "Predecessors",
    Successors: "Successors",
    ID: "ID",
    Name: "Name",
    Type: "Type",
    Lag: "Lag"
}
```

### Column Headers

```javascript
NameColumn: { Name: "Name" }
StartDateColumn: { Start: "Start" }
EndDateColumn: { Finish: "Finish" }
DurationColumn: { Duration: "Duration" }
PercentDoneColumn: { "% Done": "% Done" }
PredecessorColumn: { Predecessors: "Predecessors" }
SuccessorColumn: { Successors: "Successors" }
WBSColumn: { WBS: "WBS", renumber: "Renumber" }
CalendarColumn: { Calendar: "Calendar" }
EffortColumn: { Effort: "Effort" }
MilestoneColumn: { Milestone: "Milestone" }
```

### Constraint Types

```javascript
ConstraintTypePicker: {
    none: "None",
    assoonaspossible: "As soon as possible",
    aslateaspossible: "As late as possible",
    muststarton: "Must start on",
    mustfinishon: "Must finish on",
    startnoearlierthan: "Start no earlier than",
    startnolaterthan: "Start no later than",
    finishnoearlierthan: "Finish no earlier than",
    finishnolaterthan: "Finish no later than"
}
```

### Calendar Editor

```javascript
CalendarEditor: {
    daysAreWorkingByDefault: "Days are working by default",
    workingTimeCalendar: "Working time calendar",
    exceptions: "Exceptions",
    general: "General",
    name: "Name",
    parent: "Parent",
    save: "Save",
    weeks: "Weeks",
    error: "Error",
    delete: "Delete",
    addCalendar: "Add a calendar"
}
```

### Recurrence Strings

```javascript
RecurrenceEditor: {
    "Repeat event": "Repeat event",
    Frequency: "Frequency",
    Every: "Every",
    "End repeat": "End repeat"
}

RecurrenceFrequencyCombo: {
    None: "No repeat",
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly",
    Yearly: "Yearly"
}

RecurrenceLegend: {
    Daily: "Daily",
    "Weekly on {1}": ({ days }) => `Weekly on ${days}`,
    "Monthly on {1}": ({ days }) => `Monthly on ${days}`,
    "Every {0} days": ({ interval }) => `Every ${interval} days`
}
```

### Export Strings

```javascript
PdfExport: {
    "Waiting for response from server": "Waiting for response from server...",
    "Export failed": "Export failed",
    "Server error": "Server error",
    "Generating pages": "Generating pages..."
}

ExportDialog: {
    exportSettings: "Export settings",
    export: "Export",
    fileFormat: "File format",
    rows: "Rows",
    columns: "Columns",
    paperFormat: "Paper format",
    orientation: "Orientation"
}
```

### Scheduling Conflict Resolution

```javascript
CycleEffectDescription: {
    descriptionTpl: "A cycle has been found, formed by: {0}"
}

ConflictEffectDescription: {
    descriptionTpl: "A scheduling conflict has been found: {0} is conflicting with {1}"
}

SchedulingIssueResolutionPopup: {
    "Cancel changes": "Cancel the change and do nothing",
    schedulingConflict: "Scheduling conflict",
    Apply: "Apply"
}
```

---

## Custom Locale Maken

### Stap 1: Base Locale Importeren

```javascript
import { LocaleHelper } from '@bryntum/gantt';
import EnLocale from '@bryntum/gantt/locales/gantt.locale.En.js';
```

### Stap 2: Custom Strings Toevoegen

```javascript
const myLocale = LocaleHelper.mergeLocales(EnLocale, {
    localeName: 'CustomEn',
    localeDesc: 'Custom English',

    Gantt: {
        'New task': 'Create New Task',
        'Delete task': 'Remove Task'
    },

    GeneralTab: {
        General: 'Task Properties',
        Name: 'Task Name'
    }
});
```

### Stap 3: Registreren

```javascript
LocaleHelper.publishLocale(myLocale);
LocaleHelper.locale = 'CustomEn';
```

---

## RTL Talen

De volgende talen ondersteunen Right-to-Left (RTL):

| Code | Taal |
|------|------|
| `Ar` | Arabic |
| `He` | Hebrew |

RTL wordt automatisch geactiveerd via `localeRtl: true` in de locale definitie.

---

## Locale API

### LocaleHelper Methods

```javascript
import { LocaleHelper } from '@bryntum/gantt';

// Huidige locale ophalen
const current = LocaleHelper.locale;

// Locale wijzigen
LocaleHelper.locale = 'De';

// Locales mergen
const merged = LocaleHelper.mergeLocales(locale1, locale2);

// Locale publiceren
LocaleHelper.publishLocale(myLocale);

// Alle beschikbare locales
const allLocales = LocaleHelper.locales;
```

### Locale Properties

```javascript
{
    localeName: 'En',           // Interne naam
    localeDesc: 'English (US)', // Beschrijving
    localeCode: 'en-US',        // BCP 47 code
    localeRtl: false            // RTL support
}
```

---

## Best Practices

1. **Laad locale voor component initialisatie**
   ```javascript
   import '../locales/gantt.locale.Nl.js';
   // Dan pas Gantt component laden
   ```

2. **Gebruik locale code voor DateHelper**
   ```javascript
   DateHelper: {
       locale: 'nl-NL',  // BCP 47 code voor correcte datum formatting
   }
   ```

3. **Pas weekStartDay aan per regio**
   ```javascript
   DateHelper: {
       weekStartDay: 1  // 0=Sunday, 1=Monday
   }
   ```

4. **Definieer nonWorkingDays per cultuur**
   ```javascript
   DateHelper: {
       nonWorkingDays: { 5: true, 6: true }  // Vrijdag-Zaterdag (Arabisch)
   }
   ```

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
