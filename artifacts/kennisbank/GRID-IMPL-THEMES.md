# Grid Implementation: Themes

> **Themes** voor het configureren en switchen van visuele thema's.

---

## Overzicht

Bryntum Grid biedt meerdere thema's en ondersteunt runtime theme switching en custom primary colors.

```
+--------------------------------------------------------------------------+
| GRID  Theme: [Material3] [Stockholm] [Svalbard] [Visby] [High Contrast]  |
|              [Light ●] [Dark]     Primary color: [████ #1976d2 ▼]        |
+--------------------------------------------------------------------------+
|  #  |  Name           |  Type        |  Spending   |  Budget     |      |
+--------------------------------------------------------------------------+
|  1  |  Project Alpha  |  🎨 Design    |  $12,500.00 |  ████ $20K  | ●    |
|  2  |  Project Beta   |  🔨 Constr.   |  $45,000.00 |  ███ $50K   | ●    |
|  3  |  Project Gamma  |  📋 Admin     |  $8,200.00  |  █████ $10K | ●    |
+--------------------------------------------------------------------------+
|                                                                          |
|  AVAILABLE THEMES:                                                       |
|    - Material3 (Light/Dark)                                              |
|    - Stockholm (Light/Dark)                                              |
|    - Svalbard (Light/Dark)                                               |
|    - Visby (Light/Dark)                                                  |
|    - High Contrast (Light/Dark)                                          |
|                                                                          |
|  PRIMARY COLOR: Customizable via CSS variable --b-primary                |
+--------------------------------------------------------------------------+
```

---

## 1. Basic Theme Setup

### 1.1 Theme Switcher Toolbar

```javascript
import { Grid, DateHelper, DomHelper, Model, GlobalEvents } from '@bryntum/grid';

class Project extends Model {
    static fields = [
        'name',
        'type',
        'status',
        { name: 'cost', type: 'number' },
        { name: 'budget', type: 'number' },
        { name: 'deadline', type: 'date' }
    ];

    get progress() {
        return (this.completedTasks / this.taskCount) * 100;
    }
}

const grid = new Grid({
    appendTo: 'container',
    rowHeight: 55,

    columns: [
        { type: 'rownumber' },
        { text: 'Name', field: 'name', width: 200 },
        {
            text: 'Status',
            field: 'status',
            width: 100,
            renderer({ value }) {
                return value ? {
                    class: 'status ' + value.toLowerCase().replace(' ', ''),
                    text: value
                } : '';
            }
        },
        {
            text: 'Spending',
            field: 'cost',
            width: 130,
            type: 'number',
            format: '$0,000.00'
        }
    ],

    store: {
        modelClass: Project,
        readUrl: 'data/data.json',
        autoLoad: true
    },

    tbar: [
        { type: 'label', text: 'Theme' },
        {
            ref: 'themeName',
            type: 'buttonGroup',
            rendition: 'padded-filled',
            toggleGroup: true,
            items: ['Material3', 'Stockholm', 'Svalbard', 'Visby', 'High Contrast'].map(name => {
                const value = name.toLowerCase().replaceAll(' ', '-');
                return {
                    id: value,
                    text: name,
                    value,
                    pressed: DomHelper.themeInfo.name.startsWith(name)
                };
            }),
            onAction() {
                changeTheme();
            }
        },
        {
            ref: 'themeVariant',
            type: 'buttonGroup',
            rendition: 'padded-filled',
            toggleGroup: true,
            items: ['Light', 'Dark'].map(name => ({
                id: name.toLowerCase(),
                text: name,
                value: name.toLowerCase(),
                pressed: DomHelper.themeInfo.name.endsWith(name)
            })),
            onAction() {
                changeTheme();
            }
        },
        {
            ref: 'primaryColor',
            type: 'colorfield',
            addNoColorItem: false,
            label: 'Primary color',
            width: '20em',
            value: DomHelper.primaryColor,
            onChange({ value, userAction }) {
                if (userAction) {
                    document.body.style.setProperty('--b-primary', value);
                }
            }
        }
    ]
});

function changeTheme() {
    DomHelper.setTheme(`${grid.widgetMap.themeName.value}-${grid.widgetMap.themeVariant.value}`);
}

// Listen for theme changes
GlobalEvents.on({
    theme(themeChangeEvent) {
        const
            name = themeChangeEvent.theme.substring(0, themeChangeEvent.theme.lastIndexOf('-')),
            variant = DomHelper.isDarkTheme ? 'dark' : 'light';

        // Update pressed state of buttons
        grid.widgetMap.themeName.items.find(b => b.value === name).pressed = true;
        grid.widgetMap.themeVariant.items.find(b => b.value === variant).pressed = true;
    },

    primaryColorChange(event) {
        grid.widgetMap.primaryColor.value = event.primaryColor;
    }
});
```

---

## 2. Programmatic Theme Switching

### 2.1 Set Theme Programmatically

```javascript
import { DomHelper } from '@bryntum/grid';

// Get current theme info
const themeInfo = DomHelper.themeInfo;
console.log('Current theme:', themeInfo.name);
console.log('Is dark theme:', DomHelper.isDarkTheme);

// Set specific theme
DomHelper.setTheme('material3-dark');
DomHelper.setTheme('stockholm-light');
DomHelper.setTheme('high-contrast-dark');

// Toggle dark mode
function toggleDarkMode() {
    const currentTheme = DomHelper.themeInfo.name;
    const baseName = currentTheme.substring(0, currentTheme.lastIndexOf('-'));
    const newVariant = DomHelper.isDarkTheme ? 'light' : 'dark';
    DomHelper.setTheme(`${baseName}-${newVariant}`);
}
```

### 2.2 Custom Primary Color

```javascript
// Set primary color via CSS variable
document.body.style.setProperty('--b-primary', '#FF5722');

// Get current primary color
const primaryColor = DomHelper.primaryColor;

// Set via DomHelper
DomHelper.primaryColor = '#4CAF50';
```

---

## 3. React Integration

```jsx
import { BryntumGrid } from '@bryntum/grid-react';
import { DomHelper, GlobalEvents } from '@bryntum/grid';
import { useState, useEffect, useMemo, useCallback } from 'react';

const THEMES = [
    { name: 'Material3', value: 'material3' },
    { name: 'Stockholm', value: 'stockholm' },
    { name: 'Svalbard', value: 'svalbard' },
    { name: 'Visby', value: 'visby' },
    { name: 'High Contrast', value: 'high-contrast' }
];

function ThemedGrid({ data }) {
    const [currentTheme, setCurrentTheme] = useState(() => {
        const info = DomHelper.themeInfo;
        return info.name.substring(0, info.name.lastIndexOf('-'));
    });
    const [isDark, setIsDark] = useState(() => DomHelper.isDarkTheme);
    const [primaryColor, setPrimaryColor] = useState(() => DomHelper.primaryColor);

    useEffect(() => {
        const handleThemeChange = (event) => {
            const name = event.theme.substring(0, event.theme.lastIndexOf('-'));
            setCurrentTheme(name);
            setIsDark(DomHelper.isDarkTheme);
        };

        const handleColorChange = (event) => {
            setPrimaryColor(event.primaryColor);
        };

        GlobalEvents.on('theme', handleThemeChange);
        GlobalEvents.on('primaryColorChange', handleColorChange);

        return () => {
            GlobalEvents.un('theme', handleThemeChange);
            GlobalEvents.un('primaryColorChange', handleColorChange);
        };
    }, []);

    const handleThemeChange = useCallback((themeName) => {
        setCurrentTheme(themeName);
        DomHelper.setTheme(`${themeName}-${isDark ? 'dark' : 'light'}`);
    }, [isDark]);

    const handleVariantChange = useCallback((dark) => {
        setIsDark(dark);
        DomHelper.setTheme(`${currentTheme}-${dark ? 'dark' : 'light'}`);
    }, [currentTheme]);

    const handleColorChange = useCallback((color) => {
        setPrimaryColor(color);
        document.body.style.setProperty('--b-primary', color);
    }, []);

    const gridConfig = useMemo(() => ({
        rowHeight: 55,
        columns: [
            { type: 'rownumber' },
            { text: 'Name', field: 'name', width: 200 },
            { text: 'Status', field: 'status', width: 100 },
            { text: 'Cost', field: 'cost', type: 'number', format: '$0,000.00' }
        ]
    }), []);

    return (
        <div className="themed-grid">
            <div className="theme-toolbar">
                <div className="theme-group">
                    <span>Theme:</span>
                    {THEMES.map(theme => (
                        <button
                            key={theme.value}
                            className={currentTheme === theme.value ? 'active' : ''}
                            onClick={() => handleThemeChange(theme.value)}
                        >
                            {theme.name}
                        </button>
                    ))}
                </div>

                <div className="variant-group">
                    <button
                        className={!isDark ? 'active' : ''}
                        onClick={() => handleVariantChange(false)}
                    >
                        Light
                    </button>
                    <button
                        className={isDark ? 'active' : ''}
                        onClick={() => handleVariantChange(true)}
                    >
                        Dark
                    </button>
                </div>

                <label className="color-picker">
                    Primary:
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                    />
                </label>
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

## 4. Styling

```css
/* Theme toolbar */
.theme-toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: var(--b-panel-background, #f5f5f5);
    border-bottom: 1px solid var(--b-border-color, #e0e0e0);
    flex-wrap: wrap;
}

.theme-group,
.variant-group {
    display: flex;
    gap: 4px;
}

.theme-toolbar button {
    padding: 8px 16px;
    border: 1px solid var(--b-border-color, #e0e0e0);
    background: var(--b-widget-background, white);
    color: var(--b-text-color, #333);
    cursor: pointer;
    transition: all 0.2s;
}

.theme-toolbar button:hover {
    background: var(--b-button-hover-background, #f0f0f0);
}

.theme-toolbar button.active {
    background: var(--b-primary, #1976d2);
    color: white;
    border-color: var(--b-primary, #1976d2);
}

/* Color picker */
.color-picker {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-picker input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--b-border-color, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
}

/* Status badges with theme colors */
.status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.status.active {
    background: var(--b-color-green-200);
    color: var(--b-color-green-800);
}

.status.pending {
    background: var(--b-color-yellow-200);
    color: var(--b-color-yellow-800);
}

.status.overdue {
    background: var(--b-color-red-200);
    color: var(--b-color-red-800);
}

/* Dark theme overrides */
.b-theme-dark .status.active {
    background: var(--b-color-green-800);
    color: var(--b-color-green-200);
}
```

---

## 5. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Theme verandert niet | setTheme niet aangeroepen | Gebruik DomHelper.setTheme() |
| Primary color reset | Verkeerde timing | Set na theme change |
| Dark mode niet correct | CSS variables missen | Check theme CSS import |
| Buttons niet gesync'd | GlobalEvents listener mist | Voeg theme event listener toe |

---

## API Reference

### DomHelper Theme Methods

| Method | Description |
|--------|-------------|
| `setTheme(themeName)` | Set theme by name |
| `themeInfo` | Get current theme info |
| `isDarkTheme` | Check if dark theme |
| `primaryColor` | Get/set primary color |

### GlobalEvents

| Event | Description |
|-------|-------------|
| `theme` | Theme changed |
| `primaryColorChange` | Primary color changed |

### Available Themes

| Theme | Variants |
|-------|----------|
| `material3` | light, dark |
| `stockholm` | light, dark |
| `svalbard` | light, dark |
| `visby` | light, dark |
| `high-contrast` | light, dark |

### CSS Variables

| Variable | Description |
|----------|-------------|
| `--b-primary` | Primary color |
| `--b-text-color` | Text color |
| `--b-panel-background` | Panel background |
| `--b-border-color` | Border color |

---

## Bronnen

- **Example**: `examples/themes/`
- **DomHelper**: `Core.helper.DomHelper`
- **GlobalEvents**: `Core.GlobalEvents`

---

*Priority 2: Medium Priority Features*
