# BRYNTUM DATA MODELS - Complete Reference

> Blackbox analyse van alle Bryntum component data structuren

---

## OVERZICHT PER COMPONENT

| Component | Primaire Entiteit | Tijd-gebaseerd | Hiërarchie | Dependencies |
|-----------|------------------|----------------|------------|--------------|
| **Gantt** | Task | Ja (duration) | Ja (children) | Ja |
| **TaskBoard** | Task | Nee | Nee | Nee |
| **Calendar** | Event | Ja (start/end) | Nee | Nee |
| **SchedulerPro** | Event | Ja (duration) | Nee | Ja |

---

## 1. GANTT DATA MODEL

### Response Wrapper
```json
{
  "success": true,
  "project": { ... },
  "calendars": { "rows": [...] },
  "tasks": { "rows": [...] },
  "dependencies": { "rows": [...] },
  "resources": { "rows": [...] },
  "assignments": { "rows": [...] },
  "timeRanges": { "rows": [...] }
}
```

### Project
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `name` | string | Nee | Projectnaam |
| `description` | string | Nee | Beschrijving |
| `calendar` | string | Nee | ID van standaard kalender |
| `startDate` | date | Ja | Project startdatum |
| `endDate` | date | Nee | Berekend of handmatig |
| `hoursPerDay` | number | Nee | Default: 24 |
| `daysPerWeek` | number | Nee | Default: 5 |
| `daysPerMonth` | number | Nee | Default: 20 |

### Task (Gantt)
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | number/string | Ja | Unieke ID |
| `name` | string | Ja | Taaknaam |
| `startDate` | date | Ja* | Start (of berekend) |
| `endDate` | date | Nee | Eind (of berekend) |
| `duration` | number | Nee | Duur in dagen |
| `durationUnit` | string | Nee | "day", "hour", "eday" |
| `percentDone` | number | Nee | 0-100 voortgang |
| `expanded` | boolean | Nee | Ingeklapt/uit |
| `children` | Task[] | Nee | Subtaken |
| `rollup` | boolean | Nee | Toon in parent bar |
| `color` | string | Nee | Kleur (CSS naam) |
| `cls` | string | Nee | CSS class |
| `iconCls` | string | Nee | FontAwesome class |
| `cost` | number | Nee | Kosten |
| `priority` | number | Nee | 1-3 prioriteit |
| `complexity` | number | Nee | 0-3 complexiteit |
| `showInTimeline` | boolean | Nee | Toon in timeline |
| `baselines` | Baseline[] | Nee | Historische versies |

### Baseline
| Veld | Type | Beschrijving |
|------|------|--------------|
| `startDate` | date | Geplande start |
| `endDate` | date | Geplande eind |

### Dependency (Gantt)
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | number | Ja | Unieke ID |
| `fromTask` | number | Ja | Bron taak ID |
| `toTask` | number | Ja | Doel taak ID |
| `lag` | number | Nee | Vertraging (dagen) |
| `cls` | string | Nee | CSS class |

### Calendar
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | string | Unieke ID |
| `name` | string | Weergavenaam |
| `hoursPerDay` | number | Uren per dag |
| `daysPerWeek` | number | Dagen per week |
| `daysPerMonth` | number | Dagen per maand |
| `intervals` | Interval[] | Werk/vrij periodes |
| `children` | Calendar[] | Sub-kalenders |

### Interval (Recurrent)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Optionele ID |
| `recurrentStartDate` | string | "on Sat", "every weekday at 17:00" |
| `recurrentEndDate` | string | "on Mon", "every weekday at 08:00" |
| `isWorking` | boolean | true = werktijd, false = vrij |

### Resource (Gantt - Uitgebreid)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `name` | string | Naam |
| `city` | string | Locatie |
| `calendar` | string | Kalender ID |
| `image` | string/false | Avatar bestand |
| `iconCls` | string | FontAwesome icoon |
| `type` | string | "work", "material", "cost" |
| `materialLabel` | string | Label voor materiaal |
| `defaultRateTable` | string | Standaard tarief |
| `rateTables` | RateTable[] | Tarieftabellen |

### RateTable
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | string | Tarief ID |
| `name` | string | Naam |
| `rates` | Rate[] | Tarieven |

### Rate
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Rate ID |
| `startDate` | date | Ingangsdatum |
| `standardRate` | number | Uurtarief |
| `standardRateEffortUnit` | string | "hour" |
| `perUseCost` | number | Kosten per gebruik |

### Assignment (Gantt)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `event` | number | Taak ID |
| `resource` | number | Resource ID |
| `rateTable` | string | Tarief ID |
| `quantity` | number | Aantal (voor materials) |
| `cost` | number | Vaste kosten |

### TimeRange
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `name` | string | Label |
| `startDate` | date | Start |
| `duration` | number | 0 = lijn, >0 = periode |
| `durationUnit` | string | "d" |
| `cls` | string | CSS/icoon class |

---

## 2. TASKBOARD DATA MODEL

### Response Wrapper
```json
{
  "success": true,
  "tasks": { "rows": [...] }
}
```

### Task (TaskBoard)
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | number | Ja | Unieke ID |
| `name` | string | Ja | Taaknaam |
| `description` | string | Nee | Beschrijving |
| `status` | string | Ja | Kolom: "todo", "doing", "review", "done" |
| `prio` | string | Nee | "low", "medium", "high", "critical" |
| `category` | string | Nee | "Bug", "Feature request", "Internal task" |
| `team` | string | Nee | Team naam |
| `quarter` | string | Nee | Swimlane: "Q1", "Q2", etc. |

**Opmerking:** TaskBoard is veel simpeler dan Gantt - geen tijd, geen hiërarchie, geen dependencies.

---

## 3. CALENDAR DATA MODEL

### Response Wrapper
```json
{
  "success": true,
  "resources": { "rows": [...] },
  "events": { "rows": [...] }
}
```

### Resource (Calendar)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | string | Unieke ID |
| `name` | string | Naam |
| `eventColor` | string | Default kleur events |

### Event (Calendar)
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | number | Ja | Unieke ID |
| `name` | string | Ja | Event naam |
| `startDate` | datetime | Ja | Start |
| `endDate` | datetime | Ja | Eind |
| `allDay` | boolean | Nee | Hele dag event |
| `resourceId` | string | Nee | Gekoppelde resource |
| `eventColor` | string | Nee | Override kleur |

---

## 4. SCHEDULERPRO DATA MODEL

### Response Wrapper
```json
{
  "success": true,
  "resources": { "rows": [...] },
  "events": { "rows": [...] },
  "assignments": { "rows": [...] },
  "dependencies": { "rows": [...] },
  "resourceTimeRanges": { "rows": [...] }
}
```

### Resource (SchedulerPro)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `name` | string | Naam |
| `icon` | string | FontAwesome zonder "fa-" |

### Event (SchedulerPro)
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | number | Ja | Unieke ID |
| `name` | string | Ja | Event naam |
| `startDate` | datetime | Nee* | Start (of berekend) |
| `duration` | number | Ja | Duur |
| `durationUnit` | string | Nee | "hour", "day" |
| `iconCls` | string | Nee | FontAwesome class |
| `eventColor` | string | Nee | Kleur |
| `cls` | string | Nee | CSS class |

### Dependency (SchedulerPro)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `fromEvent` | number | Bron event ID |
| `toEvent` | number | Doel event ID |
| `lag` | number | Vertraging |
| `lagUnit` | string | "hour", "day" |

**Let op:** SchedulerPro gebruikt `fromEvent/toEvent`, Gantt gebruikt `fromTask/toTask`

### ResourceTimeRange
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke ID |
| `resourceId` | number | Resource ID |
| `startDate` | date | Start |
| `duration` | number | Duur |
| `timeRangeColor` | string | Kleur |
| `name` | string | Label |

---

## 5. GEMEENSCHAPPELIJKE PATTERNS

### ID Strategie
- Alle entiteiten hebben verplichte `id`
- Kan number of string zijn
- Moet uniek zijn binnen type

### Datum Formaten
- ISO 8601: `"2023-02-13"` of `"2023-02-13T14:00:00"`
- Altijd strings, geen Date objecten

### Kleur Systeem
| Waarde | Type |
|--------|------|
| `"blue"` | Naam |
| `"deep-orange"` | Naam met prefix |
| `"#FF5733"` | Hex |
| `"rgb(255,87,51)"` | RGB |

### Iconen
- FontAwesome 5/6 classes
- Format: `"fa fa-truck"` of `"fa-truck"`
- Solid/Regular: `"fas fa-truck"` / `"far fa-truck"`

### CSS Classes
- Via `cls` veld
- Meerdere: `"class1 class2"`
- Voor custom styling

---

## 6. RELATIES TUSSEN ENTITEITEN

```
GANTT:
Task ──────── 1:N ──────── Dependency (fromTask/toTask)
Task ──────── N:M ──────── Resource (via Assignment)
Task ──────── N:1 ──────── Calendar
Resource ──── N:1 ──────── Calendar

SCHEDULERPRO:
Event ─────── 1:N ──────── Dependency (fromEvent/toEvent)
Event ─────── N:M ──────── Resource (via Assignment)

CALENDAR:
Event ─────── N:1 ──────── Resource (direct resourceId)

TASKBOARD:
Task (standalone, geen relaties)
```

---

## 7. DATA CONVERSIE TUSSEN COMPONENTEN

### Gantt → TaskBoard
```javascript
// Gantt task
{
  id: 1,
  name: "Install Apache",
  percentDone: 50,
  startDate: "2023-02-13"
}

// → TaskBoard task
{
  id: 1,
  name: "Install Apache",
  status: percentDone === 100 ? "done" :
          percentDone > 0 ? "doing" : "todo",
  description: `Due: 2023-02-13`
}
```

### Calendar → SchedulerPro
```javascript
// Calendar event
{
  id: 1,
  name: "Meeting",
  startDate: "2023-02-13T10:00",
  endDate: "2023-02-13T11:00",
  resourceId: "team"
}

// → SchedulerPro event + assignment
{
  events: [{
    id: 1,
    name: "Meeting",
    startDate: "2023-02-13T10:00",
    duration: 1,
    durationUnit: "hour"
  }],
  assignments: [{
    id: 1,
    event: 1,
    resource: "team"
  }]
}
```
