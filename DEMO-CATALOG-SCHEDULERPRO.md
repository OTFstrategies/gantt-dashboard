# BRYNTUM SCHEDULERPRO DEMO CATALOGUS (46 demos)

## CORE SCHEDULING

### dependencies
- **Doel**: Task dependencies met predecessor/successor relaties
- **Config**: `clickWidth: 5`, `radius: 10`, `highlightDependenciesOnEventHover: true`
- **Features**: Dependency lines, lag configuratie, dependency menu/editor

### constraints
- **Doel**: Scheduling constraints (MustStartOn, MustFinishOn, etc.)
- **Features**: 6 constraint types, visuele indicators, kleurcodering (rood=strict, oranje=flexibel)

### recurrence
- **Doel**: Recurring events met flexibele configuratie
- **Config**: `enableRecurringEvents: true`
- **Features**: Occurrence detection, custom kleuren, fa-rotate icoon

### conflicts
- **Doel**: Conflict detectie en resolutie
- **Features**: Cycle detection, invalid calendar detection, constraint enforcement

---

## RESOURCE MANAGEMENT

### effort
- **Doel**: Effort-based scheduling met resource allocatie
- **Config**: FixedDuration event model, `schedulingMode: 'FixedDuration'`
- **Features**: Dual view (Scheduler + ResourceUtilization), units/contribution levels

### resourcehistogram
- **Doel**: Resource allocatie histogram
- **Config**: `showBarTip: true`, `rowHeight: 60`
- **Features**: Allocation bars, max threshold, bar tooltips, splitter panel

### resourceutilization
- **Doel**: Time-phased resource utilization met tree grouping
- **Features**: Multiple hierarchy levels, group by resource/city, assignment-level display

### skill-matching
- **Doel**: Resource assignment op basis van skills
- **Features**: Skill requirement matching, constraint enforcement

### ai-skillmatching
- **Doel**: AI-powered skill matching (PHP backend)
- **Features**: Intelligent resource recommendation, server-side optimization

---

## EVENT MANAGEMENT

### nested-events
- **Doel**: Hiërarchische event structuren met subtasks
- **Config**: `constrainDragToParent: true`
- **Features**: Parent-child relaties, SubtaskTab editor, horizontal/vertical modes
- **Custom**: SchedulerWithSubtasks, SubtaskTab classes

### nested-events-configuration
- **Doel**: Advanced configuration voor nested hierarchies
- **Features**: Multiple nesting levels, parent-child constraints

### nested-events-deep
- **Doel**: Deep nesting (3+ levels)
- **Use Case**: EPC projects, complex organizational hierarchies

### nested-events-dependencies
- **Doel**: Nested events + dependency chains
- **Features**: Dependency propagation through hierarchy

### nested-events-drag-from-grid
- **Doel**: Nested events van externe grid slepen

### nested-events-lazy-load
- **Doel**: Lazy loading voor deeply nested structures
- **Features**: On-demand child loading, memory-efficient

### percent-done
- **Doel**: Visual progress tracking
- **Config**: `percentBar: { allowResize: true, showPercentage: false }`
- **Features**: Resizable progress indicators, custom tooltips

### planned-vs-actual
- **Doel**: Geplande vs werkelijke datums
- **Features**: Dual date fields, toggleable view, dynamic field mapping
- **Custom Model**: plannedStartDate, plannedEndDate, actualStartDate, actualEndDate

### split-events
- **Doel**: Events gesplitst over non-working time
- **Features**: Automatic splitting, duration calculation across splits

---

## DRAG & DROP

### drag-unplanned-tasks
- **Doel**: Scheduling van unplanned appointments
- **Features**: DragHelper, UnplannedGrid, role matching, availability checking
- **Custom**: Appointment, Doctor, Drag, Schedule, UnplannedGrid classes

### drag-from-grid
- **Doel**: Events slepen van externe grid naar scheduler
- **Features**: Cross-component dragging, event creation

### drag-batches
- **Doel**: Multi-selection batch drag
- **Features**: Select multiple events, maintain relative timing

---

## TIME & CALENDARS

### travel-time
- **Doel**: Event buffer voor travel/setup time
- **Config**: `eventBuffer: { bufferIsUnavailableTime: true }`
- **Features**: LeafletJS map integration, location-based scheduling

### timezone
- **Doel**: Multi-timezone support
- **Features**: Timezone-aware scheduling, DST handling

### non-working-time
- **Doel**: Non-working time periodes (nachten, weekends, holidays)
- **Features**: Visual indicators, weekend highlighting

### event-non-working-time
- **Doel**: Event-specific non-working time overrides

### resource-non-working-time
- **Doel**: Resource-specific availability en working hours

### highlight-event-calendars
- **Doel**: Calendar availability highlighting tijdens event editing

### highlight-resource-calendars
- **Doel**: Resource availability visualisatie

### highlight-time-spans
- **Doel**: Custom time span highlighting (peak hours, maintenance windows)

### weekends
- **Doel**: Weekend-specific handling
- **Features**: Skip weekends in scheduling

### calendar-editor
- **Doel**: Interactive calendar modificatie
- **Features**: Calendar CRUD, working time configuratie

---

## VISUALIZATION

### timeline
- **Doel**: Project timeline bird's-eye view
- **Features**: Synchronized met scheduler, toggle voor timeline inclusion

### embedded-chart
- **Doel**: Analytics charts embedded in scheduler
- **Features**: Real-time updates, multiple chart types

### tree-summary-heatmap
- **Doel**: Hierarchical resource view met utilization heatmap
- **Features**: Tree structure, drill-down, aggregate metrics

---

## PERFORMANCE

### bigdataset
- **Doel**: Handling thousands of events
- **Config**: `stickyEvents: false`, `transitions: false`, `useRawData: true`
- **Features**: 1K/5K/10K presets, async data generation
- **Optimization**: Raw data mode, feature toggling, batch loading

### infinite-scroll-crudmanager
- **Doel**: Lazy loading met server-side pagination
- **Features**: CrudManager backend, lazy data fetching

---

## REAL-WORLD APPLICATIONS

### flight-dispatch
- **Doel**: Aircraft en crew scheduling
- **Features**: Aircraft resources, crew assignment met constraints

### table-booking
- **Doel**: Restaurant table reservation
- **Features**: Table allocation, time slot management

### maps
- **Doel**: Leaflet/Google Maps integration
- **Features**: Address geocoding, route visualization

### maps-ag-grid
- **Doel**: Maps + ag-Grid integration
- **Features**: Dual-grid interface, synchronized selection

### realtime-updates
- **Doel**: Live updates via WebSocket/polling
- **Features**: Server push, conflict resolution

---

## INTEGRATION

### custom-layouts
- **Doel**: Custom scheduler layout configuraties

### grouping
- **Doel**: Resource en event grouping
- **Features**: Collapse/expand, group totals

### inline-data
- **Doel**: Direct data loading zonder server
- **Features**: Immediate rendering, ideal voor demos

### taskeditor
- **Doel**: Advanced task editing dialog
- **Features**: Multi-tab editor, custom fields

### localization
- **Doel**: Multi-language UI support
- **Features**: RTL support, locale-specific formatting

### salesforce
- **Doel**: Salesforce CRM integration

---

## FRAMEWORKS

### frameworks/
- Angular
- React + React Vite + React Remix
- Vue 2, Vue 3, Vue 3 Vite
- Webpack
- ExtJS Modern
- WebComponents

---

## KEY PATTERNS

| Pattern | Voorbeeld |
|---------|-----------|
| Dependency-driven | `fromEvent/toEvent` relaties |
| Constraint-based | MustStartOn, FinishNoLaterThan |
| Effort-based | FixedDuration scheduling mode |
| Calendar-aware | Working hours, non-working time |
| Nested events | Parent-child hierarchies |
| Event buffers | Travel time preamble/postamble |

---

## DATA MODEL

```javascript
// Event
{ id, name, startDate, duration, durationUnit, iconCls, eventColor, cls }

// Dependency
{ id, fromEvent, toEvent, lag, lagUnit }

// Resource
{ id, name, icon }

// Assignment
{ id, event, resource }
```
