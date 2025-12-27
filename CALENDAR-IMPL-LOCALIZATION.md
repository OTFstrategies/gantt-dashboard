# CALENDAR-IMPL-LOCALIZATION.md
## Bryntum Calendar - Localization Implementatie

### Overzicht

Dit document beschrijft het localisatiesysteem van Bryntum Calendar. Het systeem ondersteunt 45+ talen out-of-the-box en biedt uitgebreide mogelijkheden voor custom vertalingen, datum/tijd formatting en RTL ondersteuning.

---

## 1. Beschikbare Locales

### 1.1 Ingebouwde Talen
```
build/locales/
├── calendar.locale.Ar.js      # Arabisch (RTL)
├── calendar.locale.Bg.js      # Bulgaars
├── calendar.locale.Ca.js      # Catalaans
├── calendar.locale.Cs.js      # Tsjechisch
├── calendar.locale.Da.js      # Deens
├── calendar.locale.De.js      # Duits
├── calendar.locale.El.js      # Grieks
├── calendar.locale.En.js      # Engels (US)
├── calendar.locale.EnGb.js    # Engels (UK)
├── calendar.locale.Es.js      # Spaans
├── calendar.locale.Et.js      # Ests
├── calendar.locale.Eu.js      # Baskisch
├── calendar.locale.Fi.js      # Fins
├── calendar.locale.FrFr.js    # Frans
├── calendar.locale.Gl.js      # Galicisch
├── calendar.locale.He.js      # Hebreeuws (RTL)
├── calendar.locale.Hi.js      # Hindi
├── calendar.locale.Hr.js      # Kroatisch
├── calendar.locale.Hu.js      # Hongaars
├── calendar.locale.Id.js      # Indonesisch
├── calendar.locale.It.js      # Italiaans
├── calendar.locale.Ja.js      # Japans
├── calendar.locale.Kk.js      # Kazachs
├── calendar.locale.Ko.js      # Koreaans
├── calendar.locale.Lt.js      # Litouws
├── calendar.locale.Lv.js      # Lets
├── calendar.locale.Ms.js      # Maleis
├── calendar.locale.Nl.js      # Nederlands
├── calendar.locale.No.js      # Noors
├── calendar.locale.Pl.js      # Pools
├── calendar.locale.Pt.js      # Portugees
├── calendar.locale.PtBr.js    # Portugees (Brazilië)
├── calendar.locale.Ro.js      # Roemeens
├── calendar.locale.Ru.js      # Russisch
├── calendar.locale.Sk.js      # Slowaaks
├── calendar.locale.Sl.js      # Sloveens
├── calendar.locale.Sr.js      # Servisch (Latijns)
├── calendar.locale.SrRs.js    # Servisch (Cyrillisch)
├── calendar.locale.SvSE.js    # Zweeds
├── calendar.locale.Th.js      # Thais
├── calendar.locale.Tr.js      # Turks
├── calendar.locale.Uk.js      # Oekraïens
├── calendar.locale.Vi.js      # Vietnamees
├── calendar.locale.ZhCn.js    # Chinees (Vereenvoudigd)
└── calendar.locale.ZhTw.js    # Chinees (Traditioneel)
```

---

## 2. LocaleHelper Class

### 2.1 TypeScript Interface
```typescript
// calendar.d.ts:1573
type LocaleKeys = {
    [key: string]: string | number | Function | LocaleKeys | object
}

// calendar.d.ts:1585
type Locale = LocaleKeys & {
    // Locale identificatie
    localeName?: string      // Bijv. "Nl"
    localeDesc?: string      // Bijv. "Nederlands"
    localeCode?: string      // Bijv. "nl" of "nl-NL"
    localePath?: string      // Pad voor async loading

    // RTL support
    localeRtl?: boolean      // true voor RTL talen
}

// calendar.d.ts:1611
type Locales = {
    [key: string]: Locale    // Key = localeName
}

// calendar.d.ts:79990
export class LocaleHelper {
    // Huidige locale
    static readonly locale: Locales
    static localeName: string
    static readonly locales: Locales

    // Locale management
    static mergeLocales(...locales: object[]): object
    static publishLocale(
        nameOrConfig: string | Locale,
        config?: Locale | boolean
    ): Locale
    static trimLocale(locale: object, toTrim: object): void
}
```

### 2.2 Basis Gebruik

```typescript
import { LocaleHelper, LocaleManager } from '@bryntum/calendar';

// Publiceer een nieuwe locale
LocaleHelper.publishLocale('CustomNl', {
    localeName: 'CustomNl',
    localeDesc: 'Nederlands (Aangepast)',
    localeCode: 'nl-NL',
    localeRtl: false,

    // Custom vertalingen
    Calendar: {
        Today: 'Vandaag',
        Tomorrow: 'Morgen',
        allDay: 'Hele dag'
    }
});

// Activeer de locale
LocaleManager.applyLocale('CustomNl');
```

---

## 3. LocaleManager Singleton

### 3.1 TypeScript Interface
```typescript
// calendar.d.ts:80028
export class LocaleManagerSingleton {
    // Huidige locale
    locale: string | Locale | Locales

    // Beschikbare locales
    readonly locales: Locales

    // Error handling
    throwOnMissingLocale: boolean

    // Events
    onLocale: ((event: LocaleChangeEvent) => void) | string

    // Locale toepassen
    applyLocale(
        nameOrConfig: string | Locale,
        config?: Locale | boolean
    ): Promise<Locale | any>
}

export const LocaleManager: LocaleManagerSingleton
```

### 3.2 Locale Wisselen

```typescript
import { LocaleManager, Calendar } from '@bryntum/calendar';

// Luister naar locale changes
LocaleManager.onLocale = ({ locale }) => {
    console.log('Locale changed to:', locale.localeName);
};

// Wissel locale (async)
async function switchLocale(localeName: string) {
    try {
        await LocaleManager.applyLocale(localeName);
        console.log('Locale applied:', localeName);
    } catch (error) {
        console.error('Failed to apply locale:', error);
    }
}

// Gebruik
switchLocale('De');  // Wissel naar Duits
```

---

## 4. Locale Structuur

### 4.1 Basis Componenten

```typescript
const customLocale: Locale = {
    // Identificatie
    localeName: 'Nl',
    localeDesc: 'Nederlands',
    localeCode: 'nl',
    localeRtl: false,

    // Object - Algemene UI strings
    Object: {
        Yes: 'Ja',
        No: 'Nee',
        Cancel: 'Annuleren',
        Ok: 'OK',
        Week: 'Week',
        None: 'Geen',
        previous: 'Vorige',
        next: 'Volgende',
        to: 'tot',
        at: 'om',
        on: 'op',
        editing: (name: string) => `Bewerken van ${name}`,
        settings: 'Instellingen',
        close: 'Sluiten',
        save: 'Opslaan',
        cancel: 'Annuleren',
        revert: 'Herstellen',
        collapse: 'Klap in',
        expand: 'Klap uit',
        today: 'Vandaag'
    },

    // DateHelper - Datum/tijd configuratie
    DateHelper: {
        locale: 'nl',
        weekStartDay: 1,              // Maandag
        nonWorkingDays: { 0: true, 6: true },
        weekends: { 0: true, 6: true },

        // Eenheid namen
        unitNames: [
            { single: 'ms', plural: 'ms', abbrev: 'ms' },
            { single: 'seconde', plural: 'seconden', abbrev: 's' },
            { single: 'minuut', plural: 'minuten', abbrev: 'm' },
            { single: 'uur', plural: 'uren', abbrev: 'u' },
            { single: 'dag', plural: 'dagen', abbrev: 'd' },
            { single: 'week', plural: 'weken', abbrev: 'w' },
            { single: 'maand', plural: 'maanden', abbrev: 'ma' },
            { single: 'kwartaal', plural: 'kwartalen', abbrev: 'kw' },
            { single: 'jaar', plural: 'jaren', abbrev: 'j' }
        ],

        // Datum parsers
        parsers: {
            L: 'DD-MM-YYYY',
            LT: 'HH:mm',
            LTS: 'HH:mm:ss'
        },

        // Ordinaal suffix
        ordinalSuffix: (n: number) => `${n}e`
    }
};
```

### 4.2 Calendar-Specifieke Strings

```typescript
const calendarLocale = {
    // Calendar view strings
    Calendar: {
        toggleSidebar: 'Zichtbaarheid van de zijbalk wisselen',
        Today: 'Vandaag',
        Tomorrow: 'Morgen',
        next: (unit: string) => `Volgende ${unit}`,
        previous: (unit: string) => `Vorige ${unit}`,
        plusMore: (count: number) => `+${count} meer`,
        moreEvents: (count: number) => `${count} meer evenementen`,
        allDay: 'Hele dag',
        endsOn: (date: string) => `Eindigt op ${date}`,
        weekOfYear: ([year, week]: [number, number]) =>
            `Week ${week}, ${year}`,
        loadFail: 'Het laden van agendagegevens is mislukt.',
        gotoDate: 'Ga naar datum',
        timeRange: 'Tijdsbereik',
        noResources: 'Geen bronnen'
    },

    // Event edit dialog
    EventEdit: {
        Name: 'Naam',
        Resource: 'Resource',
        Start: 'Start',
        startTime: 'Starttijd',
        End: 'Eind',
        endTime: 'Eindtijd',
        Save: 'Bewaar',
        Delete: 'Verwijder',
        Cancel: 'Annuleer',
        'Edit event': 'Wijzig item',
        Repeat: 'Herhaal',
        editRecurrence: 'Herhaling bewerken',
        Calendar: 'Kalender',
        'All day': 'Hele dag',
        day: 'Dag',
        week: 'Week',
        month: 'Maand',
        year: 'Jaar'
    },

    // View-specifieke strings
    DayView: {
        Day: 'Dag',
        dayUnit: 'dag',
        daysUnit: 'dagen',
        expandAllDayRow: 'Klap dag overzicht uit',
        collapseAllDayRow: 'Klap dag overzicht in',
        timeFormat: 'LT',
        noMatchingDates: 'Geen overeenkomende datums'
    },

    WeekView: {
        weekUnit: 'week'
    },

    MonthView: {
        Month: 'Maand',
        monthUnit: 'maand'
    },

    YearView: {
        Year: 'Jaar',
        yearUnit: 'jaar',
        noEvents: 'Geen evenementen'
    },

    AgendaView: {
        Agenda: 'Agenda'
    }
};
```

### 4.3 Recurrence Strings

```typescript
const recurrenceLocale = {
    RecurrenceEditor: {
        'Repeat event': 'Herhaal gebeurtenis',
        Cancel: 'Annuleer',
        Save: 'Bewaar',
        Frequency: 'Frequentie',
        Every: 'Elke',
        DAILYintervalUnit: 'dag(en)',
        WEEKLYintervalUnit: 'week(en)',
        MONTHLYintervalUnit: 'maand(en)',
        YEARLYintervalUnit: 'jaren(en)',
        Each: 'Elke',
        on: 'Op',
        the: 'De',
        'On the': 'Op de',
        'End repeat': 'Einde herhaling',
        'time(s)': 'keer',
        Days: 'Dagen',
        Months: 'Maanden'
    },

    RecurrenceFrequencyCombo: {
        None: 'Geen herhaling',
        Daily: 'Dagelijks',
        Weekly: 'Wekelijks',
        Monthly: 'Maandelijks',
        Yearly: 'Jaarlijks'
    },

    RecurrenceLegend: {
        ' and ': ' en ',
        Daily: 'Dagelijks',
        'Weekly on {1}': ({ days }) => `Wekelijks op ${days}`,
        'Monthly on {1}': ({ days }) => `Maandelijks op ${days}`,
        'Yearly on {1} of {2}': ({ days, months }) =>
            `Jaarlijks op ${days} ${months}`,
        'Every {0} days': ({ interval }) => `Elke ${interval} dagen`,
        'Every {0} weeks on {1}': ({ interval, days }) =>
            `Elke ${interval} weken op ${days}`,
        position1: 'de eerste',
        position2: 'de tweede',
        position3: 'de derde',
        position4: 'de vierde',
        position5: 'de vijfde',
        'position-1': 'laatste',
        day: 'dag',
        weekday: 'weekdag',
        'weekend day': 'weekend dag'
    },

    RecurrenceConfirmationPopup: {
        'delete-title': 'U verwijdert een plan item',
        'delete-all-message':
            'Wilt u alle herhaalde afspraken verwijderen?',
        'delete-further-message':
            'Wilt u dit en alle toekomstige gebeurtenissen verwijderen?',
        'delete-only-this-message':
            'Wilt u alleen deze gebeurtenis verwijderen?',
        'delete-further-btn-text': 'Verwijder toekomstige',
        'delete-only-this-btn-text': 'Verwijder alleen deze',
        Yes: 'Ja',
        Cancel: 'Annuleer',
        width: 600
    }
};
```

---

## 5. Dynamisch Locale Laden

### 5.1 Async Loading

```typescript
import { LocaleHelper, LocaleManager } from '@bryntum/calendar';

class LocaleLoader {
    private loadedLocales = new Set<string>();

    /**
     * Laad locale on-demand
     */
    async loadLocale(localeName: string): Promise<void> {
        if (this.loadedLocales.has(localeName)) {
            return;
        }

        try {
            // Dynamisch importeren
            const module = await import(
                `@bryntum/calendar/locales/calendar.locale.${localeName}.js`
            );

            // Locale is automatisch gepubliceerd via het module script
            this.loadedLocales.add(localeName);
        } catch (error) {
            console.error(`Failed to load locale: ${localeName}`, error);
            throw error;
        }
    }

    /**
     * Wissel naar locale (laad indien nodig)
     */
    async switchLocale(localeName: string): Promise<void> {
        await this.loadLocale(localeName);
        await LocaleManager.applyLocale(localeName);
    }
}

// Gebruik
const loader = new LocaleLoader();

// Component
function LanguageSwitcher() {
    const languages = [
        { code: 'En', name: 'English' },
        { code: 'Nl', name: 'Nederlands' },
        { code: 'De', name: 'Deutsch' },
        { code: 'FrFr', name: 'Français' }
    ];

    async function handleChange(code: string) {
        await loader.switchLocale(code);
    }

    return languages.map(lang =>
        `<button onclick="handleChange('${lang.code}')">${lang.name}</button>`
    ).join('');
}
```

### 5.2 Bundelen met Webpack/Vite

```typescript
// webpack.config.js / vite.config.js

// Pre-load specifieke locales
import '@bryntum/calendar/locales/calendar.locale.Nl.js';
import '@bryntum/calendar/locales/calendar.locale.De.js';
import '@bryntum/calendar/locales/calendar.locale.FrFr.js';

// Of lazy loading met chunks
const localeModules = {
    Nl: () => import('@bryntum/calendar/locales/calendar.locale.Nl.js'),
    De: () => import('@bryntum/calendar/locales/calendar.locale.De.js'),
    FrFr: () => import('@bryntum/calendar/locales/calendar.locale.FrFr.js')
};
```

---

## 6. Custom Locale Maken

### 6.1 Volledige Custom Locale

```typescript
import { LocaleHelper } from '@bryntum/calendar';

// Custom Nederlandse locale met bedrijfsspecifieke termen
const customNlLocale: Locale = {
    localeName: 'NlCustom',
    localeDesc: 'Nederlands (Bedrijf)',
    localeCode: 'nl-NL',
    localeRtl: false,

    // Basis UI
    Object: {
        Yes: 'Ja',
        No: 'Nee',
        Cancel: 'Annuleren',
        Ok: 'OK',
        save: 'Opslaan',
        // Bedrijfsspecifiek
        newEvent: 'Nieuwe afspraak',
        information: 'Details'
    },

    // Calendar
    Calendar: {
        Today: 'Vandaag',
        allDay: 'Hele dag',
        plusMore: (n) => `+${n} meer`,
        noResources: 'Geen medewerkers beschikbaar'
    },

    // Event editing
    EventEdit: {
        Name: 'Titel',
        Resource: 'Medewerker',
        Start: 'Begin',
        End: 'Einde',
        Save: 'Opslaan',
        Delete: 'Verwijderen',
        Cancel: 'Annuleren',
        'Edit event': 'Afspraak bewerken'
    },

    // Date configuratie
    DateHelper: {
        locale: 'nl-NL',
        weekStartDay: 1,
        nonWorkingDays: { 0: true, 6: true },
        unitNames: [
            { single: 'milliseconde', plural: 'milliseconden', abbrev: 'ms' },
            { single: 'seconde', plural: 'seconden', abbrev: 'sec' },
            { single: 'minuut', plural: 'minuten', abbrev: 'min' },
            { single: 'uur', plural: 'uren', abbrev: 'u' },
            { single: 'dag', plural: 'dagen', abbrev: 'd' },
            { single: 'week', plural: 'weken', abbrev: 'wk' },
            { single: 'maand', plural: 'maanden', abbrev: 'mnd' },
            { single: 'kwartaal', plural: 'kwartalen', abbrev: 'kw' },
            { single: 'jaar', plural: 'jaren', abbrev: 'jr' }
        ],
        parsers: {
            L: 'DD-MM-YYYY',
            LT: 'HH:mm',
            LTS: 'HH:mm:ss'
        },
        ordinalSuffix: (n) => n === 1 ? 'ste' : 'de'
    }
};

// Publiceer
LocaleHelper.publishLocale(customNlLocale);
```

### 6.2 Locale Extenden

```typescript
import { LocaleHelper } from '@bryntum/calendar';

// Haal bestaande locale
const baseNl = LocaleHelper.locales.Nl;

// Extend met custom strings
const extendedNl = LocaleHelper.mergeLocales(baseNl, {
    localeName: 'NlExtended',

    // Override specifieke keys
    Calendar: {
        noResources: 'Geen teamleden beschikbaar',
        loadFail: 'Kon agenda niet laden. Probeer opnieuw.'
    },

    EventEdit: {
        Resource: 'Teamlid'
    },

    // Voeg custom namespace toe
    CustomApp: {
        welcomeMessage: 'Welkom bij de planner',
        noAppointments: 'Geen afspraken vandaag'
    }
});

LocaleHelper.publishLocale('NlExtended', extendedNl);
```

---

## 7. RTL (Right-to-Left) Support

### 7.1 RTL Locale Configuratie

```typescript
const arabicLocale: Locale = {
    localeName: 'Ar',
    localeDesc: 'العربية',
    localeCode: 'ar',
    localeRtl: true,  // Activeer RTL

    Object: {
        Yes: 'نعم',
        No: 'لا',
        Cancel: 'إلغاء',
        Ok: 'موافق'
    },

    Calendar: {
        Today: 'اليوم',
        Tomorrow: 'غداً',
        allDay: 'طوال اليوم'
    },

    DateHelper: {
        locale: 'ar',
        weekStartDay: 6,  // Zaterdag in Arabische landen
        nonWorkingDays: { 5: true, 6: true },  // Vrijdag, Zaterdag
        parsers: {
            L: 'DD/MM/YYYY',
            LT: 'HH:mm'
        }
    }
};
```

### 7.2 RTL CSS

```css
/* Automatische RTL styling */
[dir="rtl"] .b-calendar {
    direction: rtl;
}

[dir="rtl"] .b-cal-event-bar {
    text-align: right;
}

[dir="rtl"] .b-toolbar {
    flex-direction: row-reverse;
}

/* RTL specifieke overrides */
.b-rtl .b-dayview-day-container {
    border-left: none;
    border-right: 1px solid var(--b-border-color);
}
```

---

## 8. Datum/Tijd Formatting

### 8.1 DateHelper Configuratie

```typescript
const dateLocale = {
    DateHelper: {
        // Intl.DateTimeFormat locale
        locale: 'nl-NL',

        // Week start (0 = zondag, 1 = maandag)
        weekStartDay: 1,

        // Niet-werkdagen
        nonWorkingDays: {
            0: true,  // Zondag
            6: true   // Zaterdag
        },

        // Weekend dagen (voor styling)
        weekends: {
            0: true,
            6: true
        },

        // Datum/tijd formats
        parsers: {
            L: 'DD-MM-YYYY',        // Locale date
            LT: 'HH:mm',            // Locale time
            LTS: 'HH:mm:ss',        // Locale time with seconds
            LL: 'D MMMM YYYY',      // Long date
            LLL: 'D MMMM YYYY HH:mm' // Long date with time
        },

        // Decade formatting
        decade: (year: number | Date) => {
            const y = typeof year === 'number' ? year : year.getFullYear();
            return `jaren ${y - y % 10}`;
        }
    }
};
```

### 8.2 Custom Date Formats

```typescript
import { DateHelper } from '@bryntum/calendar';

// Formatteer datum
const date = new Date('2024-03-15T14:30:00');

// Met locale format
const formatted = DateHelper.format(date, 'L');      // "15-03-2024"
const timeOnly = DateHelper.format(date, 'LT');      // "14:30"
const longDate = DateHelper.format(date, 'LL');      // "15 maart 2024"

// Custom format
const custom = DateHelper.format(date, 'dddd D MMMM'); // "vrijdag 15 maart"

// Relatieve tijd
const relative = DateHelper.formatDelta(
    { days: 2, hours: 3 },
    true  // use abbreviations
);  // "2d 3u"
```

---

## 9. Localizable Mixin

### 9.1 TypeScript Interface
```typescript
// calendar.d.ts:80067
type LocalizableClassConfig = {
    // Class voor vertalingen
    localeClass?: typeof Base

    // Localization in-/uitschakelen
    localizable?: boolean

    // Properties voor automatische vertaling
    localizableProperties?: string[]
}
```

### 9.2 Localizable Component

```typescript
import { Widget, Localizable } from '@bryntum/calendar';

class LocalizedButton extends Localizable(Widget) {
    static configurable = {
        // Properties die automatisch vertaald worden
        localizableProperties: ['text', 'tooltip'],

        // Locale class voor lookup
        localeClass: null,  // Gebruik eigen class

        text: 'L{saveButton}',
        tooltip: 'L{saveButtonTooltip}'
    };

    // Definieer vertalingen op class level
    static $locale = {
        saveButton: 'Save',
        saveButtonTooltip: 'Click to save changes'
    };
}

// Voeg vertalingen toe aan locale
LocaleHelper.publishLocale('Nl', {
    LocalizedButton: {
        saveButton: 'Opslaan',
        saveButtonTooltip: 'Klik om wijzigingen op te slaan'
    }
});
```

### 9.3 L() Functie

```typescript
import { Widget } from '@bryntum/calendar';

class MyWidget extends Widget {
    render() {
        // Haal vertaling op met L() functie
        const saveText = this.L('L{save}');
        const cancelText = this.L('L{cancel}');

        // Met parameters
        const confirmText = this.L('L{confirmDelete}', { name: 'Event 1' });

        return `
            <button>${saveText}</button>
            <button>${cancelText}</button>
        `;
    }
}

// Locale
LocaleHelper.publishLocale('Nl', {
    MyWidget: {
        save: 'Opslaan',
        cancel: 'Annuleren',
        confirmDelete: ({ name }) => `Weet u zeker dat u "${name}" wilt verwijderen?`
    }
});
```

---

## 10. Implementatie Eigen Systeem

### 10.1 Locale Store

```typescript
interface LocaleStore {
    currentLocale: string
    locales: Map<string, Locale>
    listeners: Set<(locale: string) => void>
}

class CustomLocaleManager {
    private store: LocaleStore = {
        currentLocale: 'en',
        locales: new Map(),
        listeners: new Set()
    };

    /**
     * Registreer locale
     */
    registerLocale(locale: Locale): void {
        this.store.locales.set(locale.localeName!, locale);
    }

    /**
     * Activeer locale
     */
    setLocale(name: string): void {
        if (!this.store.locales.has(name)) {
            throw new Error(`Locale "${name}" not found`);
        }

        this.store.currentLocale = name;
        this.notifyListeners();
    }

    /**
     * Haal vertaling op
     */
    translate(key: string, params?: object): string {
        const locale = this.store.locales.get(this.store.currentLocale);
        if (!locale) return key;

        // Parse key path (bijv. "Calendar.Today")
        const parts = key.split('.');
        let value: any = locale;

        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) return key;
        }

        // Functie of string
        if (typeof value === 'function') {
            return value(params || {});
        }

        return String(value);
    }

    /**
     * Subscribe to locale changes
     */
    subscribe(callback: (locale: string) => void): () => void {
        this.store.listeners.add(callback);
        return () => this.store.listeners.delete(callback);
    }

    private notifyListeners(): void {
        this.store.listeners.forEach(fn => fn(this.store.currentLocale));
    }

    /**
     * Huidige locale
     */
    get locale(): Locale | undefined {
        return this.store.locales.get(this.store.currentLocale);
    }

    /**
     * Beschikbare locales
     */
    get availableLocales(): string[] {
        return Array.from(this.store.locales.keys());
    }
}

// Singleton
export const localeManager = new CustomLocaleManager();
```

### 10.2 React Integration

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { LocaleManager } from '@bryntum/calendar';

// Context
interface LocaleContextType {
    locale: string
    setLocale: (locale: string) => Promise<void>
    t: (key: string, params?: object) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null);

// Provider
export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState('En');

    async function setLocale(newLocale: string) {
        await LocaleManager.applyLocale(newLocale);
        setLocaleState(newLocale);
    }

    function t(key: string, params?: object): string {
        const current = LocaleManager.locales[locale];
        if (!current) return key;

        const parts = key.split('.');
        let value: any = current;

        for (const part of parts) {
            value = value?.[part];
        }

        if (typeof value === 'function') {
            return value(params);
        }

        return value ?? key;
    }

    useEffect(() => {
        // Sync met Bryntum LocaleManager
        LocaleManager.onLocale = ({ locale: loc }) => {
            setLocaleState(loc.localeName);
        };
    }, []);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

// Hook
export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return context;
}

// Component
function CalendarToolbar() {
    const { locale, setLocale, t } = useLocale();

    return (
        <div>
            <button onClick={() => setLocale('Nl')}>
                {t('Calendar.Today')}
            </button>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
            >
                <option value="En">English</option>
                <option value="Nl">Nederlands</option>
                <option value="De">Deutsch</option>
            </select>
        </div>
    );
}
```

---

## 11. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 1573: LocaleKeys type
- `calendar.d.ts` regel 1585: Locale type
- `calendar.d.ts` regel 1611: Locales type
- `calendar.d.ts` regel 79990: LocaleHelper class
- `calendar.d.ts` regel 80028: LocaleManagerSingleton
- `calendar.d.ts` regel 80062: LocaleManager export
- `calendar.d.ts` regel 80067: LocalizableClassConfig

### Locale Files
- `build/locales/calendar.locale.Nl.js` - Nederlands
- `build/locales/calendar.locale.En.js` - Engels (standaard)
- `build/locales/calendar.locale.*.js` - 45+ talen

---

## 12. Samenvatting

Het Bryntum localisatiesysteem biedt:

1. **45+ ingebouwde talen** met volledige vertalingen
2. **LocaleHelper** voor locale management en publicatie
3. **LocaleManager** singleton voor runtime wisselen
4. **Dynamisch laden** van locales on-demand
5. **RTL ondersteuning** voor Arabisch, Hebreeuws etc.
6. **DateHelper integratie** voor datum/tijd formatting
7. **Localizable mixin** voor custom components
8. **L() functie** voor programmatische vertalingen
9. **Merge mogelijkheid** om locales te extenden

Key patterns:
```typescript
// Publiceren
LocaleHelper.publishLocale('CustomNl', { ... });

// Toepassen
await LocaleManager.applyLocale('CustomNl');

// Vertalen
const text = this.L('L{key}', { param: 'value' });
```
