# BRYNTUM GANTT DEMO CATALOGUS

> Complete analyse van alle Gantt demo's

---

## CORE DEMOS

### basic
| Aspect | Details |
|--------|---------|
| **Doel** | Minimale Gantt setup |
| **Key Config** | `dependencyIdField: 'sequenceNumber'`, `rowHeight: 45`, `barMargin: 8` |
| **Features** | Custom `taskRenderer()` voor naam op child tasks |

### advanced
| Aspect | Details |
|--------|---------|
| **Doel** | Alle features gecombineerd |
| **Key Config** | Custom ComplexityColumn, StatusColumn, dual-view (Gantt + ResourceGrid) |
| **Features** | Undo/Redo, cell editing, baselines, labels, progress lines, critical paths |

---

## DEPENDENCIES & SCHEDULING

### dependencies
| Aspect | Details |
|--------|---------|
| **Doel** | Dependency line visualisatie en interactie |
| **Key Config** | `terminalOffset: 0`, `terminalSize: 12`, `clickWidth: 5px`, `radius: 10px` |
| **Features** | Customizable markers (default/thin/circle), deletion dialog, hover tooltips |

### criticalpaths
| Aspect | Details |
|--------|---------|
| **Doel** | Kritieke pad analyse met slack berekening |
| **Key Config** | `criticalPaths: { disabled: false, highlightCriticalRows: true }` |
| **Columns** | `earlystartdate`, `earlyenddate`, `latestartdate`, `lateenddate`, `totalslack` |

### auto-constraints
| Aspect | Details |
|--------|---------|
| **Doel** | Automatische constraints wanneer geen dependencies |
| **Key Config** | `autoSetConstraints: true` |

### calendars
| Aspect | Details |
|--------|---------|
| **Doel** | Task en project kalender management |
| **Key Config** | `taskNonWorkingTime` en `nonWorkingTime` features |
| **Modes** | row/bar/both voor non-working time display |

### conflicts
| Aspect | Details |
|--------|---------|
| **Doel** | Scheduling conflict detectie en resolutie |

### scheduling-direction
| Aspect | Details |
|--------|---------|
| **Doel** | Forward/backward scheduling |

---

## RESOURCE MANAGEMENT

### resourceassignment
| Aspect | Details |
|--------|---------|
| **Doel** | Resource toewijzing workflow |
| **Key Config** | `resourceImagePath`, picker met `height: 350`, `width: 450` |
| **Features** | Multi-select, group by city, filter bar |

### resourcehistogram
| Aspect | Details |
|--------|---------|
| **Doel** | Resource allocatie histogram |
| **Key Config** | `showBarTip: true`, `rowHeight: 50`, `partner: gantt` |
| **Features** | Splitter, bar text toggle, max allocation indicator |

### resourceutilization
| Aspect | Details |
|--------|---------|
| **Doel** | Time-phased resource utilization tracking |
| **Key Config** | `TimePhasedProjectModel`, series: effort/cost/quantity |
| **Features** | TreeGroup, allocation cell editing, copy/paste |

### single-assignment
| Aspect | Details |
|--------|---------|
| **Doel** | Eén resource per taak |

---

## BASELINE & PROGRESS

### baselines
| Aspect | Details |
|--------|---------|
| **Doel** | Planning vs actueel vergelijking |
| **Key Config** | `rowHeight: 60` (extra ruimte), 3 baseline versies |
| **Features** | Variance tracking, CSS classes (behind/ahead/on-time), tooltips |

### progressline
| Aspect | Details |
|--------|---------|
| **Doel** | Voortgangslijn op status datum |
| **Key Config** | `progressLine: { statusDate: ... }` |
| **Features** | Adjustable status date, visibility toggle |

### planned-percent-done
| Aspect | Details |
|--------|---------|
| **Doel** | Geplande vs werkelijke voortgang |

---

## CUSTOM RENDERING

### custom-taskbar
| Aspect | Details |
|--------|---------|
| **Doel** | Custom task bar met gewerkte uren |
| **Key Config** | `rowHeight: 70`, custom `MyTask` class met `hoursWorked[]` |
| **Features** | Custom HourEditor, tab navigatie, parent rollup |

### custom-rendering
| Aspect | Details |
|--------|---------|
| **Doel** | Resource avatars, color inheritance, custom UI |
| **Key Config** | `eventColor: 'blue'`, `infiniteScroll: true` |
| **Features** | Avatars in taskbars, custom column renderers, sidebar settings |

### labels
| Aspect | Details |
|--------|---------|
| **Doel** | Labels op task bars (top/bottom/before/after) |
| **Key Config** | `labels: { top, bottom, before, after }`, `rowHeight: 70` |
| **Features** | Positionering switchen, date formatting |

### indicators
| Aspect | Details |
|--------|---------|
| **Doel** | Task indicators voor dates en deadlines |
| **Key Config** | `indicators: { items: { earlyDates, lateDates, deadlineDate, constraintDate } }` |
| **Features** | Custom icons, toggle menu |

### rollups
| Aspect | Details |
|--------|---------|
| **Doel** | Aggregate data in parent tasks |
| **Key Config** | `features: { rollups: true }`, `rowHeight: 50` |

### taskstyles
| Aspect | Details |
|--------|---------|
| **Doel** | Verschillende task styling opties |

### custom-theme
| Aspect | Details |
|--------|---------|
| **Doel** | Custom CSS theme |

---

## UI COMPONENTS

### taskeditor
| Aspect | Details |
|--------|---------|
| **Doel** | Custom task editor met tabs |
| **Key Config** | `editorConfig: { width: '48em', modal: true }` |
| **Features** | TinyMCE rich text, file attachments, ResourceList widget |

### taskmenu
| Aspect | Details |
|--------|---------|
| **Doel** | Context menu customization |
| **Key Config** | `taskMenu: { items, processItems }` |
| **Features** | Dynamic visibility, color picker, toast notifications |

### tooltips
| Aspect | Details |
|--------|---------|
| **Doel** | Custom tooltip templates |
| **Key Config** | `taskTooltip: { template }`, `taskDrag: { tooltipTemplate }` |
| **Features** | Multi-field layout, resource avatars, XSS-safe |

### filterbar
| Aspect | Details |
|--------|---------|
| **Doel** | Real-time filtering interface |
| **Key Config** | `filterBar: { keyStrokeFilterDelay: 100 }` |

### grouping
| Aspect | Details |
|--------|---------|
| **Doel** | Group tasks by custom fields |
| **Key Config** | `treeGroup: { hideGroupedColumns: true, levels: ['priority'] }` |
| **Features** | GroupBar, custom parent renderer, priority styling |

---

## STATE & HISTORY

### undoredo
| Aspect | Details |
|--------|---------|
| **Doel** | Transaction history management |
| **Key Config** | `stm: { autoRecord: true }`, `enableUndoRedoKeys: true` |
| **Features** | ActionsGrid, transaction breakdown, Ctrl+Z/Y |

### state
| Aspect | Details |
|--------|---------|
| **Doel** | Persist state to localStorage/backend |
| **Key Config** | `stateId: 'mainGantt'`, `StateProvider.setup('local')` |
| **Features** | Auto-save, reset to default, backend sync |

---

## DRAG & DROP

### drag-from-grid
| Aspect | Details |
|--------|---------|
| **Doel** | Drag unscheduled tasks from externe grid |
| **Key Config** | Custom `DragHelper` class, `dropTargetSelector` |
| **Features** | Cross-grid drag-and-drop, clone target |

### drag-resources-from-grid
| Aspect | Details |
|--------|---------|
| **Doel** | Resources slepen naar taken |

### drag-resources-from-utilization-panel
| Aspect | Details |
|--------|---------|
| **Doel** | Resources slepen vanuit utilization panel |

---

## COMBINED VIEWS

### gantt-taskboard
| Aspect | Details |
|--------|---------|
| **Doel** | Gantt + Kanban gecombineerd |
| **Key Config** | `columnField: 'status'`, bidirectional linking |
| **Features** | Status-driven flow (todo/wip/review/done) |

### gantt-schedulerpro
| Aspect | Details |
|--------|---------|
| **Doel** | Gantt + Resource Scheduler |
| **Key Config** | `partner: gantt`, `eventStyle: 'gantt'` |
| **Features** | Cross-panel selection, zoom controls |

### multiple-gantt-charts
| Aspect | Details |
|--------|---------|
| **Doel** | Meerdere Gantt charts naast elkaar |

---

## CHARTS & REPORTS

### charts
| Aspect | Details |
|--------|---------|
| **Doel** | Chart.js visualisaties |
| **Key Config** | `charts` feature, `chartDesigner: 'donut'` |

### s-curve
| Aspect | Details |
|--------|---------|
| **Doel** | Earned value management S-curve |
| **Key Config** | `timelineChart` feature, custom effort callbacks |
| **Features** | Multi-dataset selector, effort calculation |

---

## EXPORT

### export
| Aspect | Details |
|--------|---------|
| **Doel** | PDF export via server |
| **Key Config** | `pdfExport: { exportServer: 'http://localhost:8080/' }` |
| **Features** | Custom headers/footers, page numbering |

### exporttoexcel
| Aspect | Details |
|--------|---------|
| **Doel** | Excel/CSV export |
| **Key Config** | `excelExporter` feature, `WriteExcelFileProvider` |
| **Features** | XLSX/CSV formats, WBS/predecessors/successors columns |

### print
| Aspect | Details |
|--------|---------|
| **Doel** | Print-friendly rendering |
| **Key Config** | `print` feature, `showPrintDialog()` |

### msprojectimport / msprojectexport
| Aspect | Details |
|--------|---------|
| **Doel** | MS Project import/export |

---

## TIMELINE & TIME

### timeline
| Aspect | Details |
|--------|---------|
| **Doel** | Lightweight timeline view |
| **Key Config** | `Timeline` widget, `eventStyle: 'gantt'` |

### timeranges
| Aspect | Details |
|--------|---------|
| **Doel** | Time ranges (blackout dates, sprints) |
| **Key Config** | `timeRanges: { enableResizing: true, showHeaderElements: true }` |

### highlight-time-spans
| Aspect | Details |
|--------|---------|
| **Doel** | Periodes markeren |

### timezone
| Aspect | Details |
|--------|---------|
| **Doel** | Timezone handling |

### fill-ticks
| Aspect | Details |
|--------|---------|
| **Doel** | Fill visual voor tick marks |

---

## HIERARCHY & STRUCTURE

### wbs
| Aspect | Details |
|--------|---------|
| **Doel** | Work Breakdown Structure codes |
| **Key Config** | `columns: [{ type: 'wbs' }]`, `wbsMode: 'auto'/'manual'` |
| **Features** | Auto/manual mode toggle, ordered tree |

### split-tasks
| Aspect | Details |
|--------|---------|
| **Doel** | Taken opsplitsen in segmenten |

### parent-area
| Aspect | Details |
|--------|---------|
| **Doel** | Parent task area rendering |

### layers
| Aspect | Details |
|--------|---------|
| **Doel** | Multiple rendering layers |

---

## GRID FEATURES

### collapsible-columns
| Aspect | Details |
|--------|---------|
| **Doel** | Kolommen inklapbaar maken |

### fixed-columns
| Aspect | Details |
|--------|---------|
| **Doel** | Vaste kolommen |

### grid-sections
| Aspect | Details |
|--------|---------|
| **Doel** | Grid secties |

### cellselection
| Aspect | Details |
|--------|---------|
| **Doel** | Cel selectie |

### aggregation-column
| Aspect | Details |
|--------|---------|
| **Doel** | Aggregatie kolom |

---

## PERFORMANCE & SCROLL

### bigdataset
| Aspect | Details |
|--------|---------|
| **Doel** | Performance met grote datasets |

### infinite-scroll
| Aspect | Details |
|--------|---------|
| **Doel** | Oneindig scrollen |

### early-render
| Aspect | Details |
|--------|---------|
| **Doel** | Vroege rendering optimalisatie |

### scroll-buttons
| Aspect | Details |
|--------|---------|
| **Doel** | Scroll navigatie buttons |

---

## SPECIAL

### ai-gantt
| Aspect | Details |
|--------|---------|
| **Doel** | AI integratie |

### versions
| Aspect | Details |
|--------|---------|
| **Doel** | Versie vergelijking |

### pin-successors
| Aspect | Details |
|--------|---------|
| **Doel** | Successors vastzetten |

### inactive-tasks
| Aspect | Details |
|--------|---------|
| **Doel** | Inactieve taken |

### summary
| Aspect | Details |
|--------|---------|
| **Doel** | Summary rows |

### portfolio-planning
| Aspect | Details |
|--------|---------|
| **Doel** | Portfolio planning |

### construction
| Aspect | Details |
|--------|---------|
| **Doel** | Bouw project voorbeeld |

---

## COMMON CONFIG PATTERNS

| Pattern | Voorbeeld | Beschrijving |
|---------|-----------|--------------|
| `dependencyIdField` | `'sequenceNumber'`, `'wbsCode'` | Task relatie identificatie |
| `autoSetConstraints` | `true` | Auto constraint wanneer geen deps |
| `rowHeight` | 30-70px | Afhankelijk van content |
| `barMargin` | 4-10px | Ruimte task bar - row edge |
| `tickSize` | 35-50px | Timeline header cel breedte |
| `resourceImagePath` | `'../_shared/images/'` | Avatar locatie |
| Feature toggle | `{ disabled: false }` | Features aan/uit |
| Custom TaskModel | `extends TaskModel` | Domain-specific velden |
