# Bryntum Changelog Summary - Alle Producten

> **Bron**: Officiële Bryntum v7.1.0 changelogs - december 2024

---

## Huidige Versie: 7.1.0 (2025-12-19)

### Version Support (Alle Producten)

| Technologie | Minimum Versie |
|-------------|----------------|
| NodeJS | >= 20.0.0 |
| TypeScript | >= 3.6.0 |
| Angular | >= 9.0.0 |
| React | >= 16.0.0 |
| Vue | >= 3.0.0 |
| Ionic | >= 5.0.0 |
| Vite | >= 4.0.0 |
| Webpack | >= 4.0.0 |
| Remix | >= 2.15.0 |

---

## V7.0.0 Breaking Changes (KRITIEK)

### Styling Systeem Migratie

**[BREAKING] CSS Variabelen Systeem**
- SASS naar nested CSS met custom properties (CSS variables) gemigreerd
- Bestaande custom themes moeten worden herschreven
- Makkelijker runtime theme wijzigingen mogelijk

**[BREAKING] CSS Selectors Genormaliseerd**
- Consistent kebab-casing voor alle CSS classes
- Voorbeeld: `b-tabpanel` → `b-tab-panel`
- Custom CSS moet worden bijgewerkt

**[BREAKING] FontAwesome Niet Meer Ingebouwd**
- FA moet apart worden geïmporteerd:
  ```scss
  @import "@bryntum/gantt/fontawesome/css/fontawesome.css";
  @import "@bryntum/gantt/fontawesome/css/solid.css";
  ```
- `b-fa-` prefix vervangen door standaard `fa-` prefix
- FA versie 6.7.2 geüpdatet

### Nieuwe Themes (v7.0.0+)

| Theme | Beschrijving |
|-------|--------------|
| **Svalbard** | Nieuwe default - flat, modern |
| **Visby** | Meer borders, geïnspireerd op oude stadsmuur |
| **Material3** | Upgrade van Material v1 |
| **Stockholm** | Vernieuwde klassieke stijl |
| **High Contrast** | Extra contrast tekst/achtergrond |

Elk theme heeft `light` en `dark` variant.

---

## V7.0.0 API Wijzigingen

### Gantt Specifiek

**[BREAKING] AssignmentField**
- Base class veranderd van `Grid` naar `TabPanel`
- Aparte tabs per resource type: Work, Material, Cost

**[BREAKING] Effort Tracking**
- Effort wordt nu per assignment getrackt (voorheen op event niveau)
- Meerdere assignments van dezelfde resource naar één event nu mogelijk

**[DEPRECATED] Configs Hernoemd**
- `autoPostponedConflicts` → `autoPostponeConflicts`
- `hasPostponedOwnConstraintConflict` → `postponedConflict`
- `eventsData/tasksData` → `events/tasks`
- `resourcesData` → `resources`
- `assignmentsData` → `assignments`
- `dependenciesData` → `dependencies`

### Grid Specifiek

**[BREAKING] Verwijderde APIs**
- `Histogram.getRectClass()`
- `Store.originalCount`, `Store.allCount`, `Store.makeChained()`
- `WidgetHelper`
- `Widget.ariaLive`
- `PercentColumn.showCircle`
- `RowExpander` events: `beforeExpand`, `beforeCollapse`, `expand`, `collapse`
- `ExcelExporter.zipcelx`

**[BREAKING] DatePicker.cellRenderer**
- `cell` property bevat nu outer cell element
- `innerCell` property voor inner content element

**[BREAKING] Container Layout**
- Container en subclasses gebruiken nu CSS Grid layout standaard
- Configureer `layout: 'vbox'` voor oude default

**[DEPRECATED] Animation Configs**
- `Grid.animateRemovingRows`
- `Grid.animateTreeNodeToggle`
- `Grid.animateFilterRemovals`
- `RegionResize.animateCollapseExpand`
- Gebruik nieuwe `transition` config

### Scheduler/SchedulerPro Specifiek

**[BREAKING] resourceImageExtension**
- Default gewijzigd van `.jpg` naar `.png`

### Calendar Specifiek

**[BREAKING] Verwijderde APIs**
- `CalendarDatePicker.maxDots`
- `YearView.maxDots`
- `EventList.count`

---

## Nieuwe Features V7.x

### 7.1.0 Features

| Product | Feature |
|---------|---------|
| **Alle** | Nieuwe `fluent2` theme (light + dark) |
| **Grid** | `highlightCells()` en `unhighlightCells()` methods |
| **Grid** | DatePicker `dragSelect` voor multi-select |
| **TaskBoard** | FilterBar multi-word search + highlighting |
| **Gantt** | Store `Factoryable` - custom store types |

### 7.0.0 Features

| Product | Feature |
|---------|---------|
| **Gantt** | Cost calculations support - material/cost resource types |
| **Gantt** | Time-phased assignments (eigen start/end dates) |
| **Gantt** | `actualEffort` veld op TaskModel |
| **Gantt** | `BaselineEffortColumn` en `ActualEffortColumn` |
| **Grid** | `AIFilter` feature - natural language filtering |
| **Grid** | `PinColumns` feature - pin naar start/end |
| **Grid** | `RowReorder.showGrip: 'hover'` optie |
| **SchedulerPro** | Resource utilization tooltip verbeterd |
| **Calendar** | `DayView.compactHeader` configuratie |
| **Calendar** | `responsiveEventHeight` voor MonthView |

---

## Belangrijke Bug Fixes Recent

### 7.1.0

- `DurationColumn` waarden niet zichtbaar in PDF export (Gantt)
- Grid crash bij deleten record uit grouped view
- High contrast styling issues in filter menu

### 7.0.x

- WBS niet updaten bij indent/outdent in manual mode
- Progress line niet volledig geprint
- Task editor data gewist bij tree node collapse
- Salesforce LWC ondersteuning voor v7.0

---

## Versie Timeline

| Versie | Datum | Type |
|--------|-------|------|
| 7.1.0 | 2025-12-19 | Feature release |
| 7.0.2 | 2025-12-16 | Bugfix |
| 7.0.1 | 2025-12-05 | Bugfix |
| 7.0.0 | 2025-11-25 | Major release |
| 6.3.4 | 2025-11-20 | Bugfix |
| 6.3.3 | 2025-10-06 | Bugfix |
| 6.3.2 | 2025-09-15 | Bugfix |
| 6.3.1 | 2025-08-07 | Bugfix |
| 6.3.0 | 2025-07-21 | Feature release |
| 6.2.5 | 2025-07-09 | Bugfix |
| 6.2.4 | 2025-06-18 | Bugfix |
| 6.2.3 | 2025-05-27 | Bugfix |
| 6.2.2 | 2025-05-13 | Bugfix |
| 6.2.1 | 2025-04-23 | Bugfix |
| 6.2.0 | 2025-04-10 | Feature release |
| 6.1.x | 2024-2025 | Legacy |

---

## Migratie Checklist v6.x → v7.0

### CSS Updates Vereist

- [ ] FontAwesome apart importeren
- [ ] `b-fa-` prefixes vervangen door `fa-`
- [ ] Custom CSS classes updaten naar kebab-case
- [ ] Custom themes herschrijven met CSS variables
- [ ] Container layouts controleren (`layout: 'vbox'` indien nodig)

### API Updates Vereist

- [ ] Deprecated configs vervangen (zie lijst hierboven)
- [ ] DatePicker.cellRenderer check voor `innerCell` property
- [ ] AssignmentField tabs configuratie controleren
- [ ] Effort tracking per assignment controleren
- [ ] ExcelExporter migreren van zipcelx naar write-excel-file

### Optionele Verbeteringen

- [ ] Nieuwe themes implementeren (Svalbard recommended)
- [ ] AIFilter feature evalueren (Grid)
- [ ] PinColumns feature evalueren (Grid)
- [ ] Cost calculations implementeren (Gantt)

---

## Salesforce Ondersteuning

Alle producten ondersteunen Salesforce LWC (Lightning Web Components).

**Belangrijke Notes:**
- Nieuwe Salesforce Community pagina's beschikbaar
- LWS support in Firefox gefixet (v6.1.3)
- v7.0 Salesforce support volledig geïmplementeerd

Demo URLs:
- Gantt: https://bryntum-dev-ed.develop.my.site.com/demo/gantt
- Grid: https://bryntum-dev-ed.develop.my.site.com/demo/grid
- SchedulerPro: https://bryntum-dev-ed.develop.my.site.com/demo/schedulerpro
- Calendar: https://bryntum-dev-ed.develop.my.site.com/demo/calendar
- TaskBoard: https://bryntum-dev-ed.develop.my.site.com/demo/taskboard

---

## NPM Nightly Builds

Beschikbaar sinds v6.1.8:
```
X.Y.Z-nightly.YYYYMMDD
```
Voorbeeld: `6.1.8-nightly.20250330`

Trial thin packages beschikbaar sinds v6.1.4.

---

*Document gegenereerd: December 2024*
*Bryntum versie: 7.1.0*
