# TaskBoard Localization & RTL - Implementation Guide

> **Uitgebreide documentatie** voor internationalisatie, localization, en right-to-left (RTL) ondersteuning in Bryntum TaskBoard.

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Beschikbare Locales](#beschikbare-locales)
3. [Locale Laden](#locale-laden)
4. [LocaleManager API](#localemanager-api)
5. [L() Functie en String Templates](#l-functie-en-string-templates)
6. [Custom Locales](#custom-locales)
7. [Localizable Mixin](#localizable-mixin)
8. [RTL Ondersteuning](#rtl-ondersteuning)
9. [Date & Number Formatting](#date--number-formatting)
10. [TypeScript Interfaces](#typescript-interfaces)
11. [Dynamic Locale Switching](#dynamic-locale-switching)
12. [Best Practices](#best-practices)

---

## Overzicht

Bryntum TaskBoard ondersteunt volledige internationalisatie via het LocaleManager systeem. Dit omvat:
- 30+ voorgedefinieerde talen
- RTL (right-to-left) ondersteuning voor Arabisch, Hebreeuws, etc.
- Dynamische locale switching zonder page reload
- Date/time/number formatting per locale
- Custom locale strings toevoegen

### Architectuur

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Localization System                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     LocaleManager                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │   locale    │  │   locales   │  │  throwOnMissing     │   │  │
│  │  │ (current)   │  │  (registry) │  │  Locale             │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘   │  │
│  │         │                │                                    │  │
│  │         └────────────────┼────────────────────────────────┐  │  │
│  │                          │                                │  │  │
│  │                 ┌────────▼────────┐                       │  │  │
│  │                 │  applyLocale()  │                       │  │  │
│  │                 └────────┬────────┘                       │  │  │
│  └──────────────────────────┼────────────────────────────────┘  │  │
│                             │                                    │  │
│  ┌──────────────────────────▼────────────────────────────────┐  │  │
│  │                  LocaleHelper                              │  │  │
│  │  ┌─────────────────┐  ┌─────────────┐  ┌───────────────┐  │  │  │
│  │  │ publishLocale() │  │ mergeLocales│  │ normalizeLocale│ │  │  │
│  │  └─────────────────┘  └─────────────┘  └───────────────┘  │  │  │
│  └───────────────────────────────────────────────────────────┘  │  │
│                                                                  │  │
│  ┌───────────────────────────────────────────────────────────┐  │  │
│  │                  Localizable Mixin                         │  │  │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐  │  │  │
│  │  │    L()       │  │localizableProps │  │updateLocale  │  │  │  │
│  │  │  (translate) │  │                 │  │  ation()     │  │  │  │
│  │  └──────────────┘  └─────────────────┘  └──────────────┘  │  │  │
│  └───────────────────────────────────────────────────────────┘  │  │
│                                                                  │  │
└──────────────────────────────────────────────────────────────────┘  │

                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Locale Files                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│  │ En.js     │ │ De.js     │ │ FrFr.js   │ │ Ar.js     │  ...      │
│  │ (default) │ │ (German)  │ │ (French)  │ │ (Arabic)  │           │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Beschikbare Locales

### Voorgedefinieerde Locales (30+)

| Locale Code | Naam | Beschrijving | RTL |
|-------------|------|--------------|-----|
| `En` | English (US) | Default locale | No |
| `EnGb` | English (UK) | British English | No |
| `De` | Deutsch | German | No |
| `FrFr` | Français | French | No |
| `Es` | Español | Spanish | No |
| `It` | Italiano | Italian | No |
| `Nl` | Nederlands | Dutch | No |
| `Pl` | Polski | Polish | No |
| `Pt` | Português | Portuguese | No |
| `Ru` | Русский | Russian | No |
| `SvSE` | Svenska | Swedish | No |
| `Ja` | 日本語 | Japanese | No |
| `Ko` | 한국어 | Korean | No |
| `ZhCn` | 简体中文 | Chinese (Simplified) | No |
| `Ar` | العربية | Arabic | **Yes** |
| `He` | עברית | Hebrew | **Yes** |
| `Fa` | فارسی | Persian/Farsi | **Yes** |
| `Bg` | Български | Bulgarian | No |
| `Ca` | Català | Catalan | No |
| `Cs` | Čeština | Czech | No |
| `Da` | Dansk | Danish | No |
| `El` | Ελληνικά | Greek | No |
| `Et` | Eesti | Estonian | No |
| `Eu` | Euskara | Basque | No |
| `Fi` | Suomi | Finnish | No |
| `Gl` | Galego | Galician | No |
| `Hi` | हिन्दी | Hindi | No |
| `Hr` | Hrvatski | Croatian | No |
| `Hu` | Magyar | Hungarian | No |
| `Id` | Bahasa Indonesia | Indonesian | No |
| `Lt` | Lietuvių | Lithuanian | No |
| `Lv` | Latviešu | Latvian | No |
| `Ms` | Bahasa Melayu | Malay | No |
| `Ro` | Română | Romanian | No |
| `Sk` | Slovenčina | Slovak | No |
| `Sl` | Slovenščina | Slovenian | No |
| `Sr` | Српски | Serbian | No |
| `Th` | ไทย | Thai | No |
| `Tr` | Türkçe | Turkish | No |
| `Uk` | Українська | Ukrainian | No |
| `Vi` | Tiếng Việt | Vietnamese | No |

### Locale Bestandsnamen

```
taskboard.locale.En.js
taskboard.locale.De.js
taskboard.locale.FrFr.js
taskboard.locale.Ar.js
...
```

---

## Locale Laden

### Statisch Laden (Build Time)

```javascript
// Via ES6 import
import '../build/locales/taskboard.locale.De.js';
import '../build/locales/taskboard.locale.FrFr.js';

import { TaskBoard, LocaleManager } from '@bryntum/taskboard';

// Apply locale
LocaleManager.locale = 'De';

const taskBoard = new TaskBoard({
    // ...
});
```

### Via Script Tag

```html
<!DOCTYPE html>
<html>
<head>
    <!-- TaskBoard CSS -->
    <link rel="stylesheet" href="build/taskboard.stockholm.css">

    <!-- Locale bestanden -->
    <script src="build/locales/taskboard.locale.De.js"></script>
    <script src="build/locales/taskboard.locale.FrFr.js"></script>

    <!-- TaskBoard -->
    <script src="build/taskboard.umd.js"></script>
</head>
<body>
    <script>
        // Apply locale voor TaskBoard creatie
        bryntum.LocaleManager.locale = 'De';

        const taskBoard = new bryntum.TaskBoard({
            // ...
        });
    </script>
</body>
</html>
```

### Dynamisch Laden

```javascript
import { LocaleManager, AjaxHelper } from '@bryntum/taskboard';

async function loadLocale(localeName) {
    try {
        // Dynamisch laden
        await import(`../build/locales/taskboard.locale.${localeName}.js`);

        // Apply
        LocaleManager.locale = localeName;

        console.log(`Loaded locale: ${localeName}`);
    } catch (error) {
        console.error(`Failed to load locale: ${localeName}`, error);
    }
}

// Gebruik
loadLocale('De');
```

### Met LocaleManager.applyLocale()

```javascript
import { LocaleManager } from '@bryntum/taskboard';

// Async locale laden en toepassen
async function switchLocale(localeName) {
    await LocaleManager.applyLocale(localeName, {
        // Locale bestand pad
        localePath: `locales/taskboard.locale.${localeName}.js`
    });
}

// Met promise
LocaleManager.applyLocale('De').then(() => {
    console.log('German locale applied');
});
```

---

## LocaleManager API

### Singleton Instance

```javascript
import { LocaleManager } from '@bryntum/taskboard';

// Huidige locale opvragen
console.log(LocaleManager.locale);  // 'En' (default)

// Beschikbare locales
console.log(LocaleManager.locales);
// {
//   En: { localeName: 'En', localeDesc: 'English (US)', ... },
//   De: { localeName: 'De', localeDesc: 'Deutsch', ... },
//   ...
// }

// Locale wijzigen
LocaleManager.locale = 'De';
```

### Events

```javascript
// Luister naar locale wijzigingen
LocaleManager.on('locale', ({ locale, oldLocale }) => {
    console.log(`Locale changed: ${oldLocale} → ${locale.localeName}`);

    // Update document direction voor RTL
    document.documentElement.dir = locale.localeRtl ? 'rtl' : 'ltr';

    // Update document lang attribute
    document.documentElement.lang = locale.localeCode;
});
```

### Methodes

```javascript
// Apply locale async
await LocaleManager.applyLocale('De');

// Apply locale met options
await LocaleManager.applyLocale('De', {
    localePath: 'custom/path/locale.De.js',
    fetch: {
        credentials: 'include'
    }
});

// Extend bestaande locale
LocaleManager.extendLocale('De', {
    TaskBoard: {
        myCustomKey: 'Mein Custom Text'
    }
});
```

---

## L() Functie en String Templates

### Basis Gebruik

```javascript
import { Localizable } from '@bryntum/taskboard';

// Standalone L() functie
const L = Localizable().L;

// Vertaal string
const text = L('L{TaskBoard.addTask}');  // "Add task" (En) / "Aufgabe hinzufügen" (De)
```

### In Widgets en Components

```javascript
const taskBoard = new TaskBoard({
    // L{} syntax in config strings
    features: {
        columnToolbars: {
            bottomItems: {
                addTask: {
                    // Automatisch vertaald
                    text: 'L{TaskBoard.addTask}'
                }
            }
        }
    },

    tbar: [
        {
            type: 'button',
            // Automatisch vertaald
            text: 'L{Object.save}'
        }
    ]
});
```

### Template Strings met Variabelen

```javascript
// In locale bestand
const locale = {
    TaskBoard: {
        // Functie voor dynamische strings
        itemCount: count => `${count} item${count !== 1 ? 's' : ''}`,

        // Template met placeholder
        taskInColumn: ({ task, column }) => `${task.name} is in ${column.text}`
    }
};

// Gebruik
const L = Localizable().L;

// Met functie
const text1 = L('L{TaskBoard.itemCount}', 5);  // "5 items"

// Met object
const text2 = L('L{TaskBoard.taskInColumn}', {
    task: { name: 'My Task' },
    column: { text: 'Done' }
});  // "My Task is in Done"
```

### Nested Keys

```javascript
// Locale structuur
const locale = {
    TaskBoard: {
        column: 'column',
        columns: 'columns',
        task: 'task',
        tasks: 'tasks',

        // Reference to andere key
        addTask: 'Add L{TaskBoard.task}',  // "Add task"
        filterColumns: 'Filter L{TaskBoard.columns}'  // "Filter columns"
    }
};
```

### StringHelper.xss voor Veilige Output

```javascript
import { StringHelper } from '@bryntum/taskboard';

// XSS protection voor user input
const safeHtml = StringHelper.xss`<span>${userInput}</span>`;

// In templates
bodyItems: {
    text: {
        type: 'template',
        template: ({ taskRecord }) =>
            StringHelper.xss`<span>${taskRecord.name}</span>`
    }
}
```

---

## Custom Locales

### Nieuwe Locale Toevoegen

```javascript
import { LocaleHelper } from '@bryntum/taskboard';

// Custom locale definitie
const customLocale = {
    localeName: 'NlBE',
    localeDesc: 'Nederlands (België)',
    localeCode: 'nl-BE',
    localeRtl: false,

    // Object strings
    Object: {
        Yes: 'Ja',
        No: 'Nee',
        Cancel: 'Annuleren',
        Ok: 'OK',
        save: 'Opslaan',
        close: 'Sluiten'
    },

    // TaskBoard specific
    TaskBoard: {
        column: 'kolom',
        columns: 'kolommen',
        Columns: 'Kolommen',
        swimlane: 'zwembaan',
        swimlanes: 'zwembanen',
        task: 'taak',
        tasks: 'taken',
        addTask: 'Taak toevoegen',
        editTask: 'Taak bewerken',
        removeTask: 'Taak verwijderen',
        newTaskName: 'Nieuwe taak',
        name: 'Naam',
        description: 'Beschrijving',
        color: 'Kleur',
        save: 'Opslaan',
        cancel: 'Annuleren'
    },

    // DateHelper
    DateHelper: {
        locale: 'nl-BE',
        weekStartDay: 1,  // Monday
        nonWorkingDays: {
            0: true,  // Sunday
            6: true   // Saturday
        },
        unitNames: [
            { single: 'milliseconde', plural: 'milliseconden', abbrev: 'ms' },
            { single: 'seconde', plural: 'seconden', abbrev: 's' },
            { single: 'minuut', plural: 'minuten', abbrev: 'min' },
            { single: 'uur', plural: 'uren', abbrev: 'u' },
            { single: 'dag', plural: 'dagen', abbrev: 'd' },
            { single: 'week', plural: 'weken', abbrev: 'w' },
            { single: 'maand', plural: 'maanden', abbrev: 'mnd' },
            { single: 'kwartaal', plural: 'kwartalen', abbrev: 'kw' },
            { single: 'jaar', plural: 'jaren', abbrev: 'jr' }
        ]
    }
};

// Publiceer de locale
LocaleHelper.publishLocale(customLocale);

// Nu beschikbaar
LocaleManager.locale = 'NlBE';
```

### Bestaande Locale Extenden

```javascript
import { LocaleManager, LocaleHelper } from '@bryntum/taskboard';
import '../build/locales/taskboard.locale.De.js';

// Extend German locale met custom strings
LocaleHelper.publishLocale('De', {
    // Voeg toe of overschrijf
    MyApp: {
        welcomeMessage: 'Willkommen bei der Anwendung',
        customButton: 'Klick mich'
    },

    TaskBoard: {
        // Overschrijf bestaande
        addTask: 'Neue Aufgabe erstellen',

        // Voeg nieuwe toe
        myCustomAction: 'Meine Aktion'
    }
});

// Of via LocaleManager
LocaleManager.extendLocale('De', {
    MyApp: {
        anotherString: 'Noch ein String'
    }
});
```

### Locale Bestand Structuur

```javascript
// locales/taskboard.locale.NlBE.js
(function(global) {
    const locale = {
        localeName: 'NlBE',
        localeDesc: 'Nederlands (België)',
        localeCode: 'nl-BE',
        localeRtl: false,

        Object: {
            // ...
        },

        TaskBoard: {
            // ...
        },

        // Alle andere sections...
    };

    // Publiceer
    if (typeof global.bryntum !== 'undefined') {
        global.bryntum.LocaleHelper.publishLocale(locale);
    }

    // CommonJS/ES6 export
    if (typeof module !== 'undefined') {
        module.exports = locale;
    }
})(typeof globalThis !== 'undefined' ? globalThis : window);
```

---

## Localizable Mixin

### Widget met Localization

```javascript
import { Widget, Localizable } from '@bryntum/taskboard';

class MyWidget extends Widget.mixin(Localizable) {

    static $name = 'MyWidget';
    static type = 'mywidget';

    // Definieer localizable properties
    static get configurable() {
        return {
            title: 'L{MyWidget.defaultTitle}',

            // Localizable properties lijst
            localizableProperties: ['title', 'tooltip']
        };
    }

    // Compose met L()
    compose() {
        return {
            tag: 'div',
            children: [
                {
                    tag: 'h1',
                    text: this.L('L{MyWidget.heading}')
                },
                {
                    tag: 'button',
                    text: this.L('L{Object.save}'),
                    onClick: () => this.save()
                }
            ]
        };
    }

    // Called wanneer locale wijzigt
    updateLocalization() {
        // Hercompose om nieuwe strings te tonen
        this.recompose();

        // Of manueel updaten
        this.title = this.L('L{MyWidget.title}');
    }
}

// Registreer widget type
MyWidget.initClass();

// Voeg strings toe aan locale
LocaleHelper.publishLocale('En', {
    MyWidget: {
        defaultTitle: 'My Widget',
        heading: 'Welcome',
        title: 'Widget Title'
    }
});
```

### TaskBoardLinked Mixin

```javascript
import { Widget, TaskBoardLinked, StringHelper, Localizable } from '@bryntum/taskboard';

class TeamMembers extends Widget.mixin(TaskBoardLinked, Localizable) {

    static $name = 'TeamMembers';
    static type = 'teammembers';

    afterConfigure() {
        super.afterConfigure();
        this.setTimeout('lateInit', 0);
    }

    lateInit() {
        // Bind aan resource store
        this.taskBoard.project.resourceStore.on({
            change: 'recompose',
            thisObj: this
        });
        this.recompose();
    }

    compose() {
        const { taskBoard } = this;

        if (taskBoard) {
            return {
                children: taskBoard.project.resourceStore.map(resource => {
                    // Localized tooltip
                    const tooltipText = StringHelper.xss`${this.L('L{Demo.teamMember}')} ${resource.name}`;

                    return {
                        tag: 'img',
                        src: taskBoard.resourceImagePath + resource.image,
                        alt: tooltipText,
                        dataset: { btip: tooltipText }
                    };
                })
            };
        }
    }

    // Update wanneer locale wijzigt
    updateLocalization() {
        this.recompose();
    }
}

TeamMembers.initClass();
```

---

## RTL Ondersteuning

### RTL Activeren

```javascript
import '../build/locales/taskboard.locale.Ar.js';  // Arabic
import { LocaleManager, TaskBoard } from '@bryntum/taskboard';

// Apply RTL locale
LocaleManager.locale = 'Ar';

// TaskBoard detecteert automatisch RTL
const taskBoard = new TaskBoard({
    appendTo: 'container',
    // RTL wordt automatisch toegepast
});
```

### Manuele RTL

```javascript
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Forceer RTL
    rtl: true
});
```

### CSS voor RTL

```css
/* Automatisch toegepast door Bryntum */
.b-rtl {
    direction: rtl;
}

/* Custom RTL styles */
.b-rtl .b-taskboard-column-header {
    text-align: right;
}

.b-rtl .b-taskboard-card {
    direction: rtl;
}

/* Flip icons */
.b-rtl .b-icon-arrow-right::before {
    transform: scaleX(-1);
}

/* Margin/padding adjustments */
.b-rtl .my-custom-element {
    margin-left: 0;
    margin-right: 1rem;
}
```

### Detecteren van RTL

```javascript
// Via locale
const isRtl = LocaleManager.locale.localeRtl;

// Via DOM
const isRtl = document.documentElement.dir === 'rtl';

// Via TaskBoard
const isRtl = taskBoard.rtl;

// Reageren op changes
LocaleManager.on('locale', ({ locale }) => {
    document.documentElement.dir = locale.localeRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale.localeCode;
});
```

### RTL-Aware Styling

```javascript
const taskBoard = new TaskBoard({
    taskRenderer({ taskRecord, cardConfig }) {
        const isRtl = this.rtl;

        cardConfig.class['custom-card'] = true;

        // RTL-aware positioning
        if (isRtl) {
            cardConfig.style = {
                'padding-right': '1rem',
                'text-align': 'right'
            };
        } else {
            cardConfig.style = {
                'padding-left': '1rem',
                'text-align': 'left'
            };
        }
    }
});
```

---

## Date & Number Formatting

### DateHelper Localization

```javascript
import { DateHelper } from '@bryntum/taskboard';

// Format met huidige locale
const formatted = DateHelper.format(new Date(), 'LL');
// En: "December 27, 2024"
// De: "27. Dezember 2024"
// Nl: "27 december 2024"

// Parse met locale
const parsed = DateHelper.parse('27/12/2024', 'DD/MM/YYYY');

// Relative time
const relative = DateHelper.formatDelta(86400000);  // 1 day
// En: "1 day"
// De: "1 Tag"
```

### NumberFormat

```javascript
// Locale-specific number formatting
const locale = {
    NumberFormat: {
        locale: 'de-DE',
        currency: 'EUR'
    }
};

// Gebruik
const formatter = new Intl.NumberFormat(locale.NumberFormat.locale, {
    style: 'currency',
    currency: locale.NumberFormat.currency
});

formatter.format(1234.56);  // "1.234,56 €"
```

### Custom Date Formats per Locale

```javascript
const locale = {
    localeName: 'NlBE',

    DateHelper: {
        locale: 'nl-BE',

        // Custom parse formats
        parsers: {
            L: 'DD/MM/YYYY',      // Short date
            LT: 'HH:mm',          // Time
            LTS: 'HH:mm:ss'       // Time with seconds
        },

        // Week start
        weekStartDay: 1,  // Monday

        // Non-working days
        nonWorkingDays: {
            0: true,  // Sunday
            6: true   // Saturday
        },

        // Ordinal suffix
        ordinalSuffix: n => n + 'e'  // 1e, 2e, 3e, etc.
    }
};
```

---

## TypeScript Interfaces

### Locale Types

```typescript
interface LocaleKeys {
    [key: string]: string | number | Function | LocaleKeys | object;
}

interface Locale extends LocaleKeys {
    /**
     * Locale naam (bijv. "En", "De")
     */
    localeName?: string;

    /**
     * Beschrijving (bijv. "English (US)")
     */
    localeDesc?: string;

    /**
     * Locale code (bijv. "en-US", "de-DE")
     */
    localeCode?: string;

    /**
     * Pad voor async laden
     */
    localePath?: string;

    /**
     * RTL modus
     */
    localeRtl?: boolean;
}

interface Locales {
    [localeName: string]: Locale;
}
```

### LocaleManager Interface

```typescript
interface LocaleManagerSingleton {
    /**
     * Huidige locale
     */
    locale: string | Locale | Locales;

    /**
     * Geregistreerde locales
     */
    readonly locales: Locales;

    /**
     * Throw error bij ontbrekende string
     */
    throwOnMissingLocale: boolean;

    /**
     * Apply locale
     */
    applyLocale(
        locale: string | Locale,
        options?: {
            localePath?: string;
            fetch?: RequestInit;
        }
    ): Promise<void>;

    /**
     * Extend bestaande locale
     */
    extendLocale(localeName: string, config: Partial<Locale>): void;

    /**
     * Event listener
     */
    on(event: 'locale', handler: (event: {
        locale: Locale;
        oldLocale: Locale;
    }) => void): void;
}
```

### LocaleHelper Interface

```typescript
interface LocaleHelperStatic {
    /**
     * Huidige locale
     */
    readonly locale: Locale;

    /**
     * Huidige locale naam
     */
    localeName: string;

    /**
     * Alle locales
     */
    readonly locales: Locales;

    /**
     * Publiceer nieuwe locale
     */
    publishLocale(
        nameOrConfig: string | Locale,
        config?: Locale | boolean
    ): Locale;

    /**
     * Merge locales
     */
    mergeLocales(...locales: Locale[]): Locale;

    /**
     * Trim locale properties
     */
    trimLocale(locale: object, toTrim: object): void;

    /**
     * Normalize locale config
     */
    normalizeLocale(
        nameOrConfig: string | Locale,
        config?: Locale
    ): Locale;
}
```

### Localizable Mixin Interface

```typescript
interface LocalizableMixin {
    /**
     * Translate string
     */
    L(
        text: string,
        templateData?: object | any[]
    ): string;

    /**
     * Properties die automatisch vertaald worden
     */
    localizableProperties?: string[];

    /**
     * Locale class voor vertalingen
     */
    localeClass?: typeof Base;

    /**
     * Disable localization
     */
    localizable?: boolean;

    /**
     * Called wanneer locale wijzigt
     */
    updateLocalization?(): void;
}
```

---

## Dynamic Locale Switching

### Complete Voorbeeld

```javascript
import { TaskBoard, LocaleManager, LocaleHelper, Localizable } from '@bryntum/taskboard';

// Pre-load locales
import '../build/locales/taskboard.locale.De.js';
import '../build/locales/taskboard.locale.FrFr.js';
import '../build/locales/taskboard.locale.Nl.js';

// Available languages
const languages = [
    { code: 'En', name: 'English', flag: '🇺🇸' },
    { code: 'De', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'FrFr', name: 'Français', flag: '🇫🇷' },
    { code: 'Nl', name: 'Nederlands', flag: '🇳🇱' }
];

const taskBoard = new TaskBoard({
    appendTo: 'container',

    tbar: [
        {
            type: 'combo',
            label: 'Language',
            editable: false,
            value: 'En',
            items: languages.map(l => ({
                id: l.code,
                text: `${l.flag} ${l.name}`
            })),
            onChange({ value }) {
                LocaleManager.locale = value;
            }
        }
    ],

    columns: [
        { id: 'todo', text: 'To Do' },
        { id: 'doing', text: 'Doing' },
        { id: 'done', text: 'Done' }
    ],

    columnField: 'status',

    // Locale change handler
    onLocaleUpdated() {
        // Update document
        document.documentElement.lang = LocaleManager.locale.localeCode;
        document.documentElement.dir = LocaleManager.locale.localeRtl ? 'rtl' : 'ltr';

        // Update page title
        document.title = Localizable().L('L{App.title}');
    },

    listeners: {
        paint({ firstPaint }) {
            if (firstPaint) {
                LocaleManager.on('locale', this.onLocaleUpdated, this);
                this.onLocaleUpdated();
            }
        }
    }
});

// Persist user preference
LocaleManager.on('locale', ({ locale }) => {
    localStorage.setItem('userLocale', locale.localeName);
});

// Restore on load
const savedLocale = localStorage.getItem('userLocale');
if (savedLocale && LocaleManager.locales[savedLocale]) {
    LocaleManager.locale = savedLocale;
}
```

### Lazy Loading Locales

```javascript
const languageSelector = new Combo({
    label: 'Language',
    items: [
        { id: 'En', text: 'English' },
        { id: 'De', text: 'Deutsch' },
        { id: 'FrFr', text: 'Français' }
    ],

    async onChange({ value }) {
        // Check of locale al geladen is
        if (!LocaleManager.locales[value]) {
            // Toon loading indicator
            showLoading();

            try {
                // Dynamisch laden
                await import(`../build/locales/taskboard.locale.${value}.js`);
            } catch (error) {
                console.error(`Failed to load locale: ${value}`);
                hideLoading();
                return;
            }

            hideLoading();
        }

        // Apply locale
        LocaleManager.locale = value;
    }
});
```

---

## Best Practices

### 1. Laden Bij Startup

```javascript
// Laad locale VOOR TaskBoard creatie
import '../build/locales/taskboard.locale.De.js';
LocaleManager.locale = 'De';

// Dan pas TaskBoard
const taskBoard = new TaskBoard({ ... });
```

### 2. Gebruik L{} Syntax

```javascript
// Goed: L{} syntax in configs
text: 'L{TaskBoard.addTask}'

// Slecht: Hardcoded strings
text: 'Add task'
```

### 3. Centraliseer Custom Strings

```javascript
// locales/app.locale.En.js
export default {
    App: {
        title: 'My Application',
        welcomeMessage: 'Welcome to the app',
        // Alle app-specifieke strings hier
    }
};

// Gebruik
LocaleHelper.publishLocale('En', appLocale);
```

### 4. Test RTL

```javascript
// Test RTL mode
function testRtl() {
    const testLocales = ['Ar', 'He'];

    testLocales.forEach(async locale => {
        await loadLocale(locale);
        LocaleManager.locale = locale;

        // Screenshot of run visual tests
        await runVisualTests();
    });
}
```

### 5. Fallback Handling

```javascript
// Configureer fallback gedrag
LocaleManager.throwOnMissingLocale = false;

// Custom fallback
const L = (key) => {
    const result = Localizable().L(key);

    // Als niet gevonden, gebruik key
    if (result === key) {
        console.warn(`Missing translation: ${key}`);
        return key.split('.').pop();  // Gebruik laatste deel
    }

    return result;
};
```

### 6. Server-Side Locale Detection

```javascript
// Detecteer browser locale
function getPreferredLocale() {
    // User preference
    const saved = localStorage.getItem('userLocale');
    if (saved) return saved;

    // Browser language
    const browserLang = navigator.language.replace('-', '');

    // Map to available locale
    const available = Object.keys(LocaleManager.locales);

    // Exact match
    if (available.includes(browserLang)) {
        return browserLang;
    }

    // Partial match (nl-NL -> Nl)
    const partial = available.find(l =>
        l.toLowerCase().startsWith(browserLang.substring(0, 2).toLowerCase())
    );

    return partial || 'En';
}

LocaleManager.locale = getPreferredLocale();
```

---

## Complete Implementatie Voorbeeld

```javascript
import {
    TaskBoard,
    LocaleManager,
    LocaleHelper,
    Localizable,
    StringHelper
} from '@bryntum/taskboard';

// Import locales
import '../build/locales/taskboard.locale.De.js';
import '../build/locales/taskboard.locale.FrFr.js';
import '../build/locales/taskboard.locale.Ar.js';

// Custom app locale
const appLocale = {
    App: {
        title: 'Task Manager',
        subtitle: 'Organize your work efficiently',
        teamMember: 'Team member:'
    },
    Demo: {
        add: 'Add new',
        teamMember: 'Team member:'
    }
};

// Publish voor alle locales
['En', 'De', 'FrFr', 'Ar'].forEach(loc => {
    LocaleHelper.publishLocale(loc, appLocale);
});

// TaskBoard
const taskBoard = new TaskBoard({
    appendTo: 'container',

    columns: [
        { id: 'backlog', text: 'L{TaskBoard.Backlog}', color: 'purple' },
        { id: 'doing', text: 'L{TaskBoard.Doing}', color: 'orange' },
        { id: 'done', text: 'L{TaskBoard.Done}', color: 'green' }
    ],

    columnField: 'status',

    features: {
        columnToolbars: {
            bottomItems: {
                addTask: {
                    text: 'L{Demo.add}'
                }
            }
        }
    },

    tbar: [
        {
            type: 'combo',
            ref: 'localeCombo',
            label: 'Language',
            editable: false,
            value: 'En',
            displayField: 'text',
            valueField: 'id',
            items: [
                { id: 'En', text: '🇺🇸 English' },
                { id: 'De', text: '🇩🇪 Deutsch' },
                { id: 'FrFr', text: '🇫🇷 Français' },
                { id: 'Ar', text: '🇸🇦 العربية' }
            ],
            onChange({ value }) {
                LocaleManager.locale = value;
            }
        }
    ],

    project: {
        loadUrl: 'data/tasks.json',
        autoLoad: true
    },

    setPageTitle() {
        const L = Localizable().L;
        document.title = L('L{App.title}');
        document.querySelector('h1').textContent = L('L{App.title}');
    },

    listeners: {
        paint({ firstPaint }) {
            if (firstPaint) {
                LocaleManager.on('locale', ({ locale }) => {
                    // Update RTL
                    document.documentElement.dir = locale.localeRtl ? 'rtl' : 'ltr';
                    document.documentElement.lang = locale.localeCode;

                    // Update title
                    this.setPageTitle();
                });

                this.setPageTitle();
            }
        }
    }
});

export { taskBoard };
```

---

## Gerelateerde Documentatie

- [DEEP-DIVE-LOCALIZATION.md](./DEEP-DIVE-LOCALIZATION.md) - Gantt localization (vergelijkbaar)
- [TASKBOARD-IMPL-THEMING.md](./TASKBOARD-IMPL-THEMING.md) - Theming (werkt samen met RTL)
- [TASKBOARD-DEEP-DIVE-CARDS.md](./TASKBOARD-DEEP-DIVE-CARDS.md) - Card rendering met L{}

---

*Laatst bijgewerkt: December 2024*
*Document versie: 1.0*
*Bryntum TaskBoard versie: 7.1.0*
