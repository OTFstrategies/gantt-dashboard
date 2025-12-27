# Grid Implementation: Localization

> **Localization** voor het vertalen van de Grid interface naar verschillende talen.

---

## Overzicht

Bryntum Grid ondersteunt volledige localisatie met de LocaleManager.

```
+--------------------------------------------------------------------------+
| GRID  [Name width: 150] [Show/Hide 42 ▼] [☑ Sort by city] [Date: ____]   |
+--------------------------------------------------------------------------+
|  Naam         |  Leeftijd  |  Stad      |  Eten      |  Kleur    | Datum |
+--------------------------------------------------------------------------+
|  John         |  32        |  Parijs    |  Pizza     |  Blauw    | 15 jan|
|  Jane         |  28        |  Londen    |  Sushi     |  Rood     | 20 jan|
+--------------------------------------------------------------------------+
|                                                                          |
|  LOCALIZATION FEATURES:                                                  |
|    L{key}         - Localization syntax in strings                       |
|    LocaleManager  - Central locale management                            |
|    Localizable()  - Localization mixin                                   |
|    Custom locales - Project-specific translations                        |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Localization Setup

### 1.1 Enable Localization

```javascript
import { Grid, DataGenerator, LocaleManager, Localizable } from '@bryntum/grid';

// Enable missing localization Error throwing for development
LocaleManager.throwOnMissingLocale = true;

const grid = new Grid({
    appendTo: 'container',

    tbar: {
        items: {
            myNumber: {
                type: 'numberfield',
                value: 150,
                min: 100,
                max: 250,
                // Use L{} syntax for localized labels
                label: 'L{Name width:}',
                tooltip: 'L{Tooltip.Width of name column in pixels}',
                onChange(event) {
                    grid.columns.getAt(0).width = event.value;
                }
            },
            checkbox: {
                type: 'checkbox',
                text: 'L{Checkbox.Sort by city}',
                onChange() {
                    grid.store.sort('city');
                },
                tooltip: {
                    html: 'L{Tooltip.longText}',
                    width: '20em'
                }
            },
            date: {
                type: 'datefield',
                label: 'L{Date:}',
                placeholder: 'L{Select date}',
                width: '18em'
            }
        }
    },

    columns: [
        // Localized column headers
        { text: 'L{Name}', field: 'name', width: 150 },
        { text: 'L{Age}', field: 'age', flex: 1, type: 'number' },
        { text: 'L{City}', field: 'city', flex: 2 },
        { text: 'L{Food}', field: 'food', flex: 2 },
        { text: 'L{Color}', field: 'color', width: 180 },
        { text: 'L{Date}', field: 'start', flex: 2, type: 'date' }
    ],

    data: DataGenerator.generateData(50),

    // Update localization when locale changes
    onLocaleUpdated() {
        this.setDemoTitle();
        this.updateButtonText();
    },

    setDemoTitle() {
        const title = Localizable().L('L{App.Localization demo}');
        document.querySelector('#title').innerHTML = `<h1>${title}</h1>`;
        document.title = title;
    },

    updateButtonText() {
        const { myButton } = this.tbar.widgetMap;
        // L function with data parameter
        myButton.text = myButton.L('L{Show/Hide}', Math.floor(Math.random() * 100));
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
```

---

## 2. Creating Custom Locales

### 2.1 Dutch Locale File

```javascript
// locales/nl.js
const locale = {
    localeName: 'Nl',
    localeDesc: 'Nederlands',
    localeCode: 'nl',

    // Application specific translations
    App: {
        'Localization demo': 'Lokalisatie demo'
    },

    // Column headers
    Name: 'Naam',
    Age: 'Leeftijd',
    City: 'Stad',
    Food: 'Eten',
    Color: 'Kleur',
    Date: 'Datum',

    // Form labels
    'Name width:': 'Naam breedte:',
    'Select date': 'Selecteer datum',
    'Date:': 'Datum:',

    // Checkbox
    Checkbox: {
        'Sort by city': 'Sorteer op stad'
    },

    // Tooltips
    Tooltip: {
        'Width of name column in pixels': 'Breedte van naam kolom in pixels',
        'longText': 'Dit is een lange tooltip tekst met veel informatie.'
    },

    // Button with parameter
    'Show/Hide': 'Tonen/Verbergen ({0})',

    // Validation messages
    minValueError: 'Waarde moet minimaal {0} zijn',
    maxValueError: 'Waarde mag maximaal {0} zijn'
};

export default locale;
```

### 2.2 Register Custom Locale

```javascript
import { LocaleHelper } from '@bryntum/grid';
import nlLocale from './locales/nl.js';

// Register the locale
LocaleHelper.publishLocale(nlLocale);

// Apply the locale
LocaleManager.applyLocale('Nl');
```

---

## 3. Dynamic Localization

### 3.1 Get Localized Errors

```javascript
const numberField = {
    type: 'numberfield',
    value: 150,
    min: 100,
    max: 250,
    getErrors() {
        const me = this;
        const value = me.value;

        if (value < me.min) {
            // L function with parameter substitution
            return [me.L('L{minValueError}', me.min)];
        }
        if (value > me.max) {
            return [me.L('L{maxValueError}', me.max)];
        }
    }
};
```

### 3.2 Prevent Default Localization

```javascript
{
    type: 'button',
    // Prevent automatic localization of properties
    localizableProperties: [],
    // Set text manually
    text: 'Custom text that won\'t be localized'
}
```

---

## 4. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { LocaleManager, LocaleHelper, Localizable } from '@bryntum/grid';
import { useState, useEffect, useMemo, useCallback } from 'react';

// Import locales
import nlLocale from './locales/nl';
import deLocale from './locales/de';
import frLocale from './locales/fr';

// Register locales
LocaleHelper.publishLocale(nlLocale);
LocaleHelper.publishLocale(deLocale);
LocaleHelper.publishLocale(frLocale);

const AVAILABLE_LOCALES = [
    { code: 'En', name: 'English' },
    { code: 'Nl', name: 'Nederlands' },
    { code: 'De', name: 'Deutsch' },
    { code: 'Fr', name: 'Français' }
];

function LocalizedGrid({ data }) {
    const [currentLocale, setCurrentLocale] = useState('En');
    const [title, setTitle] = useState('');

    useEffect(() => {
        const updateTitle = () => {
            setTitle(Localizable().L('L{App.Grid Demo}'));
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

    const gridConfig = useMemo(() => ({
        columns: [
            { text: 'L{Name}', field: 'name', width: 150 },
            { text: 'L{Age}', field: 'age', type: 'number', width: 80 },
            { text: 'L{City}', field: 'city', flex: 1 },
            { text: 'L{Date}', field: 'date', type: 'date', flex: 1 }
        ]
    }), []);

    return (
        <div className="localized-grid">
            <div className="toolbar">
                <h1>{title}</h1>
                <div className="locale-switcher">
                    {AVAILABLE_LOCALES.map(locale => (
                        <button
                            key={locale.code}
                            className={currentLocale === locale.code ? 'active' : ''}
                            onClick={() => handleLocaleChange(locale.code)}
                        >
                            {locale.name}
                        </button>
                    ))}
                </div>
            </div>

            <BryntumGrid
                data={data}
                {...gridConfig}
            />
        </div>
    );
}
```

---

## 5. Styling

```css
/* Locale switcher */
.locale-switcher {
    display: flex;
    gap: 4px;
}

.locale-switcher button {
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.locale-switcher button.active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

/* RTL support */
.b-rtl .b-grid-cell {
    text-align: right;
}

.b-rtl .b-field-inner {
    flex-direction: row-reverse;
}

/* Number formatting */
.b-number-cell {
    font-variant-numeric: tabular-nums;
}

/* Date formatting */
.b-date-cell {
    white-space: nowrap;
}
```

---

## 6. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| L{key} niet vertaald | Key niet in locale | Voeg key toe aan locale file |
| Runtime error | throwOnMissingLocale: true | Voeg ontbrekende key toe |
| Locale niet toegepast | applyLocale niet aangeroepen | Roep LocaleManager.applyLocale() aan |
| Update niet zichtbaar | Listener mist | Voeg locale event listener toe |

---

## API Reference

### LocaleManager Methods

| Method | Description |
|--------|-------------|
| `applyLocale(code)` | Apply locale by code |
| `on('locale', fn)` | Listen for locale changes |
| `un('locale', fn)` | Remove listener |

### LocaleManager Properties

| Property | Type | Description |
|----------|------|-------------|
| `throwOnMissingLocale` | Boolean | Throw on missing key |
| `locale` | Object | Current locale |

### Localizable Mixin

| Method | Description |
|--------|-------------|
| `L(key, ...params)` | Get localized string |

### LocaleHelper Methods

| Method | Description |
|--------|-------------|
| `publishLocale(locale)` | Register locale |

### Locale File Structure

```javascript
{
    localeName: 'Code',      // Short code
    localeDesc: 'Full Name', // Display name
    localeCode: 'code',      // Language code

    // Keys can be nested
    App: {
        'Key': 'Translation'
    },

    // Or flat
    'Key': 'Translation',

    // With parameters
    'Key {0}': 'Translation {0}'
}
```

---

## Bronnen

- **Example**: `examples/localization/`
- **LocaleManager**: `Core.localization.LocaleManager`
- **LocaleHelper**: `Core.localization.LocaleHelper`

---

*Priority 2: Medium Priority Features*
