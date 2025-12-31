# BRYNTUM MASTER FEATURE CATALOGUS

> Complete cross-reference van alle features uit 338 demos

---

## OVERZICHT

| Component | Demos | Primaire Focus |
|-----------|-------|----------------|
| **Gantt** | 95 | Project management, dependencies, resources |
| **SchedulerPro** | 46 | Resource scheduling, constraints, events |
| **Calendar** | 64 | Event calendar, views, recurring |
| **TaskBoard** | 42 | Kanban, columns, swimlanes |
| **Grid** | 91 | Data grid, tree, filtering, export |

**Totaal: 338 demos geanalyseerd**

---

## 1. DATA STRUCTUREN

### Hiërarchie & Relaties

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| Parent-child trees | ✓ | ✓ | - | - | ✓ |
| Dependencies | ✓ | ✓ | - | - | - |
| Resources | ✓ | ✓ | ✓ | - | - |
| Assignments | ✓ | ✓ | - | - | - |
| Nested events | - | ✓ | - | - | ✓ |
| Swimlanes | - | - | - | ✓ | - |

### Tijd & Planning

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| Duration-based | ✓ | ✓ | - | - | - |
| Start/End dates | ✓ | ✓ | ✓ | - | - |
| Calendars | ✓ | ✓ | ✓ | - | - |
| Time ranges | ✓ | ✓ | ✓ | - | - |
| Recurring events | - | ✓ | ✓ | - | - |
| Constraints | ✓ | ✓ | - | - | - |
| Effort tracking | ✓ | ✓ | - | - | - |
| Baselines | ✓ | - | - | - | - |

---

## 2. UI COMPONENTEN

### Layout Patterns

| Pattern | Componenten | Beschrijving |
|---------|-------------|--------------|
| Split View | Gantt, Scheduler | Grid links + Timeline rechts |
| Kanban Board | TaskBoard | Kolommen met cards |
| Calendar Grid | Calendar | Dag/week/maand views |
| Resource Timeline | Scheduler | Resources in rijen |
| Master-Detail | Grid | Parent-child grids |
| Tree View | Gantt, Grid | Hiërarchische data |

### Views & Modes

| View | Calendar | Beschrijving |
|------|:--------:|--------------|
| Day | ✓ | Single day |
| Week | ✓ | 7 dagen |
| Month | ✓ | Maand grid |
| Year | ✓ | Jaar overzicht |
| Agenda | ✓ | Lijst formaat |
| Resource | ✓ | Per resource |

### Time Headers

| Preset | Gantt/Scheduler | Levels |
|--------|:---------------:|--------|
| hourAndDay | ✓ | Dag → Uur |
| dayAndWeek | ✓ | Week → Dag |
| weekAndMonth | ✓ | Maand → Week |
| monthAndYear | ✓ | Jaar → Maand |

---

## 3. INTERACTIE FEATURES

### Drag & Drop

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| Task/Event drag | ✓ | ✓ | ✓ | ✓ | - |
| Resize | ✓ | ✓ | ✓ | - | - |
| Drag from external | ✓ | ✓ | ✓ | - | ✓ |
| Cross-grid drag | - | - | - | - | ✓ |
| Row reordering | ✓ | - | - | - | ✓ |
| Column drag | - | - | - | ✓ | ✓ |
| Batch drag | - | ✓ | - | - | - |

### Selection

| Mode | Alle Componenten |
|------|------------------|
| Single click | ✓ |
| Multi-select (Ctrl) | ✓ |
| Range select (Shift) | ✓ |
| Checkbox select | ✓ |
| Cell select | Grid |
| Drag select | ✓ |

### Editing

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| Modal editor | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inline edit | ✓ | - | - | ✓ | ✓ |
| Cell edit | ✓ | - | - | - | ✓ |
| Rich text (TinyMCE) | ✓ | ✓ | - | ✓ | ✓ |
| Custom tabs | ✓ | ✓ | ✓ | - | - |

---

## 4. FILTERING & ZOEKEN

| Feature | Alle Componenten |
|---------|------------------|
| Column filters | ✓ |
| Filter bar | ✓ |
| Quick find | ✓ |
| Custom filter functions | ✓ |
| Regex support | ✓ |
| Multi-select filters | ✓ |
| Chained filters | ✓ |

---

## 5. GROUPING & SORTING

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| Group by field | ✓ | ✓ | - | - | ✓ |
| Multi-level grouping | - | - | - | - | ✓ |
| Group summaries | ✓ | - | - | - | ✓ |
| Custom sorters | ✓ | ✓ | - | ✓ | ✓ |
| Column sorting | ✓ | - | - | ✓ | ✓ |
| Swimlane grouping | - | - | - | ✓ | - |

---

## 6. VISUALISATIE

### Task/Event Rendering

| Feature | Beschrijving | Componenten |
|---------|--------------|-------------|
| Progress bar | Percentage gevuld | Gantt, Scheduler |
| Labels | Top/bottom/before/after | Gantt |
| Icons | FontAwesome | Alle |
| Colors | CSS namen/hex | Alle |
| Custom renderer | Template functie | Alle |
| Rollups | Aggregate in parent | Gantt |
| Baselines | Geplande vs actueel | Gantt |

### Dependencies

| Type | Code | Beschrijving |
|------|------|--------------|
| Finish-to-Start | FS | Default, A klaar → B start |
| Start-to-Start | SS | A start → B start |
| Finish-to-Finish | FF | A klaar → B klaar |
| Start-to-Finish | SF | A start → B klaar |

### Milestones

| Type | Visual |
|------|--------|
| Standard | ◇ Diamant |
| Important | ◆ Gevuld |
| Deadline | ⚠ Warning |
| Complete | ✓ Checkmark |

---

## 7. RESOURCE MANAGEMENT

| Feature | Gantt | Scheduler | Calendar |
|---------|:-----:|:---------:|:--------:|
| Resource list | ✓ | ✓ | ✓ |
| Assignment | ✓ | ✓ | - |
| Multi-assign | ✓ | ✓ | - |
| Resource histogram | ✓ | ✓ | - |
| Resource utilization | ✓ | ✓ | - |
| Capacity tracking | - | - | ✓ |
| Avatars | ✓ | ✓ | ✓ |
| Rate tables | ✓ | - | - |

---

## 8. CALENDARS & WORKING TIME

| Feature | Gantt | Scheduler | Calendar |
|---------|:-----:|:---------:|:--------:|
| Project calendar | ✓ | ✓ | - |
| Resource calendar | ✓ | ✓ | - |
| Non-working time | ✓ | ✓ | - |
| Working hours | ✓ | ✓ | ✓ |
| Holidays | ✓ | ✓ | ✓ |
| Weekend handling | ✓ | ✓ | ✓ |
| Timezone support | ✓ | ✓ | ✓ |
| Day start shift | - | - | ✓ |

---

## 9. EXPORT & PRINT

| Feature | Gantt | Scheduler | Calendar | TaskBoard | Grid |
|---------|:-----:|:---------:|:--------:|:---------:|:----:|
| PDF export | ✓ | - | - | - | - |
| Excel export | ✓ | - | ✓ | - | ✓ |
| CSV export | ✓ | - | - | - | ✓ |
| ICS export | - | - | ✓ | - | - |
| Print | ✓ | - | ✓ | - | ✓ |
| MS Project import | ✓ | - | - | - | - |
| MS Project export | ✓ | - | - | - | - |
| Excel import | - | - | - | - | ✓ |

---

## 10. STATE & PERSISTENCE

| Feature | Alle Componenten |
|---------|------------------|
| LocalStorage | ✓ |
| Backend state | ✓ |
| Auto-save | ✓ |
| Undo/Redo | ✓ |
| Transaction history | ✓ |
| State reset | ✓ |

---

## 11. PERFORMANCE

| Feature | Beschrijving | Componenten |
|---------|--------------|-------------|
| Virtual scrolling | Render only visible | Alle |
| useRawData | Skip model processing | Alle |
| Lazy loading | On-demand data | Gantt, Grid |
| Infinite scroll | Server pagination | Grid, Scheduler |
| Feature toggling | Disable unused | Alle |
| Fixed row height | Faster calculation | Grid |

### Tested Scale

| Component | Max Records |
|-----------|-------------|
| Gantt | 10,000+ tasks |
| SchedulerPro | 10,000+ events |
| Calendar | 100,000 events |
| TaskBoard | 5,000 tasks |
| Grid | 1,000,000 rows |

---

## 12. FRAMEWORKS

| Framework | Alle Componenten |
|-----------|------------------|
| Angular | ✓ |
| React | ✓ |
| Vue 2 | ✓ |
| Vue 3 | ✓ |
| Vite | ✓ |
| Remix | ✓ |
| Webpack | ✓ |
| ExtJS | ✓ |
| Web Components | ✓ |

---

## 13. THEMING

| Theme | Beschrijving |
|-------|--------------|
| Stockholm | Modern light |
| Svalbard | Clean light (default) |
| Material3 | Google Material |
| Visby | Soft colors |
| High Contrast | Accessibility |
| Classic | Traditional |
| Classic Dark | Dark mode |

---

## 14. SPECIALIZED FEATURES

### Gantt-Only

| Feature | Beschrijving |
|---------|--------------|
| Critical path | Longest dependency chain |
| Slack calculation | Float time per task |
| WBS codes | Work breakdown structure |
| Progress line | Status date indicator |
| Rollups | Child aggregation |
| Split tasks | Multiple segments |
| Versions | Version comparison |

### Scheduler-Only

| Feature | Beschrijving |
|---------|--------------|
| Nested events | Parent-child events |
| Event buffers | Travel time |
| Skill matching | Resource-event matching |
| Conflicts | Scheduling conflicts |
| Effort | Resource allocation |

### Calendar-Only

| Feature | Beschrijving |
|---------|--------------|
| All-day events | Full day blocking |
| Month agenda | Month + event list |
| Resource columns | Day by resource |
| Heatmap | Event density |
| Radio schedule | Programming grid |

### TaskBoard-Only

| Feature | Beschrijving |
|---------|--------------|
| Swimlanes | Horizontal grouping |
| Card items | Progress, images, etc |
| Column toolbars | Add/remove actions |
| Todo lists | Embedded checklists |
| Catch-all column | Unmatched items |

### Grid-Only

| Feature | Beschrijving |
|---------|--------------|
| Cell merging | Span cells |
| Sparklines | Inline charts |
| Row expander | Detail panels |
| Widget columns | Custom widgets |
| Facet filters | E-commerce style |

---

## 15. COLOR REFERENCE

### Standaard Kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| blue | #2196F3 | Default |
| green | #4CAF50 | Complete |
| orange | #FF9800 | Warning |
| red | #F44336 | Critical |
| purple | #9C27B0 | Special |
| teal | #009688 | Alternative |
| gray | #9E9E9E | Inactive |

### Status Kleuren

| Status | Kleur |
|--------|-------|
| Not started | Gray |
| In progress | Blue |
| Complete | Green |
| Delayed | Orange |
| Critical | Red |

---

## 16. ICON REFERENCE (FontAwesome)

### Algemeen

| Context | Icon | Class |
|---------|------|-------|
| Folder | 📁 | fa-folder |
| Task | 📄 | fa-file |
| Bug | 🐛 | fa-bug |
| Feature | ✨ | fa-magic |
| Meeting | 👥 | fa-users |
| Milestone | ◇ | fa-diamond |
| Warning | ⚠️ | fa-exclamation-triangle |
| Complete | ✓ | fa-check |

### Resources

| Type | Icon | Class |
|------|------|-------|
| Person | 👤 | fa-user |
| Team | 👥 | fa-users |
| Truck | 🚚 | fa-truck |
| Plane | ✈️ | fa-plane |
| Server | 🖥️ | fa-server |

---

## 17. COMMON CONFIGURATION PATTERNS

### Data Loading

```javascript
// Inline
data: [{ id: 1, name: 'Task' }]

// Remote
readUrl: '/api/tasks',
autoLoad: true

// CrudManager
crudManager: {
  transport: {
    load: { url: '/api/load' },
    sync: { url: '/api/sync' }
  }
}
```

### Feature Toggle

```javascript
features: {
  dependencies: { disabled: false },
  criticalPaths: true,
  filter: true,
  sort: 'name'
}
```

### Custom Renderer

```javascript
taskRenderer({ taskRecord, renderData }) {
  renderData.eventColor = taskRecord.priority === 'high' ? 'red' : 'blue';
  return taskRecord.name;
}
```

### Responsive Config

```javascript
responsiveLevels: {
  small: 450,
  medium: 800,
  large: '*'
}
```

---

## 18. RECOMMENDED DEMOS PER USE CASE

### Project Management
- Gantt: `advanced`, `criticalpaths`, `dependencies`, `baselines`
- TaskBoard: `basic`, `swimlanes`, `filtering`

### Resource Scheduling
- SchedulerPro: `effort`, `resourcehistogram`, `resourceutilization`
- Calendar: `resource-modes`, `resource-time-capacity`

### Field Service
- SchedulerPro: `drag-unplanned-tasks`, `travel-time`, `skill-matching`
- Calendar: `travel-time`, `filtering`

### Manufacturing
- Gantt: `calendars`, `constraints`, `conflicts`
- SchedulerPro: `bigdataset`, `nested-events`

### E-commerce
- Grid: `nested-grid`, `exporttoexcel`, `facet-filter`
- TaskBoard: `todo-list`, `column-toolbars`

### Data Analysis
- Grid: `charts`, `groupsummary`, `sparklines`
- Gantt: `s-curve`, `charts`

---

## 19. DOCUMENTATIE BESTANDEN

| Bestand | Inhoud |
|---------|--------|
| `DEMO-CATALOG-GANTT.md` | 95 Gantt demos |
| `DEMO-CATALOG-SCHEDULERPRO.md` | 46 SchedulerPro demos |
| `DEMO-CATALOG-CALENDAR.md` | 64 Calendar demos |
| `DEMO-CATALOG-TASKBOARD.md` | 42 TaskBoard demos |
| `DEMO-CATALOG-GRID.md` | 91 Grid demos |
| `DATA-MODELS.md` | Data structuren |
| `UI-PATTERNS.md` | Visuele patronen |
| `FEATURE-MAP.md` | Feature mapping |
| `BRYNTUM-ECOSYSTEM.md` | Ecosystem overview |

---

*Blackbox analyse van Bryntum 7.1.0 trial packages - December 2024*
