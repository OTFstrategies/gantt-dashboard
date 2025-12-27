# Grid Implementation: Facet Filter

> **Multi-dimensionele filtering** met visuele filter panels, checkbox-based selectie, en dynamische filter combinaties voor geavanceerde data exploratie.

---

## Overzicht

Facet filtering biedt een gebruiksvriendelijke manier om data te filteren via visuele checkbox panels. Elke facet toont unieke waarden van een veld, en gebruikers kunnen meerdere waarden selecteren om de grid te filteren.

```
┌─────────────────┐  ┌─────────────────────────────────────────┐
│ FILTER PANEL    │  │               GRID                      │
├─────────────────┤  ├─────────────────────────────────────────┤
│ ▼ Project       │  │ Name        │ Project │ Priority │ ... │
│ ☑ Project A     │  ├─────────────┼─────────┼──────────┼─────┤
│ ☐ Project B     │  │ Analysis    │ Proj A  │ High     │     │
│ ☐ Project C     │  │ Design      │ Proj A  │ Medium   │     │
├─────────────────┤  │ Risk Assess │ Proj A  │ High     │     │
│ ▼ Priority      │  │ ...         │         │          │     │
│ ☑ High          │  └─────────────┴─────────┴──────────┴─────┘
│ ☐ Medium        │
│ ☐ Low           │       Gefilterd: Project A + High Priority
└─────────────────┘
```

---

## 1. FacetFilter Widget

### 1.1 Basis Widget Structuur

De FacetFilter is een custom Panel widget die dynamisch checkboxes genereert voor veld-waarden.

```javascript
import { Panel, Widget, StringHelper } from '@bryntum/grid';

class FacetFilter extends Panel {
    // Vereist voor minified code
    static $name = 'FacetFilter';

    // Widget type voor config instantiatie
    static type = 'facetfilter';

    // Configureerbare properties
    static configurable = {
        layout      : 'vbox',
        ui          : 'toolbar',
        collapsible : {
            direction : 'up'
        },
        // Grid referentie
        grid      : null,
        // Veld om te filteren
        fieldName : null
    };

    // Haal unieke waarden op uit store
    static getFieldValues(dataStore, fieldName) {
        const
            field        = dataStore.modelClass.getFieldDefinition(fieldName),
            uniqueValues = dataStore.getDistinctValues(fieldName).filter(v => v);

        // Sorteer op basis van field type
        if (field.type === 'number') {
            uniqueValues.sort((a, b) => a - b);
        }
        else {
            uniqueValues.sort((a, b) => String(a).localeCompare(String(b)));
        }

        return uniqueValues;
    }
}

// Registreer widget type
FacetFilter.initClass();
```

### 1.2 Dynamische Checkbox Generatie

De `refreshOptions()` methode bouwt checkboxes voor elke unieke waarde:

```javascript
refreshOptions() {
    const
        me     = this,
        column = me.grid.columns.get(me.fieldName),
        values = FacetFilter.getFieldValues(me.grid.store, me.fieldName);

    // Panel title = kolom header
    me.title = StringHelper.encodeHtml(column.text);

    // Ondersteun id/label tuples: [[1, 'Label'], [2, 'Other']]
    const hasIds = Array.isArray(values?.[0]);

    // Genereer checkbox items
    me.items = values.map(value => ({
        type         : 'checkbox',
        checkedValue : StringHelper.encodeHtml(hasIds ? value[0] : value),
        text         : StringHelper.encodeHtml(hasIds ? value[1] : value),
        fieldName    : me.fieldName,
        listeners    : {
            change : 'up.onCheckboxChange'
        }
    }));
}
```

### 1.3 Grid Binding met Auto-Refresh

Wanneer de grid config wordt gezet, worden store listeners toegevoegd:

```javascript
updateGrid(grid) {
    this.refreshOptions();

    // Luister naar store changes
    grid.store.on({
        add     : 'refreshOptions',
        update  : 'refreshOptions',
        remove  : 'refreshOptions',
        thisObj : this
    });
}
```

---

## 2. Filter Logic

### 2.1 Filter Handler

De centrale filter logic verzamelt alle actieve checkboxes en past filters toe:

```javascript
onCheckboxChange({ source }) {
    // Visual feedback op actieve checkbox
    source.cls = { 'b-facetfilter-item-active' : source.checked };

    const
        filters   = {},
        { store } = this.grid;

    // Verzamel alle checked checkboxes met fieldName
    for (const checkBox of Widget.queryAll(source.type)
        .filter(cb => cb.checked && cb.fieldName)) {

        // Bouw filter array per veld
        filters[checkBox.fieldName] = [
            ...filters[checkBox.fieldName] ?? [],
            // Type conversie voor numbers
            checkBox.fieldName === 'effectiveness'
                ? parseInt(checkBox.checkedValue)
                : checkBox.checkedValue
        ];
    }

    // Clear alle bestaande filters
    store.clearFilters();

    // Apply nieuwe filters
    for (const fieldName in filters) {
        store.filter({
            id       : fieldName,
            property : fieldName,
            operator : 'isIncludedIn',
            value    : filters[fieldName]
        });
    }
}
```

### 2.2 Filter Operators

De `isIncludedIn` operator controleert of een waarde in een array zit:

```javascript
// Store filter operators
{
    // Standaard operators
    '='           : (value, filterValue) => value === filterValue,
    '!='          : (value, filterValue) => value !== filterValue,
    '>'           : (value, filterValue) => value > filterValue,
    '<'           : (value, filterValue) => value < filterValue,

    // Array operators voor facets
    'isIncludedIn': (value, filterValue) => filterValue.includes(value),
    'includes'    : (value, filterValue) => value.includes(filterValue),

    // String operators
    'startsWith'  : (value, filterValue) => String(value).startsWith(filterValue),
    'endsWith'    : (value, filterValue) => String(value).endsWith(filterValue),
    '*'           : (value, filterValue) => String(value).toLowerCase()
                        .includes(String(filterValue).toLowerCase())
}
```

### 2.3 Meerdere Facets Combineren

Filters worden gecombineerd met AND logica:

```javascript
// Resulterende filters bij:
// - Project: [A, B] geselecteerd
// - Priority: [High] geselecteerd

store.filter([
    {
        id       : 'project',
        property : 'project',
        operator : 'isIncludedIn',
        value    : ['Project A', 'Project B']  // OR binnen facet
    },
    {
        id       : 'priority',
        property : 'priority',
        operator : 'isIncludedIn',
        value    : ['High']
    }
]);
// Resultaat: (Project A OR Project B) AND (Priority High)
```

---

## 3. Complete Implementatie

### 3.1 Data Model

```javascript
import { GridRowModel } from '@bryntum/grid';

class Task extends GridRowModel {
    static $name = 'Task';

    static fields = [
        'name',
        'project',
        'status',
        'priority',
        'assignedTo',
        { name : 'dueDate', type : 'date' },
        { name : 'effectiveness', type : 'number' }
    ];
}
```

### 3.2 Grid Configuratie

```javascript
import { Store, Grid } from '@bryntum/grid';

const store = new Store({
    modelClass : Task,
    data       : [
        { id: 1, name: 'Analysis', project: 'A', priority: 'High', ... },
        { id: 2, name: 'Design', project: 'A', priority: 'Medium', ... },
        // ...
    ]
});

const grid = new Grid({
    flex : 1,
    store,

    columns : [
        { field : 'name', text : 'Name', flex : 3 },
        {
            field  : 'project',
            text   : 'Project',
            flex   : 1,
            editor : {
                type  : 'dropdown',
                items : FacetFilter.getFieldValues(store, 'project')
            }
        },
        {
            field    : 'priority',
            text     : 'Priority',
            type     : 'template',
            align    : 'center',
            template : ({ value = '' }) =>
                StringHelper.xss`<div class="b-prio b-prio-${value.toLowerCase()}">${value}</div>`,
            editor   : {
                type  : 'dropdown',
                items : FacetFilter.getFieldValues(store, 'priority')
            }
        },
        { field : 'status', text : 'Status', flex : 1 },
        { field : 'assignedTo', text : 'Assigned To', flex : 1 },
        { field : 'dueDate', type : 'date', text : 'Due Date' },
        { type : 'rating', text : 'Effectiveness', field : 'effectiveness' }
    ],

    features : {
        filter : true
    },

    tbar : [{
        icon    : 'fa-bars',
        tooltip : 'Toggle filter panel',
        onClick() {
            container.widgetMap.facetFilters.toggleCollapsed();
        }
    }]
});
```

### 3.3 Container Layout met Facet Panels

```javascript
import { Container } from '@bryntum/grid';

const container = new Container({
    appendTo   : 'container',
    layout     : 'hbox',
    flex       : 1,
    scrollable : true,

    items : {
        // Collapsible filter sidebar
        facetFilters : {
            type        : 'panel',
            layout      : 'vbox',
            cls         : 'filters-panel',
            collapsible : true,
            header      : false,
            width       : '15em',

            // Default config voor alle facet filters
            defaults : {
                type : 'facetfilter',
                grid        // Referentie naar grid
            },

            // Individuele facet filters
            items : {
                project       : { fieldName : 'project' },
                status        : { fieldName : 'status' },
                priority      : { fieldName : 'priority' },
                assignedTo    : { fieldName : 'assignedTo' },
                effectiveness : { fieldName : 'effectiveness' }
            }
        },

        // Resizable splitter
        splitter : {
            type : 'splitter'
        },

        grid
    }
});
```

---

## 4. Styling

### 4.1 Filter Panel CSS

```css
.filters-panel {
    --b-panel-gap                 : 0;
    --b-panel-padding             : 0;
    --b-panel-with-header-padding : 1em;
}

.filters-panel .b-panel {
    --b-panel-gap : 0.5em;
}

.filters-panel,
.filters-panel .b-panel .b-panel-body-wrap {
    overflow-x : hidden;
    overflow-y : auto;
}
```

### 4.2 Facet Header Styling

```css
.b-panel-header.b-panel-ui-toolbar.facet-filter-header {
    font-weight : 500;
    padding     : 1em;
}

.facet-filter-header .b-header-title {
    font-size : 0.9em;
}
```

### 4.3 Active Checkbox State

```css
.b-facetfilter-item-active {
    --b-widget-font-weight : 600;
}
```

### 4.4 Priority Badge Styling

```css
.b-prio {
    display         : flex;
    align-items     : center;
    justify-content : center;
    border-radius   : 1em;
    margin-left     : 0.5em;
    padding         : 0.3em 1em;
    font-size       : .9em;
    color           : color-mix(in srgb, var(--b-primary), var(--b-opposite) 35%);
    background      : color-mix(in srgb, var(--b-primary), var(--b-mix) 90%);
}

.b-prio-high {
    --b-primary : var(--b-color-deep-orange);
}

.b-prio-medium {
    --b-primary : var(--b-color-orange);
}

.b-prio-low {
    --b-primary : var(--b-color-purple);
}
```

---

## 5. Geavanceerde Patronen

### 5.1 Filter Counts Tonen

Voeg counts toe aan checkbox labels:

```javascript
refreshOptions() {
    const
        me          = this,
        column      = me.grid.columns.get(me.fieldName),
        store       = me.grid.store,
        allRecords  = store.allRecords,  // Inclusief gefilterd
        values      = FacetFilter.getFieldValues(store, me.fieldName);

    me.title = StringHelper.encodeHtml(column.text);

    me.items = values.map(value => {
        // Tel records met deze waarde
        const count = allRecords.filter(r => r[me.fieldName] === value).length;

        return {
            type         : 'checkbox',
            checkedValue : StringHelper.encodeHtml(value),
            text         : StringHelper.encodeHtml(`${value} (${count})`),
            fieldName    : me.fieldName,
            disabled     : count === 0,
            listeners    : {
                change : 'up.onCheckboxChange'
            }
        };
    });
}
```

### 5.2 Exclusief Filteren (Radio Buttons)

Gebruik radio buttons voor single-select facets:

```javascript
class ExclusiveFacetFilter extends FacetFilter {
    static $name = 'ExclusiveFacetFilter';
    static type  = 'exclusivefacetfilter';

    refreshOptions() {
        const values = FacetFilter.getFieldValues(this.grid.store, this.fieldName);

        this.items = [
            // "All" optie
            {
                type      : 'radio',
                name      : this.fieldName,
                text      : 'All',
                checked   : true,
                listeners : { change : 'up.onRadioChange' }
            },
            // Waarde opties
            ...values.map(value => ({
                type         : 'radio',
                name         : this.fieldName,
                text         : StringHelper.encodeHtml(value),
                checkedValue : value,
                listeners    : { change : 'up.onRadioChange' }
            }))
        ];
    }

    onRadioChange({ source }) {
        const { store } = this.grid;

        if (!source.checkedValue) {
            // "All" geselecteerd - verwijder filter
            store.removeFilter(this.fieldName);
        }
        else {
            store.filter({
                id       : this.fieldName,
                property : this.fieldName,
                value    : source.checkedValue
            });
        }
    }
}

ExclusiveFacetFilter.initClass();
```

### 5.3 Range Facet (Numbers)

Filter op numerieke ranges:

```javascript
class RangeFacetFilter extends FacetFilter {
    static $name = 'RangeFacetFilter';
    static type  = 'rangefacetfilter';

    static configurable = {
        ...FacetFilter.configurable,
        ranges : null  // [[0, 25], [25, 50], [50, 75], [75, 100]]
    };

    refreshOptions() {
        const { ranges, fieldName } = this;

        this.items = ranges.map(([min, max]) => ({
            type         : 'checkbox',
            text         : `${min} - ${max}`,
            rangeMin     : min,
            rangeMax     : max,
            fieldName,
            listeners    : {
                change : 'up.onRangeChange'
            }
        }));
    }

    onRangeChange() {
        const
            { store }      = this.grid,
            activeRanges   = Widget.queryAll('checkbox')
                .filter(cb => cb.checked && cb.rangeMin !== undefined);

        store.removeFilter(this.fieldName);

        if (activeRanges.length) {
            store.filter({
                id       : this.fieldName,
                filterBy : record => {
                    const value = record[this.fieldName];
                    return activeRanges.some(cb =>
                        value >= cb.rangeMin && value < cb.rangeMax
                    );
                }
            });
        }
    }
}

RangeFacetFilter.initClass();
```

### 5.4 Date Range Facet

Filter op datum periodes:

```javascript
class DateFacetFilter extends FacetFilter {
    static $name = 'DateFacetFilter';
    static type  = 'datefacetfilter';

    refreshOptions() {
        const today = new Date();

        this.items = [
            {
                type      : 'checkbox',
                text      : 'Overdue',
                filterFn  : date => date < today,
                fieldName : this.fieldName,
                listeners : { change : 'up.onDateChange' }
            },
            {
                type      : 'checkbox',
                text      : 'This Week',
                filterFn  : date => {
                    const weekEnd = new Date(today);
                    weekEnd.setDate(today.getDate() + 7);
                    return date >= today && date <= weekEnd;
                },
                fieldName : this.fieldName,
                listeners : { change : 'up.onDateChange' }
            },
            {
                type      : 'checkbox',
                text      : 'This Month',
                filterFn  : date => {
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return date >= today && date <= monthEnd;
                },
                fieldName : this.fieldName,
                listeners : { change : 'up.onDateChange' }
            }
        ];
    }

    onDateChange() {
        const
            { store }       = this.grid,
            activeFilters   = Widget.queryAll('checkbox')
                .filter(cb => cb.checked && cb.filterFn);

        store.removeFilter(this.fieldName);

        if (activeFilters.length) {
            store.filter({
                id       : this.fieldName,
                filterBy : record => {
                    const value = record[this.fieldName];
                    return activeFilters.some(cb => cb.filterFn(value));
                }
            });
        }
    }
}

DateFacetFilter.initClass();
```

---

## 6. Integratie met FilterBar

### 6.1 Sync met Grid FilterBar

Synchroniseer facet filters met de ingebouwde FilterBar:

```javascript
onCheckboxChange({ source }) {
    // ... normale facet filter logic ...

    // Sync met FilterBar UI
    const filterBarFeature = this.grid.features.filterBar;
    if (filterBarFeature) {
        filterBarFeature.refresh();
    }
}
```

### 6.2 Filter State Persistence

Bewaar filter state in localStorage:

```javascript
class PersistentFacetFilter extends FacetFilter {
    static $name = 'PersistentFacetFilter';

    get storageKey() {
        return `facet-filter-${this.grid.id}-${this.fieldName}`;
    }

    restoreState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const values = JSON.parse(saved);
            this.items.forEach(item => {
                if (item.type === 'checkbox') {
                    item.checked = values.includes(item.checkedValue);
                }
            });
            // Trigger filter
            this.onCheckboxChange({ source: this.items[0] });
        }
    }

    saveState() {
        const values = this.items
            .filter(item => item.type === 'checkbox' && item.checked)
            .map(item => item.checkedValue);
        localStorage.setItem(this.storageKey, JSON.stringify(values));
    }

    onCheckboxChange(event) {
        super.onCheckboxChange(event);
        this.saveState();
    }

    updateGrid(grid) {
        super.updateGrid(grid);
        this.restoreState();
    }
}

PersistentFacetFilter.initClass();
```

---

## 7. Performance Optimalisaties

### 7.1 Debounced Filter Updates

Voorkom excessive filtering bij snelle checkbox clicks:

```javascript
import { ArrayHelper } from '@bryntum/grid';

class DebouncedFacetFilter extends FacetFilter {
    onCheckboxChange(event) {
        // Visual feedback direct
        event.source.cls = { 'b-facetfilter-item-active' : event.source.checked };

        // Debounce filter operation
        this.filterTask?.cancel();
        this.filterTask = this.setTimeout(() => {
            this.applyFilters();
        }, 150);
    }

    applyFilters() {
        const filters = {};
        // ... collect filters logic ...
        this.grid.store.filter(Object.values(filters));
    }
}
```

### 7.2 Virtualized Facet Lists

Voor facets met veel waarden:

```javascript
class VirtualFacetFilter extends FacetFilter {
    static configurable = {
        ...FacetFilter.configurable,
        maxVisible : 10,  // Max zichtbare items
        searchable : true // Zoek binnen facet
    };

    refreshOptions() {
        const values = FacetFilter.getFieldValues(this.grid.store, this.fieldName);

        this.items = [
            // Search field
            this.searchable && {
                type        : 'textfield',
                placeholder : 'Search...',
                listeners   : {
                    input : 'up.onSearch'
                }
            },
            // Scrollable container met checkboxes
            {
                type      : 'container',
                cls       : 'facet-scroll-container',
                height    : this.maxVisible * 28,
                scrollable: true,
                items     : values.map(value => ({
                    type         : 'checkbox',
                    text         : value,
                    checkedValue : value,
                    fieldName    : this.fieldName,
                    listeners    : { change : 'up.onCheckboxChange' }
                }))
            }
        ].filter(Boolean);
    }

    onSearch({ value }) {
        const checkboxes = this.query('checkbox');
        checkboxes.forEach(cb => {
            cb.hidden = !cb.text.toLowerCase().includes(value.toLowerCase());
        });
    }
}
```

---

## 8. Store API Reference

### 8.1 Relevante Store Methods

```javascript
// Haal unieke waarden op
store.getDistinctValues('fieldName');
// Returns: ['Value1', 'Value2', ...]

// Filter met config
store.filter({
    property : 'status',
    operator : '=',
    value    : 'Active'
});

// Filter met functie
store.filter({
    id       : 'custom',
    filterBy : record => record.priority === 'High'
});

// Verwijder specifieke filter
store.removeFilter('filterId');

// Clear alle filters
store.clearFilters();

// Check of store gefilterd is
store.isFiltered;  // true/false

// Alle records (inclusief gefilterd)
store.allRecords;

// Alleen zichtbare records
store.records;
```

### 8.2 Filter Operators

| Operator | Beschrijving |
|----------|--------------|
| `=` | Exact gelijk |
| `!=` | Niet gelijk |
| `>` | Groter dan |
| `>=` | Groter of gelijk |
| `<` | Kleiner dan |
| `<=` | Kleiner of gelijk |
| `*` | Contains (case-insensitive) |
| `startsWith` | Begint met |
| `endsWith` | Eindigt met |
| `isIncludedIn` | Waarde in array |
| `includes` | Array bevat waarde |
| `empty` | Is leeg/null |
| `notEmpty` | Is niet leeg |

---

## 9. React Integratie

```jsx
import { useRef, useEffect } from 'react';
import { BryntumGrid } from '@bryntum/grid-react';
import { FacetFilter } from './FacetFilter';

function GridWithFacets({ data }) {
    const gridRef = useRef(null);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = (fieldName, values) => {
        const grid = gridRef.current.instance;

        setActiveFilters(prev => ({
            ...prev,
            [fieldName]: values
        }));

        grid.store.clearFilters();

        Object.entries({ ...activeFilters, [fieldName]: values })
            .filter(([_, v]) => v.length > 0)
            .forEach(([field, vals]) => {
                grid.store.filter({
                    id       : field,
                    property : field,
                    operator : 'isIncludedIn',
                    value    : vals
                });
            });
    };

    return (
        <div className="grid-with-facets">
            <div className="facet-sidebar">
                {['project', 'status', 'priority'].map(field => (
                    <FacetFilter
                        key={field}
                        field={field}
                        data={data}
                        selected={activeFilters[field] || []}
                        onChange={(values) => handleFilterChange(field, values)}
                    />
                ))}
            </div>
            <BryntumGrid ref={gridRef} data={data} />
        </div>
    );
}
```

---

## 10. Troubleshooting

### 10.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Checkboxes updaten niet | Store listener niet actief | Controleer `updateGrid()` binding |
| Filter cleared bij data update | `refreshOptions` reset state | Bewaar checkbox state voor refresh |
| Numerieke filters werken niet | Type mismatch | Parse values naar correct type |
| Performance issues | Te veel distinct values | Gebruik virtualized list of grouping |

### 10.2 Debug Helpers

```javascript
// Log active filters
console.log('Active filters:', store.filters.values.map(f => ({
    id       : f.id,
    property : f.property,
    operator : f.operator,
    value    : f.value
})));

// Log filter effect
console.log('Visible records:', store.count);
console.log('Total records:', store.allCount);
```

---

## Bronnen

- **Example**: `examples/facet-filter/`
- **Store API**: `Core.data.Store`
- **Filter Guide**: `docs/guides/Grid/filtering.md`
- **Widget API**: `Core.widget.Panel`

---

*Track A: Foundation - Grid Core Extensions (A1.1)*
