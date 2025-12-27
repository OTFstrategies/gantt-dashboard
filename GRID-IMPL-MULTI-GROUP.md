# Grid Implementation: Multi-Group

> **Nested grouping** en multi-level aggregatie met array-valued fields, record linking, en multi-membership grouping.

---

## Overzicht

Multi-group stelt records in staat om lid te zijn van meerdere groepen tegelijk via array-valued fields. Dit is ideaal voor data met meerdere tags, skills, of categorieën.

```
┌────────────────────────────────────────────────────────────┐
│ Name         │ Age │ Skills                │ Team │ Rating │
├────────────────────────────────────────────────────────────┤
│ ▼ JavaScript                                              │
├────────────────────────────────────────────────────────────┤
│   John Doe   │ 28  │ JavaScript, React     │ Alpha│ ★★★★★ │
│   Jane Smith │ 32  │ JavaScript, Vue       │ Beta │ ★★★★☆ │
├────────────────────────────────────────────────────────────┤
│ ▼ React                                                   │
├────────────────────────────────────────────────────────────┤
│   John Doe   │ 28  │ JavaScript, React     │ Alpha│ ★★★★★ │ ← Zelfde record
│   Mike Brown │ 25  │ React, TypeScript     │ Alpha│ ★★★☆☆ │
└────────────────────────────────────────────────────────────┘
```

---

## 1. Basis Configuratie

### 1.1 Array Field Grouping

```javascript
import { Grid, DataGenerator } from '@bryntum/grid';

const grid = new Grid({
    appendTo: 'container',

    features: {
        group: {
            // Groupeer op array field
            field: 'skills'  // Dit is een array: ['JavaScript', 'React']
        }
    },

    store: {
        fields: [
            { name: 'skills', type: 'array' }  // Definieer als array type
        ],
        data: DataGenerator.generateData({ count: 50, addSkills: 4 })
    },

    columns: [
        { text: 'Name', field: 'name', flex: 1, groupable: false },
        { text: 'Age', field: 'age', type: 'number', width: 80 },
        {
            text: 'Skills',
            field: 'skills',
            width: 340,
            renderer: renderSkills
        },
        { text: 'Team', field: 'team', flex: 1 },
        { type: 'rating', text: 'Rating', field: 'rating' }
    ]
});
```

### 1.2 Skills Renderer

```javascript
const skillColors = {
    Angular: 'red',
    JavaScript: 'yellow',
    Vue: 'green',
    React: 'blue',
    Java: 'deep-orange',
    TypeScript: 'indigo'
};

function renderSkills({ value }) {
    return value?.map?.(skill => ({
        class: 'skill b-colorize',
        text: skill,
        style: `--b-primary: var(--b-color-${skillColors[skill] || 'gray'})`
    })) || '';
}
```

---

## 2. Record Linking

### 2.1 Hoe Multi-Group Werkt

Bij array field grouping maakt Bryntum **transient linked clones** van records:

```javascript
// Origineel record
{
    id: 1,
    name: 'John',
    skills: ['JavaScript', 'React']
}

// Wordt:
// - 1 clone in 'JavaScript' groep
// - 1 clone in 'React' groep
// Beide verwijzen naar hetzelfde originele record
```

### 2.2 Record Identity

```javascript
// Check of record een link is
record.isLinked;  // true voor clones

// Krijg origineel record
record.originalRecord;  // Het base record

// Alle links van een record
record.links;  // Array van linked clones
```

---

## 3. Column Configuratie

### 3.1 Groupable Property

```javascript
columns: [
    {
        text: 'Name',
        field: 'name',
        groupable: false  // Niet beschikbaar in group menu
    },
    {
        text: 'Skills',
        field: 'skills',
        groupable: true   // Default, beschikbaar voor grouping
    }
]
```

### 3.2 Multi-Select Editor

```javascript
{
    text: 'Skills',
    field: 'skills',
    editor: {
        type: 'combo',
        multiSelect: true,
        editable: false,
        items: DataGenerator.skills
    },
    cellEditor: {
        // ChipView auto-height kan cell overschrijden
        matchSize: {
            height: false
        }
    }
}
```

---

## 4. Group Feature Configuratie

### 4.1 Basis Group Config

```javascript
features: {
    group: {
        field: 'skills',

        // Group sortering
        groupSort: {
            field: 'skills',
            fn: (a, b) => a.meta.groupRowFor.localeCompare(b.meta.groupRowFor)
        }
    }
}
```

### 4.2 Custom Group Renderer

```javascript
features: {
    group: {
        field: 'skills',

        renderer({ groupRowFor, count, column }) {
            return {
                children: [
                    {
                        tag: 'span',
                        className: `skill-badge skill-${groupRowFor.toLowerCase()}`,
                        text: groupRowFor
                    },
                    ` (${count} members)`
                ]
            };
        }
    }
}
```

### 4.3 Nested Grouping

```javascript
features: {
    group: {
        // Meerdere groepeer niveaus
        field: ['department', 'team'],

        // Of via store sorters
        groupers: [
            { field: 'department' },
            { field: 'team' }
        ]
    }
}
```

---

## 5. Interactie met Andere Features

### 5.1 Row Reorder

```javascript
features: {
    group: { field: 'skills' },
    rowReorder: true  // Drag rows tussen groepen
}
```

### 5.2 Sorting binnen Groepen

```javascript
store: {
    fields: [{ name: 'skills', type: 'array' }],
    sorters: [
        { field: 'skills' },  // Group sort
        { field: 'name' }     // Sort binnen groep
    ]
}
```

---

## 6. Styling

### 6.1 Skill Badge Styling

```css
.skill {
    display: inline-flex;
    padding: 0.25em 0.75em;
    margin: 0.1em;
    border-radius: 1em;
    font-size: 0.85em;
}

.b-colorize {
    color: color-mix(in srgb, var(--b-primary), var(--b-opposite) 35%);
    background: color-mix(in srgb, var(--b-primary), var(--b-mix) 85%);
}
```

### 6.2 Group Header Styling

```css
.b-group-row {
    background: var(--b-group-row-bg);
    font-weight: 600;
}

.b-group-row .b-grid-cell {
    border-bottom: 2px solid var(--b-primary-color);
}
```

---

## 7. Aggregatie in Groepen

### 7.1 Summary per Groep

```javascript
columns: [
    {
        text: 'Age',
        field: 'age',
        type: 'number',
        sum: 'average',  // Gemiddelde leeftijd per groep
        summaryRenderer({ sum }) {
            return `Avg: ${Math.round(sum)}`;
        }
    },
    {
        text: 'Rating',
        field: 'rating',
        type: 'number',
        sum: 'sum'
    }
]
```

### 7.2 Custom Aggregatie

```javascript
{
    text: 'Skills Count',
    sum: (records) => {
        const allSkills = new Set();
        records.forEach(r => r.skills?.forEach(s => allSkills.add(s)));
        return allSkills.size;
    }
}
```

---

## 8. Programmatic Control

### 8.1 Group Operations

```javascript
// Group by field
grid.features.group.groupBy('skills');

// Clear grouping
grid.features.group.clearGrouping();

// Expand/collapse groep
grid.features.group.expandAll();
grid.features.group.collapseAll();

// Toggle specifieke groep
grid.features.group.toggleGroup('JavaScript');
```

### 8.2 Check Group State

```javascript
// Is grid gegroepeerd?
grid.store.isGrouped;

// Huidige group field
grid.store.groupers;

// Groep records ophalen
const javascriptGroup = grid.store.getGroupRecords('JavaScript');
```

---

## 9. React Integratie

```jsx
import { BryntumGrid } from '@bryntum/grid-react';

function SkillsGrid({ employees }) {
    const [groupField, setGroupField] = useState('skills');

    const columns = useMemo(() => [
        { text: 'Name', field: 'name', flex: 1 },
        {
            text: 'Skills',
            field: 'skills',
            renderer: ({ value }) => value?.join(', ')
        }
    ], []);

    return (
        <div>
            <select
                value={groupField}
                onChange={e => setGroupField(e.target.value)}
            >
                <option value="skills">By Skills</option>
                <option value="team">By Team</option>
                <option value="">No Grouping</option>
            </select>

            <BryntumGrid
                columns={columns}
                data={employees}
                features={{
                    group: groupField ? { field: groupField } : false
                }}
            />
        </div>
    );
}
```

---

## 10. Edge Cases

### 10.1 Lege Arrays

```javascript
// Records zonder skills verschijnen niet in groepen
{
    id: 1,
    name: 'New Employee',
    skills: []  // Geen groep membership
}

// Oplossing: filter of speciale 'No Skills' groep
features: {
    group: {
        field: 'skills',
        renderer({ groupRowFor }) {
            return groupRowFor || 'No Skills';
        }
    }
}
```

### 10.2 Record Updates

```javascript
// Bij skill wijziging, update automatisch groepen
record.skills = [...record.skills, 'TypeScript'];
// Record verschijnt nu ook in TypeScript groep
```

---

## 11. Troubleshooting

| Issue | Oorzaak | Oplossing |
|-------|---------|-----------|
| Record niet in meerdere groepen | Field type niet 'array' | Zet `type: 'array'` op field |
| Dubbele records | Verwacht gedrag | Records zijn links, niet duplicaten |
| Edit update niet | Editor niet multiSelect | Zet `multiSelect: true` |
| Performance issues | Te veel groepen | Limiteer array size of pagineer |

---

## Bronnen

- **Example**: `examples/multi-group/`
- **Group Feature**: `Grid.feature.Group`
- **Store Grouping**: `Core.data.Store#function-group`

---

*Track A: Foundation - Grid Core Extensions (A1.8)*
