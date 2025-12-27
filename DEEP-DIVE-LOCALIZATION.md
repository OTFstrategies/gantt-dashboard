# DEEP-DIVE: Localization & i18n System

> **Level 2** - Internationalisatie, vertalingen en locale management voor Bryntum Gantt.

---

## Inhoudsopgave

1. [Overzicht](#1-overzicht)
2. [Beschikbare Locales](#2-beschikbare-locales)
3. [Locale Laden](#3-locale-laden)
4. [LocaleManager API](#4-localemanager-api)
5. [Locale Structuur](#5-locale-structuur)
6. [Custom Vertalingen](#6-custom-vertalingen)
7. [Runtime Locale Switching](#7-runtime-locale-switching)
8. [React/Next.js Integratie](#8-reactnextjs-integratie)
9. [Date/Time Formatting](#9-datetime-formatting)
10. [Cross-References](#10-cross-references)

---

## 1. Overzicht

### 1.1 i18n Systeem

Bryntum Gantt heeft een ingebouwd internationalisatie systeem:

```
┌─────────────────────────────────────────────────────────────┐
│                    LocaleManager                             │
├─────────────────────────────────────────────────────────────┤
│  - Beheert alle geladen locales                              │
│  - Publiceert locale naar alle widgets                       │
│  - Events voor locale changes                                │
│  - Fallback naar Engels                                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Locale Files                              │
├─────────────────────────────────────────────────────────────┤
│  gantt.locale.En.js    gantt.locale.Nl.js                   │
│  gantt.locale.De.js    gantt.locale.Fr.js                   │
│  ... 45+ talen                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Kenmerken

- **45+ ingebouwde talen** - Inclusief Nederlands, Duits, Frans, etc.
- **Runtime switching** - Taal wisselen zonder page reload
- **Extensible** - Eigen vertalingen toevoegen
- **Component-scoped** - Vertalingen per component type
- **Date/time formatting** - Lokale datum/tijd formaten

---

## 2. Beschikbare Locales

### 2.1 Ingebouwde Locales

Bryntum Gantt 7.1.0 bevat de volgende locales:

| Code | Taal | Bestand |
|------|------|---------|
| `En` | English (default) | `gantt.locale.En.js` |
| `Nl` | Nederlands | `gantt.locale.Nl.js` |
| `De` | Deutsch | `gantt.locale.De.js` |
| `Fr` | Français | `gantt.locale.Fr.js` |
| `Es` | Español | `gantt.locale.Es.js` |
| `It` | Italiano | `gantt.locale.It.js` |
| `Pt` | Português | `gantt.locale.Pt.js` |
| `Ru` | Русский | `gantt.locale.Ru.js` |
| `Zh` | 中文 | `gantt.locale.Zh.js` |
| `Ja` | 日本語 | `gantt.locale.Ja.js` |
| `Ko` | 한국어 | `gantt.locale.Ko.js` |
| `Ar` | العربية | `gantt.locale.Ar.js` |
| `Pl` | Polski | `gantt.locale.Pl.js` |
| `SvSE` | Svenska | `gantt.locale.SvSE.js` |
| `FiFI` | Suomi | `gantt.locale.FiFI.js` |
| `No` | Norsk | `gantt.locale.No.js` |
| `Da` | Dansk | `gantt.locale.Da.js` |
| ... | ... | 45+ totaal |

### 2.2 Locale Bestanden Locatie

```
build/locales/
├── gantt.locale.En.js
├── gantt.locale.Nl.js
├── gantt.locale.De.js
├── ... (45+ bestanden)
└── gantt.locale.ZhTw.js
```

---

## 3. Locale Laden

### 3.1 Import Methode

```javascript
// Importeer gewenste locale
import '@bryntum/gantt/locales/gantt.locale.Nl';

// Gantt is nu in het Nederlands
const gantt = new Gantt({
    appendTo: 'container'
});
```

### 3.2 Script Tag Methode

```html
<!-- Laad locale via script tag -->
<script src="gantt.locale.Nl.js"></script>

<!-- Gantt component -->
<script src="gantt.module.js"></script>
```

### 3.3 Dynamic Import

```javascript
// Dynamisch laden op basis van user preference
async function loadLocale(localeCode) {
    await import(`@bryntum/gantt/locales/gantt.locale.${localeCode}`);
}

// Gebruik
await loadLocale('Nl');
```

### 3.4 Multiple Locales

```javascript
// Meerdere locales laden voor switching
import '@bryntum/gantt/locales/gantt.locale.En';
import '@bryntum/gantt/locales/gantt.locale.Nl';
import '@bryntum/gantt/locales/gantt.locale.De';

// Nu beschikbaar via LocaleManager.locales
console.log(Object.keys(LocaleManager.locales));
// ['En', 'Nl', 'De']
```

---

## 4. LocaleManager API

### 4.1 Basis Gebruik

```javascript
import { LocaleManager } from '@bryntum/gantt';

// Huidige locale
console.log(LocaleManager.locale);  // 'Nl'

// Alle geladen locales
console.log(LocaleManager.locales);  // { En: {...}, Nl: {...} }

// Locale namen
console.log(LocaleManager.localeNames);  // ['English', 'Nederlands']

// Switch naar andere locale
LocaleManager.locale = 'De';
```

### 4.2 Locale Events

```javascript
import { LocaleManager, GlobalEvents } from '@bryntum/gantt';

// Luister naar locale changes
GlobalEvents.on({
    locale({ locale }) {
        console.log(`Locale changed to: ${locale.localeName}`);

        // Update custom UI elementen
        updateCustomLabels(locale);
    }
});

// Of via LocaleManager direct
LocaleManager.on({
    locale(event) {
        console.log('New locale:', event.locale);
    }
});
```

### 4.3 Locale Info Ophalen

```javascript
// Specifieke vertaling ophalen
const translation = LocaleManager.localize('Gantt.Add');
// "Toevoegen" (in Nederlands)

// Met fallback
const text = LocaleManager.localize('Custom.MyKey', 'Default Text');

// Locale object
const currentLocale = LocaleManager.locale;
console.log(currentLocale.localeName);  // 'Nederlands'
console.log(currentLocale.localeCode);  // 'Nl'
```

### 4.4 Locale Validatie

```javascript
// Check of locale bestaat
if (LocaleManager.locales['Nl']) {
    LocaleManager.locale = 'Nl';
}

// Development: throw op missende keys
LocaleManager.throwOnMissingLocale = true;  // Default: false

// Dit werpt nu een error als key niet bestaat
LocaleManager.localize('NonExistent.Key');
// Error: Locale key 'NonExistent.Key' not found
```

---

## 5. Locale Structuur

### 5.1 Locale Bestand Anatomie

Een locale bestand ziet er zo uit (vereenvoudigd):

```javascript
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = {
    localeName: 'Nederlands',
    localeDesc: 'Nederlands (NL)',
    localeCode: 'nl',
    localeRtl: false,  // Right-to-left talen: true

    // Component vertalingen
    Gantt: {
        Add: 'Toevoegen',
        'New task': 'Nieuwe taak',
        'Delete task': 'Taak verwijderen',
        'Indent': 'Inspringen',
        'Outdent': 'Uitspringen'
    },

    TaskEditor: {
        'Name': 'Naam',
        'Resources': 'Resources',
        'Start': 'Start',
        'Finish': 'Einde',
        'Duration': 'Duur',
        'Percent done': 'Procent gereed',
        'Notes': 'Notities'
    },

    DependencyType: {
        SS: 'SS',
        SF: 'SE',
        FS: 'ES',
        FF: 'EE'
    },

    // Grid componenten
    GridBase: {
        loadFailedMessage: 'Laden mislukt!',
        syncFailedMessage: 'Synchronisatie mislukt!'
    },

    // Widgets
    DateField: {
        invalidDate: 'Ongeldige datum'
    },

    // ... meer componenten
};

// Registreer bij LocaleManager
export default LocaleHelper.publishLocale(locale);
```

### 5.2 Locale Categorieën

```javascript
const locale = {
    // === Gantt Specifiek ===
    Gantt: { ... },
    TaskEditor: { ... },
    DependencyType: { ... },
    ConstraintType: { ... },
    Calendar: { ... },

    // === Grid Componenten ===
    GridBase: { ... },
    Column: { ... },
    ColumnPicker: { ... },
    Filter: { ... },
    Sort: { ... },

    // === Scheduler Componenten ===
    SchedulerBase: { ... },
    TimeRanges: { ... },
    ResourceTimeRanges: { ... },

    // === Core Widgets ===
    Button: { ... },
    Combo: { ... },
    DateField: { ... },
    NumberField: { ... },
    TextField: { ... },
    Popup: { ... },
    Toast: { ... },

    // === Datum/Tijd ===
    DateHelper: {
        locale: 'nl-NL',
        weekStartDay: 1,  // Maandag
        unitNames: [...],
        unitAbbreviations: [...],
        shortDateFormat: 'DD-MM-YYYY',
        longDateFormat: 'D MMMM YYYY'
    }
};
```

### 5.3 Dependency Types

```javascript
DependencyType: {
    SS: 'SS',   // Start-to-Start
    SF: 'SE',   // Start-to-Finish (Start-Einde)
    FS: 'ES',   // Finish-to-Start (Einde-Start)
    FF: 'EE',   // Finish-to-Finish (Einde-Einde)

    // Lange vorm
    long: {
        SS: 'Start naar Start',
        SF: 'Start naar Einde',
        FS: 'Einde naar Start',
        FF: 'Einde naar Einde'
    }
}
```

### 5.4 Constraint Types

```javascript
ConstraintType: {
    muststarton: 'Moet starten op',
    mustfinishon: 'Moet eindigen op',
    startnoearlierthan: 'Start niet eerder dan',
    startnolaterthan: 'Start niet later dan',
    finishnoearlierthan: 'Eindig niet eerder dan',
    finishnolaterthan: 'Eindig niet later dan'
}
```

---

## 6. Custom Vertalingen

### 6.1 Locale Uitbreiden

```javascript
import { LocaleManager, LocaleHelper } from '@bryntum/gantt';
import '@bryntum/gantt/locales/gantt.locale.Nl';

// Uitbreiden met custom keys
LocaleHelper.publishLocale({
    localeName: 'Nederlands',
    localeCode: 'Nl',

    // Overschrijf bestaande
    Gantt: {
        Add: 'Nieuw item toevoegen'  // Was: 'Toevoegen'
    },

    // Voeg custom keys toe
    MyApp: {
        welcomeMessage: 'Welkom bij de planning tool',
        saveSuccess: 'Project succesvol opgeslagen',
        saveError: 'Fout bij opslaan'
    }
});
```

### 6.2 Gebruik Custom Vertalingen

```javascript
// In componenten
const message = LocaleManager.localize('MyApp.welcomeMessage');

// In widget config
const gantt = new Gantt({
    tbar: {
        items: [{
            type: 'button',
            text: 'L{MyApp.saveSuccess}'  // Lokalisatie syntax
        }]
    }
});
```

### 6.3 Complete Custom Locale

```javascript
// custom-locale.js
import { LocaleHelper } from '@bryntum/gantt';

const customLocale = {
    localeName: 'Nederlands Aangepast',
    localeDesc: 'Nederlands met aangepaste termen',
    localeCode: 'nl-custom',

    // Kopieer en pas aan
    Gantt: {
        Add: 'Toevoegen',
        'New task': 'Nieuwe activiteit',  // "taak" → "activiteit"
        'Delete task': 'Activiteit verwijderen'
    },

    TaskEditor: {
        Name: 'Activiteitnaam',
        Resources: 'Toegewezen resources',
        Start: 'Startdatum',
        Finish: 'Einddatum',
        Duration: 'Doorlooptijd',
        'Percent done': 'Voortgang (%)',
        Notes: 'Opmerkingen'
    }
};

export default LocaleHelper.publishLocale(customLocale);
```

### 6.4 Lokalisatie in Templates

```javascript
// L{...} syntax voor lokalisatie
const gantt = new Gantt({
    columns: [
        {
            type: 'name',
            text: 'L{Gantt.Name}'  // Wordt vertaald
        },
        {
            text: 'L{TaskEditor.Duration}',
            field: 'duration'
        }
    ],

    // In tbar
    tbar: {
        items: [{
            type: 'button',
            text: 'L{Gantt.Add}'
        }]
    }
});
```

---

## 7. Runtime Locale Switching

### 7.1 Locale Switcher UI

```javascript
// Uit localization demo
const gantt = new Gantt({
    tbar: {
        items: {
            localeCombo: {
                type: 'combo',
                label: 'Taal',
                editable: false,
                value: LocaleManager.locale.localeCode,
                items: Object.entries(LocaleManager.locales).map(([code, locale]) => ({
                    id: code,
                    text: locale.localeName
                })),
                onChange({ value }) {
                    LocaleManager.locale = value;
                }
            }
        }
    }
});
```

### 7.2 Locale Persistence

```javascript
// Sla user preference op
function saveLocalePreference(localeCode) {
    localStorage.setItem('preferredLocale', localeCode);
}

// Laad bij startup
async function initLocale() {
    const preferred = localStorage.getItem('preferredLocale') || 'En';

    // Dynamisch laden
    await import(`@bryntum/gantt/locales/gantt.locale.${preferred}`);

    LocaleManager.locale = preferred;
}
```

### 7.3 Automatische Browser Locale

```javascript
// Detecteer browser taal
function detectBrowserLocale() {
    const browserLang = navigator.language.split('-')[0];

    const localeMap = {
        'nl': 'Nl',
        'de': 'De',
        'fr': 'Fr',
        'en': 'En'
    };

    return localeMap[browserLang] || 'En';
}

// Initialiseer met browser preference
const locale = detectBrowserLocale();
LocaleManager.locale = locale;
```

---

## 8. React/Next.js Integratie

### 8.1 Locale Provider Pattern

```jsx
// LocaleProvider.jsx
import { useEffect, useState } from 'react';
import { LocaleManager } from '@bryntum/gantt';

export function LocaleProvider({ locale, children }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function loadLocale() {
            try {
                await import(`@bryntum/gantt/locales/gantt.locale.${locale}`);
                LocaleManager.locale = locale;
                setReady(true);
            } catch (error) {
                console.error(`Failed to load locale: ${locale}`);
                setReady(true);  // Fallback naar default
            }
        }

        loadLocale();
    }, [locale]);

    if (!ready) {
        return <div>Loading...</div>;
    }

    return children;
}
```

### 8.2 Gebruik in App

```jsx
// App.jsx
import { LocaleProvider } from './LocaleProvider';
import { GanttChart } from './GanttChart';

function App() {
    const [locale, setLocale] = useState('Nl');

    return (
        <LocaleProvider locale={locale}>
            <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
            >
                <option value="En">English</option>
                <option value="Nl">Nederlands</option>
                <option value="De">Deutsch</option>
            </select>

            <GanttChart />
        </LocaleProvider>
    );
}
```

### 8.3 Custom Hook

```jsx
// useLocale.js
import { useState, useEffect } from 'react';
import { LocaleManager, GlobalEvents } from '@bryntum/gantt';

export function useLocale() {
    const [locale, setLocale] = useState(LocaleManager.locale?.localeCode || 'En');

    useEffect(() => {
        const handler = ({ locale }) => {
            setLocale(locale.localeCode);
        };

        GlobalEvents.on('locale', handler);

        return () => {
            GlobalEvents.un('locale', handler);
        };
    }, []);

    const changeLocale = async (newLocale) => {
        await import(`@bryntum/gantt/locales/gantt.locale.${newLocale}`);
        LocaleManager.locale = newLocale;
    };

    return { locale, changeLocale };
}
```

### 8.4 Next.js Dynamic Import

```jsx
// GanttWithLocale.jsx
import dynamic from 'next/dynamic';

const BryntumGantt = dynamic(
    async () => {
        // Laad locale samen met component
        await import('@bryntum/gantt/locales/gantt.locale.Nl');
        return import('@bryntum/gantt-react').then(mod => mod.BryntumGantt);
    },
    { ssr: false }
);
```

---

## 9. Date/Time Formatting

### 9.1 DateHelper Locale

```javascript
// In locale bestand
DateHelper: {
    locale: 'nl-NL',
    weekStartDay: 1,  // 0=Zondag, 1=Maandag

    // Dag namen
    unitNames: [
        { single: 'milliseconde', plural: 'milliseconden', abbrev: 'ms' },
        { single: 'seconde', plural: 'seconden', abbrev: 's' },
        { single: 'minuut', plural: 'minuten', abbrev: 'min' },
        { single: 'uur', plural: 'uren', abbrev: 'u' },
        { single: 'dag', plural: 'dagen', abbrev: 'd' },
        { single: 'week', plural: 'weken', abbrev: 'w' },
        { single: 'maand', plural: 'maanden', abbrev: 'ma' },
        { single: 'kwartaal', plural: 'kwartalen', abbrev: 'kw' },
        { single: 'jaar', plural: 'jaren', abbrev: 'j' }
    ],

    // Korte dag namen
    shortDayNames: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],

    // Korte maand namen
    shortMonthNames: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],

    // Datum formaten
    shortDateFormat: 'DD-MM-YYYY',
    longDateFormat: 'D MMMM YYYY',
    shortTimeFormat: 'HH:mm',
    longTimeFormat: 'HH:mm:ss'
}
```

### 9.2 Custom Date Formats

```javascript
import { DateHelper } from '@bryntum/gantt';

// Gebruik locale-specifieke formatting
const formatted = DateHelper.format(new Date(), 'L{DateHelper.shortDateFormat}');
// "26-12-2024" (Nederlands)
// "12/26/2024" (Engels)

// Parse met locale format
const date = DateHelper.parse('26-12-2024', 'DD-MM-YYYY');
```

### 9.3 Duration Formatting

```javascript
// Duration wordt automatisch gelokaliseerd
task.duration = 5;  // 5 dagen

// In grid
columns: [{
    type: 'duration',
    field: 'duration'
    // Toont: "5 dagen" (NL) of "5 days" (EN)
}]
```

---

## 10. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | Next.js dynamic imports |
| [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) | Widget configuratie |
| [DEEP-DIVE-THEMING](./DEEP-DIVE-THEMING.md) | Thema switching |
| [DEEP-DIVE-EDGE-CASES](./DEEP-DIVE-EDGE-CASES.md) | Locale errors |

### Demo's

| Demo | Functionaliteit |
|------|-----------------|
| `examples/localization/` | Locale switching demo |
| `examples/extjsmodern/` | ExtJS met i18n |

### API Referentie

```javascript
// Belangrijke imports
import {
    LocaleManager,     // Locale beheer
    LocaleHelper,      // Locale utilities
    DateHelper,        // Datum formatting
    GlobalEvents       // Locale events
} from '@bryntum/gantt';
```

### Locale Bestanden

```
build/locales/
├── gantt.locale.Ar.js      # Arabisch (RTL)
├── gantt.locale.Cs.js      # Tsjechisch
├── gantt.locale.Da.js      # Deens
├── gantt.locale.De.js      # Duits
├── gantt.locale.En.js      # Engels (default)
├── gantt.locale.Es.js      # Spaans
├── gantt.locale.FiFI.js    # Fins
├── gantt.locale.Fr.js      # Frans
├── gantt.locale.Hi.js      # Hindi
├── gantt.locale.Hu.js      # Hongaars
├── gantt.locale.It.js      # Italiaans
├── gantt.locale.Ja.js      # Japans
├── gantt.locale.Ko.js      # Koreaans
├── gantt.locale.Nl.js      # Nederlands
├── gantt.locale.No.js      # Noors
├── gantt.locale.Pl.js      # Pools
├── gantt.locale.Pt.js      # Portugees
├── gantt.locale.Ro.js      # Roemeens
├── gantt.locale.Ru.js      # Russisch
├── gantt.locale.SvSE.js    # Zweeds
├── gantt.locale.Tr.js      # Turks
├── gantt.locale.Uk.js      # Oekraïens
├── gantt.locale.Zh.js      # Chinees (vereenvoudigd)
└── gantt.locale.ZhTw.js    # Chinees (traditioneel)
```

---

## Samenvatting Checklist

### Locale Implementatie

- [ ] Kies locale(s) voor je applicatie
- [ ] Importeer locale bestand(en)
- [ ] Configureer LocaleManager.locale
- [ ] Voeg locale switcher UI toe indien nodig
- [ ] Sla user preference op

### Custom Vertalingen

- [ ] Identificeer aan te passen teksten
- [ ] Maak custom locale bestand of extend bestaande
- [ ] Gebruik LocaleHelper.publishLocale()
- [ ] Test alle UI elementen

### RTL Support

- [ ] Importeer RTL locale (Ar, He, etc.)
- [ ] Check `localeRtl: true` in locale
- [ ] Test layout in RTL modus

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
