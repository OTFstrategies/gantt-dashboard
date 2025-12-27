# Grid Implementation: Cascading Combos

> **Afhankelijke dropdown editors** met parent-child relaties, dynamische filtering, lokale data populatie, en async data loading voor hiërarchische selecties.

---

## Overzicht

Cascading combos zijn dropdown selecties waarbij de keuze in één combo de beschikbare opties in een volgende combo bepaalt. Dit patroon is essentieel voor hiërarchische data zoals:

- Land → Stad
- Categorie → Subcategorie
- Afdeling → Medewerker
- Merk → Model

```
┌─────────────────────┐    ┌─────────────────────┐
│ Parent Combo        │───▶│ Child Combo         │
├─────────────────────┤    ├─────────────────────┤
│ ▼ Select Floor      │    │ ▼ Select Room       │
│   ○ Floor #1        │    │   ○ Room #101       │
│   ○ Floor #2   ✓    │    │   ○ Room #201  ✓    │
│   ○ Floor #3        │    │   ○ Room #202       │
└─────────────────────┘    │   ○ Room #203       │
         │                 └─────────────────────┘
         │                          │
         └── Selectie bepaalt ──────┘
             beschikbare opties
```

---

## 1. Drie Cascade Strategieën

### 1.1 Strategie Overzicht

| Strategie | Data Location | Performance | Use Case |
|-----------|---------------|-------------|----------|
| Local Filtering | Alle data geladen, filter client-side | Snel | Kleine datasets |
| Local Populating | Alle data geladen, replace store data | Medium | Medium datasets |
| Async Populating | Data on-demand laden via Ajax | Schaalbaar | Grote datasets |

---

## 2. Local Filtering

Filter bestaande store data zonder nieuwe requests.

### 2.1 Data Structuur

**Parent data (floors.json):**
```json
[
  { "id": 1, "text": "Floor #1" },
  { "id": 2, "text": "Floor #2" },
  { "id": 3, "text": "Floor #3" }
]
```

**Child data (rooms.json):**
```json
[
  { "id": 101, "text": "Room #101", "floorId": 1 },
  { "id": 102, "text": "Room #102", "floorId": 1 },
  { "id": 201, "text": "Room #201", "floorId": 2 },
  { "id": 202, "text": "Room #202", "floorId": 2 },
  { "id": 301, "text": "Room #301", "floorId": 3 },
  { "id": 302, "text": "Room #302", "floorId": 3 }
]
```

### 2.2 Implementatie

```javascript
import { AjaxStore, Combo } from '@bryntum/grid';

// Parent store - alle verdiepingen
const floors = new AjaxStore({
    fields   : ['id', 'text'],
    readUrl  : 'data/floors.json',
    autoLoad : true
});

// Child store - alle kamers (worden gefilterd)
const rooms = new AjaxStore({
    fields   : ['id', 'text', 'floorId'],
    readUrl  : 'data/rooms.json',
    autoLoad : true
});

// Handler voor parent selectie
const onFloorSelect = function({ source: combo }) {
    const record = combo.record;

    if (record) {
        // Filter rooms op geselecteerde floor
        roomCombo.store.filter('floorId', record.id);
    }

    // Disable/enable child combo
    roomCombo.disabled = !record;
    // Reset child selection
    roomCombo.value = null;
};

// Parent combo
const floorCombo = new Combo({
    label         : 'Floor',
    store         : floors,
    editable      : false,
    clearable     : true,
    labelPosition : 'above',
    listeners     : {
        change : onFloorSelect
    }
});

// Child combo
const roomCombo = new Combo({
    label         : 'Room',
    store         : rooms,
    editable      : false,
    clearable     : true,
    disabled      : true,  // Start disabled
    labelPosition : 'above'
});
```

### 2.3 Voordelen & Nadelen

**Voordelen:**
- Snelste response (geen network requests)
- Werkt offline na initiële load
- Eenvoudige implementatie

**Nadelen:**
- Hele dataset moet geladen worden
- Niet geschikt voor grote datasets
- Filter state blijft in store

---

## 3. Local Populating

Vervang store data met gefilterde subset.

### 3.1 Implementatie

```javascript
import { Store, AjaxStore, Combo } from '@bryntum/grid';

// Alle merken laden
const carBrands = new AjaxStore({
    fields   : ['id', 'text'],
    readUrl  : 'data/car_brands.json',
    autoLoad : true
});

// Alle modellen laden (voor filtering)
const carModels = new AjaxStore({
    fields   : ['id', 'text', 'brandId'],
    readUrl  : 'data/car_models.json',
    autoLoad : true
});

// Handler - vervang store data
const onBrandSelect = function({ source: combo }) {
    const record = combo.record;

    // Filter en zet als nieuwe data
    carModelCombo.store.data = record
        ? carModels.records.filter(model => model.brandId === record.id)
        : [];

    carModelCombo.disabled = !record;
    carModelCombo.value = null;
};

const carBrandCombo = new Combo({
    label         : 'Car brand',
    store         : carBrands,
    editable      : false,
    clearable     : true,
    labelPosition : 'above',
    listeners     : {
        change : onBrandSelect
    }
});

// Child combo met lege store
const carModelCombo = new Combo({
    label : 'Car model',
    store : new Store({
        fields : ['id', 'text', 'brandId']
    }),
    editable      : false,
    clearable     : true,
    disabled      : true,
    labelPosition : 'above'
});
```

### 3.2 Verschil met Local Filtering

```javascript
// Local Filtering - filter bestaande store
roomCombo.store.filter('floorId', record.id);
// Store bevat alle records, filter toont subset

// Local Populating - vervang store data
carModelCombo.store.data = filteredRecords;
// Store bevat alleen relevante records
```

---

## 4. Async Populating

Laad child data on-demand via Ajax requests.

### 4.1 Implementatie

```javascript
import { Store, AjaxStore, AjaxHelper, Combo } from '@bryntum/grid';

const countries = new AjaxStore({
    fields   : ['id', 'text'],
    readUrl  : 'data/countries.json',
    autoLoad : true
});

const onCountrySelect = function({ source: combo }) {
    const record = combo.record;

    cityCombo.disabled = !record;
    cityCombo.value = null;

    if (record) {
        // Toon loading indicator
        cityCombo.mask('Loading...');

        // Async data fetch
        AjaxHelper.get(`data/cities_${record.text.toLowerCase()}.json`, {
            parseJson : true
        }).then(response => {
            cityCombo.store.data = response.parsedJson;
            cityCombo.unmask();
        }).catch(error => {
            cityCombo.unmask();
            console.error('Failed to load cities:', error);
        });
    }
    else {
        cityCombo.store.data = [];
    }
};

const countryCombo = new Combo({
    label         : 'Country',
    store         : countries,
    editable      : false,
    clearable     : true,
    labelPosition : 'above',
    listeners     : {
        change : onCountrySelect
    }
});

const cityCombo = new Combo({
    label : 'City',
    store : new Store({
        fields : ['id', 'text', 'countryId']
    }),
    editable      : false,
    clearable     : true,
    disabled      : true,
    labelPosition : 'above'
});
```

### 4.2 Data Files per Parent

```
data/
├── countries.json          # Parent data
├── cities_germany.json     # Child data voor Germany
├── cities_france.json      # Child data voor France
└── cities_spain.json       # Child data voor Spain
```

### 4.3 Server-side Filtering

Alternatief: één endpoint met query parameters:

```javascript
const onCountrySelect = function({ source: combo }) {
    const record = combo.record;

    if (record) {
        cityCombo.mask('Loading...');

        AjaxHelper.get('api/cities', {
            params    : { countryId: record.id },
            parseJson : true
        }).then(response => {
            cityCombo.store.data = response.parsedJson;
            cityCombo.unmask();
        });
    }
};
```

---

## 5. Integratie met Grid Editors

### 5.1 Cell Editor met Cascading Combos

```javascript
import { Grid } from '@bryntum/grid';

const grid = new Grid({
    columns : [
        { field : 'name', text : 'Name' },
        {
            field  : 'departmentId',
            text   : 'Department',
            editor : {
                type        : 'combo',
                store       : departmentStore,
                displayField: 'name',
                valueField  : 'id',
                listeners   : {
                    change({ source, value }) {
                        // Update employee combo in dezelfde row
                        const employeeColumn = grid.columns.get('employeeId');
                        if (employeeColumn.editor) {
                            employeeColumn.editor.store.filter('departmentId', value);
                        }
                    }
                }
            }
        },
        {
            field  : 'employeeId',
            text   : 'Employee',
            editor : {
                type        : 'combo',
                store       : employeeStore,
                displayField: 'name',
                valueField  : 'id'
            }
        }
    ]
});
```

### 5.2 Task Editor met Cascading Fields

```javascript
const gantt = new Gantt({
    features : {
        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        categoryField : {
                            type        : 'combo',
                            name        : 'category',
                            label       : 'Category',
                            store       : categoryStore,
                            weight      : 100,
                            listeners   : {
                                change({ value }) {
                                    // Vind subcategory field
                                    const subField = this.owner.widgetMap.subcategoryField;
                                    subField.store.filter('categoryId', value);
                                    subField.value = null;
                                    subField.disabled = !value;
                                }
                            }
                        },
                        subcategoryField : {
                            type     : 'combo',
                            name     : 'subcategory',
                            label    : 'Subcategory',
                            store    : subcategoryStore,
                            disabled : true,
                            weight   : 110
                        }
                    }
                }
            }
        }
    }
});
```

---

## 6. Multi-Level Cascading

### 6.1 Drie of Meer Levels

```javascript
// Country → State → City
const countryCombo = new Combo({
    label : 'Country',
    store : countries,
    listeners : {
        change({ source }) {
            const record = source.record;

            // Reset downstream combos
            stateCombo.value = null;
            cityCombo.value = null;
            stateCombo.disabled = !record;
            cityCombo.disabled = true;

            if (record) {
                stateCombo.store.filter('countryId', record.id);
            }
        }
    }
});

const stateCombo = new Combo({
    label    : 'State',
    store    : states,
    disabled : true,
    listeners : {
        change({ source }) {
            const record = source.record;

            cityCombo.value = null;
            cityCombo.disabled = !record;

            if (record) {
                cityCombo.store.filter('stateId', record.id);
            }
        }
    }
});

const cityCombo = new Combo({
    label    : 'City',
    store    : cities,
    disabled : true
});
```

### 6.2 Cascade Chain Helper

```javascript
class CascadeChain {
    constructor(combos) {
        this.combos = combos;
        this.setupListeners();
    }

    setupListeners() {
        this.combos.forEach((combo, index) => {
            if (index < this.combos.length - 1) {
                combo.on('change', ({ source }) => {
                    this.handleChange(index, source.record);
                });
            }
        });
    }

    handleChange(index, record) {
        // Reset alle downstream combos
        for (let i = index + 1; i < this.combos.length; i++) {
            this.combos[i].value = null;
            this.combos[i].disabled = !record || i > index + 1;
        }

        // Filter directe child
        if (record && index + 1 < this.combos.length) {
            const childCombo = this.combos[index + 1];
            const parentField = this.combos[index].valueField || 'id';
            const childFilterField = `${this.combos[index].name}Id`;

            childCombo.store.filter(childFilterField, record[parentField]);
        }
    }

    getValues() {
        return this.combos.reduce((acc, combo) => {
            acc[combo.name] = combo.value;
            return acc;
        }, {});
    }

    setValues(values) {
        // Set values in order, triggering cascade
        this.combos.forEach(combo => {
            if (values[combo.name] !== undefined) {
                combo.value = values[combo.name];
            }
        });
    }
}

// Gebruik
const cascade = new CascadeChain([
    countryCombo,
    stateCombo,
    cityCombo
]);
```

---

## 7. Caching Strategieën

### 7.1 Client-side Cache

```javascript
const cityCache = new Map();

const onCountrySelect = async function({ source: combo }) {
    const record = combo.record;

    if (!record) {
        cityCombo.store.data = [];
        return;
    }

    const cacheKey = record.id;

    // Check cache
    if (cityCache.has(cacheKey)) {
        cityCombo.store.data = cityCache.get(cacheKey);
        return;
    }

    // Fetch en cache
    cityCombo.mask('Loading...');

    try {
        const response = await AjaxHelper.get(`api/cities?countryId=${record.id}`, {
            parseJson: true
        });

        cityCache.set(cacheKey, response.parsedJson);
        cityCombo.store.data = response.parsedJson;
    }
    finally {
        cityCombo.unmask();
    }
};
```

### 7.2 Preloading

```javascript
// Preload populaire opties
const preloadCities = async (countryIds) => {
    await Promise.all(countryIds.map(async id => {
        if (!cityCache.has(id)) {
            const response = await AjaxHelper.get(`api/cities?countryId=${id}`, {
                parseJson: true
            });
            cityCache.set(id, response.parsedJson);
        }
    }));
};

// Preload top 3 landen
countries.on('load', () => {
    const topCountries = countries.records.slice(0, 3).map(r => r.id);
    preloadCities(topCountries);
});
```

---

## 8. Validatie

### 8.1 Verplichte Selectie

```javascript
const floorCombo = new Combo({
    label    : 'Floor',
    store    : floors,
    required : true,
    listeners : {
        change : onFloorSelect
    }
});

const roomCombo = new Combo({
    label    : 'Room',
    store    : rooms,
    required : true,
    disabled : true
});

// Validatie check
function validateCascade() {
    const isValid = floorCombo.isValid && roomCombo.isValid;

    if (!floorCombo.value) {
        floorCombo.setError('Please select a floor');
    }
    if (floorCombo.value && !roomCombo.value) {
        roomCombo.setError('Please select a room');
    }

    return isValid;
}
```

### 8.2 Dependency Validatie

```javascript
// Zorg dat child consistent is met parent
const validateConsistency = () => {
    const floorId = floorCombo.value;
    const roomId = roomCombo.value;

    if (roomId) {
        const room = rooms.getById(roomId);
        if (room && room.floorId !== floorId) {
            roomCombo.value = null;
            roomCombo.setError('Room is not on selected floor');
            return false;
        }
    }

    return true;
};
```

---

## 9. React Integratie

```jsx
import { useState, useEffect } from 'react';
import { BryntumCombo } from '@bryntum/grid-react';

function CascadingCombos({ onSelect }) {
    const [country, setCountry] = useState(null);
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load cities when country changes
    useEffect(() => {
        if (!country) {
            setCities([]);
            setCity(null);
            return;
        }

        setLoading(true);
        setCity(null);

        fetch(`/api/cities?countryId=${country}`)
            .then(res => res.json())
            .then(data => {
                setCities(data);
                setLoading(false);
            });
    }, [country]);

    return (
        <div className="cascade-combos">
            <BryntumCombo
                label="Country"
                store={countriesStore}
                value={country}
                onChange={({ value }) => setCountry(value)}
                clearable
            />

            <BryntumCombo
                label="City"
                data={cities}
                value={city}
                onChange={({ value }) => {
                    setCity(value);
                    onSelect?.({ country, city: value });
                }}
                disabled={!country || loading}
                clearable
            />
        </div>
    );
}
```

---

## 10. Layout in Container

### 10.1 Panel Layout

```javascript
import { Container } from '@bryntum/grid';

new Container({
    appendTo : 'container',
    defaults : {
        flex     : 1,
        minWidth : 400
    },
    items : {
        // Floor/Room cascade
        locationPanel : {
            type  : 'panel',
            title : 'Location Selection',
            items : [floorCombo, roomCombo]
        },

        // Brand/Model cascade
        vehiclePanel : {
            type  : 'panel',
            title : 'Vehicle Selection',
            items : [brandCombo, modelCombo]
        },

        // Country/City async cascade
        addressPanel : {
            type  : 'panel',
            title : 'Address Selection',
            items : [countryCombo, cityCombo]
        }
    }
});
```

### 10.2 Inline Layout

```javascript
new Container({
    layout : 'hbox',
    items  : [
        { ...floorCombo, flex : 1 },
        { ...roomCombo, flex : 1 }
    ]
});
```

---

## 11. Best Practices

### 11.1 UX Guidelines

| Aspect | Recommendation |
|--------|----------------|
| Initial State | Disable child combos tot parent geselecteerd |
| Loading | Toon loading indicator tijdens async fetch |
| Empty State | Clear child selection bij parent change |
| Error Handling | Graceful degradation bij network errors |
| Labels | Duidelijke hiërarchie in labels |

### 11.2 Performance Tips

```javascript
// 1. Debounce snelle selectie changes
const debouncedFetch = debounce(async (parentId) => {
    const response = await fetchChildren(parentId);
    childCombo.store.data = response;
}, 150);

// 2. Virtualize lange lijsten
const childCombo = new Combo({
    picker : {
        maxHeight : 300  // Virtualization kicks in
    }
});

// 3. Lazy load alleen wanneer dropdown opent
const childCombo = new Combo({
    listItemTpl: item => item.text,
    listeners : {
        expand() {
            if (!this.store.count) {
                this.loadData();
            }
        }
    }
});
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Child toont alle items | Filter niet toegepast | Check `filter()` call timing |
| Selection lost na filter | Filter cleared selection | Reset value expliciet |
| Infinite loop | Circular event triggers | Use `silent: true` of guard |
| Store empty na clear | Data niet bewaard | Bewaar originele data copy |

### 12.2 Debug Helpers

```javascript
// Log store state
console.log('Store records:', combo.store.records.length);
console.log('Store filters:', combo.store.filters.values);
console.log('Combo value:', combo.value);
console.log('Combo record:', combo.record);

// Force refresh
combo.store.clearFilters();
combo.store.filter('parentId', parentId);
combo.refresh();
```

---

## Bronnen

- **Example**: `examples/cascadingcombos/`
- **Combo API**: `Core.widget.Combo`
- **AjaxStore**: `Core.data.AjaxStore`
- **AjaxHelper**: `Core.helper.AjaxHelper`

---

*Track A: Foundation - Grid Core Extensions (A1.2)*
