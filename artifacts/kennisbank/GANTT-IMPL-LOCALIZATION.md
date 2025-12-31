# Gantt Implementation: Localization

> **Localization** voor het vertalen van de Gantt interface naar verschillende talen.

---

## Overzicht

Bryntum Gantt ondersteunt volledige localisatie inclusief datumformaten en scheduling termen.

```
+--------------------------------------------------------------------------+
| GANTT                                    [EN 🇬🇧] [NL 🇳🇱] [DE 🇩🇪]        |
+--------------------------------------------------------------------------+
|  WBS   |  Naam           | Startdatum  | Duur      |        Tijdlijn    |
+--------------------------------------------------------------------------+
|  1     |  Project        | 15 jan 2024 | 30 dagen  |  ████████████████  |
|  1.1   |    Analyse      | 15 jan 2024 | 10 dagen  |  ██████            |
|  1.2   |    Ontwerp      | 25 jan 2024 | 15 dagen  |      ████████      |
+--------------------------------------------------------------------------+
|                                                                          |
|  LOCALIZED ELEMENTS:                                                     |
|    - Column headers (Naam, Startdatum, Duur)                            |
|    - Date formats (15 jan 2024)                                          |
|    - Duration units (dagen, weken, maanden)                              |
|    - Task editor labels                                                  |
|    - Context menu items                                                  |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Localization Setup

### 1.1 Enable Localization

```javascript
import { Gantt, ProjectModel, LocaleManager, Localizable } from '@bryntum/gantt';

// Enable missing localization Error throwing for development
LocaleManager.throwOnMissingLocale = true;

function updateLocalization() {
    const title = Localizable().L('L{App.Localization demo}');
    document.querySelector('#title').innerHTML = `<h1>${title}</h1>`;
    document.title = title;
}

// Add listener to update contents when locale changes
LocaleManager.on('locale', updateLocalization);

const project = new ProjectModel({
    autoSetConstraints: true,
    transport: {
        load: {
            url: 'data/tasks.json'
        }
    }
});

new Gantt({
    appendTo: 'container',
    project,
    dependencyIdField: 'wbsCode',

    columns: [
        { type: 'wbs' },
        { type: 'name', field: 'name', width: 250 },
        { type: 'startdate' },
        { type: 'enddate' },
        { type: 'duration' }
    ]
});

project.load();
updateLocalization();
```

---

## 2. Creating Custom Locales

### 2.1 Dutch Locale for Gantt

```javascript
// locales/gantt-nl.js
const locale = {
    localeName: 'Nl',
    localeDesc: 'Nederlands',
    localeCode: 'nl',

    // Application specific
    App: {
        'Localization demo': 'Lokalisatie demo'
    },

    // Date formatting
    DateHelper: {
        locale: 'nl-NL',
        weekStartDay: 1,  // Monday
        unitNames: [
            { single: 'milliseconde', plural: 'milliseconden', abbrev: 'ms' },
            { single: 'seconde', plural: 'seconden', abbrev: 's' },
            { single: 'minuut', plural: 'minuten', abbrev: 'min' },
            { single: 'uur', plural: 'uren', abbrev: 'u' },
            { single: 'dag', plural: 'dagen', abbrev: 'd' },
            { single: 'week', plural: 'weken', abbrev: 'w' },
            { single: 'maand', plural: 'maanden', abbrev: 'mnd' },
            { single: 'kwartaal', plural: 'kwartalen', abbrev: 'kw' },
            { single: 'jaar', plural: 'jaren', abbrev: 'j' }
        ]
    },

    // Gantt specific
    Gantt: {
        'Add': 'Toevoegen',
        'Delete': 'Verwijderen',
        'Edit': 'Bewerken',
        'Task': 'Taak',
        'Milestone': 'Mijlpaal',
        'Parent task': 'Hoofdtaak',
        'Child task': 'Subtaak'
    },

    // Column headers
    NameColumn: {
        'Name': 'Naam'
    },

    StartDateColumn: {
        'Start': 'Start'
    },

    EndDateColumn: {
        'Finish': 'Einde'
    },

    DurationColumn: {
        'Duration': 'Duur'
    },

    // Task editor
    TaskEditor: {
        'General': 'Algemeen',
        'Name': 'Naam',
        'Start': 'Start',
        'Finish': 'Einde',
        'Duration': 'Duur',
        '% Complete': '% Voltooid',
        'Notes': 'Notities',
        'Predecessors': 'Voorgangers',
        'Successors': 'Opvolgers',
        'Advanced': 'Geavanceerd',
        'Save': 'Opslaan',
        'Cancel': 'Annuleren',
        'Delete': 'Verwijderen'
    },

    // Context menu
    TaskMenu: {
        'Edit task': 'Taak bewerken',
        'Delete task': 'Taak verwijderen',
        'Add': 'Toevoegen',
        'Task above': 'Taak erboven',
        'Task below': 'Taak eronder',
        'Subtask': 'Subtaak',
        'Milestone': 'Mijlpaal'
    },

    // Dependencies
    DependencyType: {
        'Start-to-Start': 'Start-naar-Start',
        'Start-to-Finish': 'Start-naar-Einde',
        'Finish-to-Start': 'Einde-naar-Start',
        'Finish-to-Finish': 'Einde-naar-Einde'
    }
};

export default locale;
```

---

## 3. React Integration

```jsx
import { BryntumGantt } from '@bryntum/gantt-react';
import { LocaleManager, LocaleHelper, Localizable } from '@bryntum/gantt';
import { useState, useEffect, useMemo, useCallback } from 'react';

// Import locales
import nlLocale from './locales/gantt-nl';
import deLocale from './locales/gantt-de';

// Register locales
LocaleHelper.publishLocale(nlLocale);
LocaleHelper.publishLocale(deLocale);

const LOCALES = [
    { code: 'En', name: 'English', flag: '🇬🇧' },
    { code: 'Nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'De', name: 'Deutsch', flag: '🇩🇪' }
];

function LocalizedGantt({ projectData }) {
    const [currentLocale, setCurrentLocale] = useState('En');
    const [title, setTitle] = useState('');

    useEffect(() => {
        const updateTitle = () => {
            setTitle(Localizable().L('L{App.Gantt Demo}'));
        };

        LocaleManager.on('locale', updateTitle);
        updateTitle();

        return () => {
            LocaleManager.un('locale', updateTitle);
        };
    }, []);

    const handleLocaleChange = useCallback((localeCode) => {
        setCurrentLocale(localeCode);
        LocaleManager.applyLocale(localeCode);
    }, []);

    const ganttConfig = useMemo(() => ({
        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'percentdone' }
        ],

        features: {
            taskEdit: true,
            taskMenu: true
        }
    }), []);

    return (
        <div className="localized-gantt">
            <div className="toolbar">
                <h1>{title}</h1>
                <div className="locale-switcher">
                    {LOCALES.map(locale => (
                        <button
                            key={locale.code}
                            className={currentLocale === locale.code ? 'active' : ''}
                            onClick={() => handleLocaleChange(locale.code)}
                        >
                            {locale.flag} {locale.name}
                        </button>
                    ))}
                </div>
            </div>

            <BryntumGantt
                project={projectData}
                {...ganttConfig}
            />
        </div>
    );
}
```

---

## 4. Date and Duration Formatting

### 4.1 Localized Date Formats

```javascript
const locale = {
    DateHelper: {
        locale: 'nl-NL',
        weekStartDay: 1,

        // Date format patterns
        formats: {
            'L': 'DD-MM-YYYY',
            'LL': 'D MMMM YYYY',
            'LT': 'HH:mm',
            'LLL': 'D MMMM YYYY HH:mm'
        },

        // Month names
        monthNames: [
            'januari', 'februari', 'maart', 'april', 'mei', 'juni',
            'juli', 'augustus', 'september', 'oktober', 'november', 'december'
        ],

        // Short month names
        shortMonthNames: [
            'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
            'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
        ],

        // Day names
        dayNames: [
            'zondag', 'maandag', 'dinsdag', 'woensdag',
            'donderdag', 'vrijdag', 'zaterdag'
        ],

        // Short day names
        shortDayNames: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
    }
};
```

---

## 5. Styling

```css
/* Locale switcher */
.locale-switcher {
    display: flex;
    gap: 8px;
}

.locale-switcher button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.locale-switcher button.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.locale-switcher button:hover:not(.active) {
    background: #f5f5f5;
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.toolbar h1 {
    margin: 0;
    font-size: 18px;
}

/* RTL support for Arabic/Hebrew */
.b-rtl .b-gantt-task-bar {
    direction: rtl;
}

.b-rtl .b-grid-headers {
    direction: rtl;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Datums niet vertaald | DateHelper locale mist | Voeg DateHelper config toe |
| Duur in Engels | unitNames niet gedefinieerd | Voeg unitNames array toe |
| Menu niet vertaald | TaskMenu/TaskEditor locale mist | Voeg menu translations toe |
| Runtime error | throwOnMissingLocale: true | Voeg ontbrekende keys toe |

---

## API Reference

### LocaleManager Methods

| Method | Description |
|--------|-------------|
| `applyLocale(code)` | Apply locale by code |
| `on('locale', fn)` | Listen for locale changes |

### Gantt Locale Structure

| Section | Content |
|---------|---------|
| `DateHelper` | Date formats and names |
| `Gantt` | General Gantt strings |
| `TaskEditor` | Task editor labels |
| `TaskMenu` | Context menu items |
| `NameColumn` etc. | Column headers |

### Duration Units

| Index | English | Dutch |
|-------|---------|-------|
| 0 | millisecond | milliseconde |
| 1 | second | seconde |
| 2 | minute | minuut |
| 3 | hour | uur |
| 4 | day | dag |
| 5 | week | week |
| 6 | month | maand |
| 7 | quarter | kwartaal |
| 8 | year | jaar |

---

## Bronnen

- **Example**: `examples/localization/`
- **LocaleManager**: `Core.localization.LocaleManager`
- **DateHelper**: `Core.helper.DateHelper`

---

*Priority 2: Medium Priority Features*
