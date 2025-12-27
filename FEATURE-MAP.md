# BRYNTUM GANTT FEATURE MAP

> Blackbox analyse van Bryntum Gantt functionaliteit voor eigen implementatie

---

## 1. DATA MODEL

### Project
| Veld | Type | Beschrijving |
|------|------|--------------|
| `calendar` | string | Verwijzing naar kalender |
| `startDate` | date | Project startdatum |
| `hoursPerDay` | number | Uren per werkdag (24) |
| `daysPerWeek` | number | Werkdagen per week (5) |
| `daysPerMonth` | number | Werkdagen per maand (20) |

### Tasks (Taken)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke identifier |
| `name` | string | Taaknaam |
| `startDate` | date | Startdatum |
| `endDate` | date | Einddatum (optioneel) |
| `duration` | number | Duur in dagen |
| `percentDone` | number | Voortgang 0-100% |
| `expanded` | boolean | Ingeklapt/uitgeklapt |
| `children` | Task[] | Subtaken (hiërarchie) |
| `rollup` | boolean | Toon in parent bar |
| `color` | string | Aangepaste kleur |
| `cost` | number | Kosten |
| `iconCls` | string | FontAwesome icoon |
| `showInTimeline` | boolean | Toon in timeline |
| `baselines` | Baseline[] | Baseline vergelijkingen |

### Dependencies (Afhankelijkheden)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke identifier |
| `fromTask` | number | Bron taak ID |
| `toTask` | number | Doel taak ID |
| `lag` | number | Vertraging in dagen |

### Resources (Medewerkers)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke identifier |
| `name` | string | Naam |
| `city` | string | Locatie |
| `calendar` | string | Persoonlijke kalender |
| `image` | string | Avatar afbeelding |

### Assignments (Toewijzingen)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke identifier |
| `event` | number | Taak ID |
| `resource` | number | Resource ID |

### Calendars (Kalenders)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | string | Identifier |
| `name` | string | Naam |
| `intervals` | Interval[] | Werk/vrij intervallen |
| `children` | Calendar[] | Sub-kalenders |

### TimeRanges (Markeringen)
| Veld | Type | Beschrijving |
|------|------|--------------|
| `id` | number | Unieke identifier |
| `name` | string | Label |
| `startDate` | date | Datum |
| `duration` | number | Duur (0 = verticale lijn) |
| `cls` | string | CSS class/icoon |

---

## 2. UI FEATURES

| Feature | Beschrijving | Prioriteit |
|---------|--------------|------------|
| **Hiërarchie** | Inklapbare parent/child taken (3+ niveaus) | |
| **Timeline** | Horizontale tijdsbalk met taken | |
| **Dependencies** | Pijlen tussen taken | |
| **Progress bar** | Voortgang binnen taakbalk | |
| **Milestones** | Taken met duration=0 (diamant) | |
| **Baselines** | Vergelijking met originele planning | |
| **Rollup** | Subtaken zichtbaar in parent | |
| **Resource avatars** | Foto's bij taken | |
| **Custom icons** | FontAwesome iconen | |
| **Time ranges** | Verticale markers (deadlines) | |
| **Weekends** | Grijze niet-werkdagen | |

---

## 3. INTERACTIES

| Interactie | Beschrijving |
|------------|--------------|
| **Drag & drop** | Taken verplaatsen op tijdlijn |
| **Resize** | Duur aanpassen door randen te slepen |
| **Expand/collapse** | Klikken op pijl om subtaken te tonen/verbergen |
| **Zoom** | Wisselen tussen dag/week/maand weergave |
| **Scroll** | Horizontaal door tijdlijn, verticaal door taken |
| **Hover** | Tooltip met taakdetails |
| **Click** | Taak selecteren |

---

## 4. CONFIGURATIE OPTIES

| Setting | Waarde | Beschrijving |
|---------|--------|--------------|
| `viewPreset` | `weekAndDayLetter` | Tijdschaal weergave |
| `barMargin` | 10px | Ruimte tussen taakbalken |
| `columns` | Name (300px) | Zichtbare kolommen |
| `timeRangesFeature` | true | Verticale markers aan |
| `taskRenderer` | custom | Naam op leaf tasks |

---

## 5. IMPLEMENTATIE AANPAK

### Optie A: Open-source library
- `frappe-gantt` (MIT, lightweight ~15kb)
- `dhtmlx-gantt` (GPL of commercieel)

### Optie B: Custom implementatie
- React + CSS Grid voor tijdlijn
- Custom hooks voor drag & drop
- SVG voor dependency pijlen

### Te bouwen componenten
1. `<GanttChart />` - Hoofdcontainer
2. `<TaskList />` - Linker kolom met hiërarchie
3. `<Timeline />` - Rechter deel met tijdsbalk
4. `<TaskBar />` - Individuele taakbalk
5. `<DependencyArrow />` - SVG pijl tussen taken
6. `<TimeHeader />` - Datum/week headers

---

## 6. PRIORITEITEN

> Vul hier in welke features essentieel zijn:

- [ ] Hiërarchie (parent/child)
- [ ] Tijdlijn met taken
- [ ] Dependencies (pijlen)
- [ ] Progress indicator
- [ ] Drag & drop
- [ ] Milestones
- [ ] Resources/assignments
- [ ] Baselines
- [ ] Kalenders
- [ ] Time ranges
