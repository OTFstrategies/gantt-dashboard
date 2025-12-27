# Bryntum Gantt Reverse Engineering - Level 2 Deep-Dive Index

## Documentation Architecture

This project uses a three-level documentation hierarchy for understanding Bryntum Gantt internals:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LEVEL 1: API Surface                          │
│   What the API exposes - types, configs, methods, events             │
│   Files: BRYNTUM-*.md (per-component API reference)                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LEVEL 2: Deep-Dive Analysis                      │
│   HOW components work together - patterns, flows, integration        │
│   Files: DEEP-DIVE-*.md (this index documents them)                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LEVEL 3: Internals                             │
│   WHY things work - internal architecture, engine details            │
│   Files: INTERNALS-*.md                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Level 2 Deep-Dive Documents

### 1. [DEEP-DIVE-DATA-FLOW.md](./DEEP-DIVE-DATA-FLOW.md)
**Focus:** How data moves through Bryntum Gantt

| Topic | Description |
|-------|-------------|
| ProjectModel | Central data container |
| Store hierarchy | TaskStore, DependencyStore, ResourceStore, etc. |
| Data loading | Inline data vs. CrudManager |
| Change tracking | Batching, commit, propagation |
| Relationships | Foreign keys, related collections |

**Cross-references:**
- → [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) for server sync
- → [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for store events
- → [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for Chronograph engine

---

### 2. [DEEP-DIVE-EVENTS.md](./DEEP-DIVE-EVENTS.md)
**Focus:** Event system architecture and patterns

| Topic | Description |
|-------|-------------|
| Event patterns | before/after pairs, bubble-up |
| Listener config | on-prefixed, listeners object, on() method |
| Trigger mechanism | trigger(), suspend/resume |
| Event delegation | Container event handling |
| Common events | Lifecycle, interaction, data events |

**Cross-references:**
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget events
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store events

---

### 3. [DEEP-DIVE-RENDERING.md](./DEEP-DIVE-RENDERING.md)
**Focus:** How Gantt renders tasks and the timeline

| Topic | Description |
|-------|-------------|
| taskRenderer | Custom task bar rendering |
| DomConfig | Virtual DOM-like structure |
| CSS classes | Dynamic class management |
| Refresh strategies | Full vs. incremental |
| Row rendering | Virtual scrolling, row height |

**Cross-references:**
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget rendering
- → [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for date-to-pixel mapping

---

### 4. [DEEP-DIVE-CRUDMANAGER.md](./DEEP-DIVE-CRUDMANAGER.md)
**Focus:** Server synchronization and data persistence

| Topic | Description |
|-------|-------------|
| Load/Sync URLs | Configuration patterns |
| Request/Response format | JSON structure |
| Phantom records | Handling new records |
| Error handling | Sync failures, rollback |
| Transport customization | Headers, transformers |

**Cross-references:**
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store integration
- → [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for sync events

---

### 5. [DEEP-DIVE-DEPENDENCIES.md](./DEEP-DIVE-DEPENDENCIES.md)
**Focus:** Task dependencies and critical path

| Topic | Description |
|-------|-------------|
| Dependency types | FS, SS, FF, SF |
| Lag configuration | Positive and negative |
| Validation | Cycle detection |
| Visual rendering | Lines, arrows |
| Editing | Drag creation, terminals |

**Cross-references:**
- → [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for scheduling impact
- → [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for dependency lines

---

### 6. [DEEP-DIVE-WIDGETS.md](./DEEP-DIVE-WIDGETS.md)
**Focus:** Widget system and UI components

| Topic | Description |
|-------|-------------|
| Widget hierarchy | Base → Container → Panel |
| Common widgets | Button, TextField, Combo, etc. |
| Toolbar configuration | tbar, bbar, items |
| Menu system | Context menus, submenus |
| Custom widgets | Extension patterns |

**Cross-references:**
- → [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for widget events
- → [DEEP-DIVE-KEYBOARD-A11Y](./DEEP-DIVE-KEYBOARD-A11Y.md) for widget accessibility

---

### 7. [DEEP-DIVE-KEYBOARD-A11Y.md](./DEEP-DIVE-KEYBOARD-A11Y.md)
**Focus:** Keyboard navigation and accessibility

| Topic | Description |
|-------|-------------|
| KeyMap | Custom keyboard shortcuts |
| Focus management | focusIn/focusOut, trap |
| ARIA attributes | Labels, roles |
| Theme support | Dark mode, high contrast |
| Screen readers | Announcements |

**Cross-references:**
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget ARIA
- → [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for focus styling

---

### 8. [DEEP-DIVE-SCHEDULING.md](./DEEP-DIVE-SCHEDULING.md)
**Focus:** Scheduling engine and constraint resolution

| Topic | Description |
|-------|-------------|
| ProjectModel scheduling | Forward/Backward direction |
| Scheduling modes | Normal, FixedDuration, FixedEffort, FixedUnits |
| Constraints | MustStartOn, SNET, FNET, etc. |
| Calendars | Working time, holidays |
| Critical path | Slack calculation |
| Baselines | Progress comparison |

**Cross-references:**
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for commitAsync()
- → [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) for dependency scheduling

---

### 9. [DEEP-DIVE-REACT-INTEGRATION.md](./DEEP-DIVE-REACT-INTEGRATION.md)
**Focus:** React/Next.js integration patterns

| Topic | Description |
|-------|-------------|
| Wrapper architecture | BryntumGantt, BryntumGanttProjectModel |
| Props en configuratie | Config files, dynamic updates |
| Refs en instance access | useRef pattern, instance methods |
| Event handling | onEventName props, event callbacks |
| Data binding | Redux, RTK Query, Zustand |
| JSX in cells | React Portals, custom renderers |
| Next.js patterns | Dynamic import, SSR handling |
| TypeScript | Typed refs, event handlers |

**Cross-references:**
- → [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for event handling
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for data binding
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for custom components

---

### 10. [DEEP-DIVE-DEMO-PATTERNS.md](./DEEP-DIVE-DEMO-PATTERNS.md)
**Focus:** Patterns extracted from 80+ official demos

| Topic | Description |
|-------|-------------|
| Custom TaskModel | Extra fields, computed properties |
| TaskEditor customization | Tabs, widgets, rich text |
| Custom columns | Template, aggregation, assignment |
| Widget registration | Factory pattern, initClass() |
| Toolbar patterns | Filters, toggles, buttons |
| State persistence | localStorage, backend state |
| Multi-component | Gantt + TaskBoard, Histogram |
| Data loading | Auto, manual, lazy loading |

**Cross-references:**
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget details
- → [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for renderers
- → [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) for React patterns

---

### 11. [DEEP-DIVE-THEMING.md](./DEEP-DIVE-THEMING.md)
**Focus:** CSS variabelen, thema's en styling patronen

| Topic | Description |
|-------|-------------|
| Beschikbare thema's | Stockholm, Material3, Svalbard, Visby, Fluent2 |
| CSS variabelen | --b-primary, --b-neutral-*, color shades |
| Thema switching | DomHelper.setTheme(), runtime changes |
| Custom thema's | Extend bestaand, volledige override |
| Dark mode | Automatische detectie, toggle pattern |
| Component styling | Task bars, dependencies, timeline |
| Responsive design | Breakpoints, media queries |

**Cross-references:**
- → [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for DomConfig classes
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget styling
- → [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) for DomSync

---

### 12. [DEEP-DIVE-EDGE-CASES.md](./DEEP-DIVE-EDGE-CASES.md)
**Focus:** Veelvoorkomende valkuilen en best practices

| Topic | Description |
|-------|-------------|
| Data binding gotchas | Redux immutability, state updates |
| Scheduling conflicts | Constraint conflicts, cycles |
| Performance valkuilen | Unbatched updates, re-renders |
| React/Next.js specifiek | SSR errors, hydration, StrictMode |
| Store gotchas | ID conflicts, phantom records |
| Feature interacties | TaskEdit vs CellEdit, Undo/Redo |
| Browser quirks | Safari, Firefox, Chrome DevTools |
| Memory leaks | Event listeners, closure references |
| Common errors | Error messages en oplossingen |

**Cross-references:**
- → [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) for React patterns
- → [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for constraint conflicts
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store operations

---

### 13. [DEEP-DIVE-TESTING.md](./DEEP-DIVE-TESTING.md)
**Focus:** Test setup en patronen voor Bryntum Gantt

| Topic | Description |
|-------|-------------|
| Jest setup | Babel config, ESM transpilation |
| Unit testing | Store tests, model tests |
| Integration testing | Gantt instance tests |
| E2E patterns | Selenium, Cypress, Playwright |
| Mocking | Date mocks, store mocks |
| Angular testing | Jasmine/Karma setup |
| CI/CD | GitHub Actions, timeout handling |

**Cross-references:**
- → [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) for React test patterns
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store testing
- → [DEEP-DIVE-EDGE-CASES](./DEEP-DIVE-EDGE-CASES.md) for common test issues

---

### 14. [DEEP-DIVE-LOCALIZATION.md](./DEEP-DIVE-LOCALIZATION.md)
**Focus:** Internationalisatie en vertalingen

| Topic | Description |
|-------|-------------|
| Beschikbare locales | 45+ talen, Nederlands, Duits, etc. |
| Locale laden | Import, script tag, dynamic import |
| LocaleManager API | locale switching, events |
| Locale structuur | Component vertalingen, DateHelper |
| Custom vertalingen | Uitbreiden, overschrijven |
| Runtime switching | Locale picker, persistence |
| React integratie | Provider pattern, useLocale hook |
| Date/time formatting | Lokale formaten, duration |

**Cross-references:**
- → [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) for React locale patterns
- → [DEEP-DIVE-THEMING](./DEEP-DIVE-THEMING.md) for theme + locale switching
- → [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget localization

---

## Level 3 Internals Documents

### [INTERNALS-SOURCE-CODE.md](./INTERNALS-SOURCE-CODE.md)
**Focus:** Interne architectuur en implementatiedetails

| Topic | Description |
|-------|-------------|
| Class hiërarchie | Base → Widget → Container → Grid → Gantt |
| Mixin systeem | Delayable, Factoryable, Localizable |
| Configurable pattern | change/update lifecycle, lazy config |
| DomSync engine | Virtual DOM-like rendering |
| Chronograph engine | Reactive scheduling, computation graph |
| Feature plugins | Plugin registratie, lifecycle, hooks |
| Store internals | Record lifecycle, change tracking |
| Event system | Trigger flow, delegation, priority |
| Widget factory | Type registration, lazy creation |
| Performance patterns | Batching, virtualization, buffering |

**Cross-references:**
- → [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for DomSync usage
- → [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for Chronograph
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store patterns

---

## Quick Reference: Common Tasks

### Task: "I want to customize how tasks look"
1. Start with [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) - taskRenderer section
2. Cross-reference [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for date calculations

### Task: "I need to sync data with my server"
1. Start with [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md)
2. Cross-reference [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store structure
3. Cross-reference [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for sync events

### Task: "I want to add custom keyboard shortcuts"
1. Start with [DEEP-DIVE-KEYBOARD-A11Y](./DEEP-DIVE-KEYBOARD-A11Y.md) - KeyMap section
2. Cross-reference [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for action handling

### Task: "I need to understand why tasks schedule the way they do"
1. Start with [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) - constraints, direction
2. Cross-reference [DEEP-DIVE-DEPENDENCIES](./DEEP-DIVE-DEPENDENCIES.md) for dependency impact

### Task: "I want to create custom toolbar buttons"
1. Start with [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) - Toolbar section
2. Cross-reference [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for button events

### Task: "I need to track project baselines"
1. Start with [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) - Baselines section
2. Cross-reference [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for baseline visualization

### Task: "I want to integrate Gantt in my React/Next.js app"
1. Start with [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) - Complete guide
2. Cross-reference [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) for real-world examples
3. Cross-reference [DEEP-DIVE-EVENTS](./DEEP-DIVE-EVENTS.md) for event handling

### Task: "I need to create custom TaskEditor tabs"
1. Start with [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) - TaskEditor section
2. Cross-reference [DEEP-DIVE-WIDGETS](./DEEP-DIVE-WIDGETS.md) for widget registration

### Task: "I want to use Redux for state management"
1. Start with [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) - State Management section
2. Cross-reference [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for data patterns

### Task: "I need to render JSX in Gantt cells"
1. Start with [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) - JSX Rendering section
2. Cross-reference [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for DomConfig

### Task: "I want to extend TaskModel with custom fields"
1. Start with [DEEP-DIVE-DEMO-PATTERNS](./DEEP-DIVE-DEMO-PATTERNS.md) - Custom TaskModel section
2. Cross-reference [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store integration

### Task: "I want to customize the theme or add dark mode"
1. Start with [DEEP-DIVE-THEMING](./DEEP-DIVE-THEMING.md) - Complete theming guide
2. Cross-reference [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) for DomSync CSS

### Task: "I want to add multi-language support"
1. Start with [DEEP-DIVE-LOCALIZATION](./DEEP-DIVE-LOCALIZATION.md) - i18n setup
2. Cross-reference [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) for React locale provider

### Task: "I'm running into strange bugs or errors"
1. Start with [DEEP-DIVE-EDGE-CASES](./DEEP-DIVE-EDGE-CASES.md) - Common errors section
2. Cross-reference [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store issues

### Task: "I want to write unit tests for my Gantt"
1. Start with [DEEP-DIVE-TESTING](./DEEP-DIVE-TESTING.md) - Jest setup
2. Cross-reference [DEEP-DIVE-EDGE-CASES](./DEEP-DIVE-EDGE-CASES.md) for test pitfalls

### Task: "I want to understand how Bryntum works internally"
1. Start with [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) - Architecture overview
2. Cross-reference [DEEP-DIVE-RENDERING](./DEEP-DIVE-RENDERING.md) for DomSync
3. Cross-reference [DEEP-DIVE-SCHEDULING](./DEEP-DIVE-SCHEDULING.md) for Chronograph

---

## Document Conventions

### Code Examples
All code examples use TypeScript and assume the following imports:
```typescript
import {
    Gantt, GanttConfig,
    ProjectModel, ProjectModelConfig,
    TaskModel, TaskModelConfig,
    // ... other imports as needed
} from '@bryntum/gantt';
```

### Interface References
When a document references a TypeScript interface, it links to the related Level 1 API document or the official Bryntum docs.

### Pattern Indicators
- ✅ **Recommended** - Best practice pattern
- ⚠️ **Caution** - Has trade-offs or limitations
- ❌ **Avoid** - Anti-pattern or deprecated

---

## Reference Documents

### [CLASS-INVENTORY.md](./CLASS-INVENTORY.md)
**Focus:** Complete catalogus van alle 674 geëxporteerde classes

| Categorie | Aantal |
|-----------|--------|
| Core / Base | 25 |
| Data / Models | 65 |
| Data / Stores | 45 |
| Widgets / UI | 120 |
| Features / Plugins | 150 |
| Columns | 85 |
| Mixins | 60 |
| **Totaal** | **674** |

**Cross-references:**
- → [INTERNALS-SOURCE-CODE](./INTERNALS-SOURCE-CODE.md) for class hierarchy
- → Alle DEEP-DIVE-* documenten voor specifieke class categorieën

---

### [DEEP-DIVE-CRITICAL-FEATURES.md](./DEEP-DIVE-CRITICAL-FEATURES.md)
**Focus:** Geavanceerde features die essentieel zijn voor enterprise apps

| Feature | Beschrijving |
|---------|--------------|
| MS Project Import/Export | MPXJ library integratie |
| Resource Histogram | Time-phased resource visualisatie |
| Resource Utilization | Effort/cost tracking |
| Real-time WebSocket | Live synchronisatie |
| Versions & Revisions | STM-based version control |
| PDF Export | Multi-page PDF generatie |
| Excel Export | XLS/XLSX/CSV export |
| AI Integration | OpenAI/Anthropic/Google plugins |

**Cross-references:**
- → [DEEP-DIVE-CRUDMANAGER](./DEEP-DIVE-CRUDMANAGER.md) for sync patterns
- → [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) for store integration

---

### [OFFICIAL-GUIDES-SUMMARY.md](./OFFICIAL-GUIDES-SUMMARY.md)
**Focus:** Samenvatting van 89 officiële Bryntum Gantt guides

| Categorie | Onderwerpen |
|-----------|-------------|
| Basics | Calendars, events, features, sizing |
| Data | CrudManager, stores, project data, time-phased |
| Customization | Styling, TaskEdit, localization |
| Integration | React, Vue, Angular, WebSocket, backends |
| Revisions | Real-time sync, protocol, queue |
| Migration | From ExtJS, DHTMLX, Syncfusion |

**Cross-references:**
- → Linkt naar alle relevante DEEP-DIVE documenten
- → Bevat key patterns uit officiële documentatie

---

## Version Information

| Item | Value |
|------|-------|
| Bryntum Gantt Version | 7.1.0 |
| Documentation Date | December 2024 |
| Source | TypeScript definitions + demo analysis |
| Total Classes Documented | 674 |
| Total Features Documented | 63+ |

---

*This index is part of the Bryntum Gantt reverse engineering project for building a custom Gantt dashboard.*
