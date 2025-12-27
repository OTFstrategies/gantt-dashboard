# BRYNTUM ECOSYSTEM OVERZICHT

> Blackbox analyse van alle Bryntum componenten (v7.1.0)

---

## BESCHIKBARE PACKAGES

| Package | Locatie | Voorbeelden |
|---------|---------|-------------|
| **Gantt** | `Downloads/bryntum-gantt-trial/gantt-7.1.0-trial` | 95 |
| **Calendar** | `Downloads/bryntum-calendar-trial/calendar-7.1.0-trial` | ~50 |
| **SchedulerPro** | `Downloads/bryntum-schedulerpro-trial/schedulerpro-7.1.0-trial` | ~50 |
| **TaskBoard** | `Downloads/bryntum-taskboard-trial/taskboard-7.1.0-trial` | ~30 |
| **Grid** | `Downloads/bryntum-grid-trial/grid-7.1.0-trial` | ~50 |

---

## GANTT - INTERESSANTE VOORBEELDEN

### Core Features
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `basic` | Basis Gantt setup |
| `advanced` | Alle features gecombineerd |
| `dependencies` | Pijlen tussen taken |
| `baselines` | Planning vs actueel |
| `criticalpaths` | Kritieke pad highlighting |
| `calendars` | Werkdagen/uren configuratie |
| `resourceassignment` | Medewerkers toewijzen |
| `resourcehistogram` | Resource workload grafiek |
| `resourceutilization` | Bezettingsgraad panel |

### UI/UX Features
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `custom-taskbar` | Aangepaste taakbalken |
| `custom-rendering` | Eigen render functies |
| `custom-taskmenu` | Rechtermuisklik menu |
| `taskeditor` | Taak bewerk popup |
| `tooltips` | Hover informatie |
| `labels` | Tekst op/naast taken |
| `indicators` | Iconen/badges op taken |
| `rollups` | Subtaken in parent |
| `timeline` | Aparte timeline view |
| `timeranges` | Verticale markers |
| `progressline` | Voortgangslijn |

### Interacties
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `drag-from-grid` | Taken slepen vanuit lijst |
| `drag-resources-from-grid` | Resources toewijzen via drag |
| `undoredo` | Ongedaan maken/herhalen |
| `split-tasks` | Taken opsplitsen |
| `infinite-scroll` | Oneindig scrollen |
| `responsive` | Mobiel-vriendelijk |

### Data & Export
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `bigdataset` | Performance met veel data |
| `export` | PDF export |
| `exporttoexcel` | Excel export |
| `msprojectimport` | MS Project import |
| `msprojectexport` | MS Project export |
| `print` | Print layout |
| `state` | State persistence |
| `realtime-updates` | Live updates |

### Geavanceerd
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `charts` | Grafieken integratie |
| `s-curve` | S-curve diagram |
| `wbs` | Work Breakdown Structure |
| `versions` | Versie vergelijking |
| `grouping` | Taken groeperen |
| `filterbar` | Zoeken/filteren |
| `highlight-time-spans` | Periodes markeren |
| `inactive-tasks` | Inactieve taken |

### Combinaties
| Voorbeeld | Beschrijving |
|-----------|--------------|
| `gantt-schedulerpro` | Gantt + Scheduler |
| `gantt-taskboard` | Gantt + Kanban |

---

## CALENDAR - INTERESSANTE VOORBEELDEN

| Voorbeeld | Beschrijving |
|-----------|--------------|
| `basic` | Basis kalender |
| `day-agenda` | Dag + agenda view |
| `date-resource` | Resources per dag |
| `calendar-scheduler` | Kalender + scheduler |
| `calendar-taskboard` | Kalender + kanban |
| `drag-events` | Events slepen |
| `recurring-events` | Herhalende events |
| `external-drag` | Drag vanuit externe lijst |

---

## SCHEDULERPRO - INTERESSANTE VOORBEELDEN

| Voorbeeld | Beschrijving |
|-----------|--------------|
| `dependencies` | Event dependencies |
| `constraints` | Planning constraints |
| `conflicts` | Conflict detectie |
| `effort` | Effort-based scheduling |
| `nested-events` | Geneste events |
| `resource-non-working-time` | Vrije tijd per resource |
| `flight-dispatch` | Vliegtuig planning voorbeeld |

---

## TASKBOARD - INTERESSANTE VOORBEELDEN

| Voorbeeld | Beschrijving |
|-----------|--------------|
| `basic` | Basis kanban |
| `swimlanes` | Swimlanes |
| `columns` | Kolom configuratie |
| `linked-tasks` | Gekoppelde taken |
| `priorities` | Prioriteiten |
| `progress` | Voortgang tracking |
| `taskboard-gantt` | Kanban + Gantt |

---

## GRID - INTERESSANTE VOORBEELDEN

| Voorbeeld | Beschrijving |
|-----------|--------------|
| `basic` | Basis data grid |
| `tree` | Hiërarchische data |
| `grouping` | Rijen groeperen |
| `filtering` | Filter opties |
| `column-reorder` | Kolommen herschikken |
| `cell-editing` | Inline bewerken |
| `row-reorder` | Rijen slepen |
| `export` | Data export |

---

## AANBEVOLEN DEMO'S OM TE BESTUDEREN

### Voor Dashboard MVP:
1. `gantt/basic` - Basis structuur begrijpen
2. `gantt/dependencies` - Pijlen implementatie
3. `gantt/custom-taskbar` - Eigen styling
4. `gantt/resourceassignment` - Resources koppelen
5. `taskboard/basic` - Kanban als aanvulling

### Voor Geavanceerde Features:
1. `gantt/advanced` - Alles gecombineerd
2. `gantt/gantt-taskboard` - Combinatie view
3. `gantt/charts` - Dashboard grafieken
4. `schedulerpro/dependencies` - Scheduling engine

---

## HOE DEMO'S TE BEKIJKEN

Elke demo kan lokaal gedraaid worden:

```bash
# Navigeer naar demo
cd Downloads/bryntum-gantt-trial/gantt-7.1.0-trial/examples/basic

# Open index.html in browser (of gebruik live server)
```

Of bekijk via de docs:
```bash
# Open docs index
start Downloads/bryntum-gantt-trial/gantt-7.1.0-trial/docs/index.html
```
