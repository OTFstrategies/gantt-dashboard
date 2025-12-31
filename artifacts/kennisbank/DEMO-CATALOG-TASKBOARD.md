# BRYNTUM TASKBOARD DEMO CATALOGUS (42 demos)

## CORE & BASIC

### basic
- **Doel**: Basis 3-kolom Kanban setup
- **Config**: `columnField: 'status'`, `useDomTransition: true`
- **Features**: Column colors, tooltips, resource assignments, header items

### todo-list
- **Doel**: Embedded todo/checklist in cards
- **Config**: Custom `todoList` body item type
- **Features**: Todo counter footer, inline todo management

---

## COLUMNS

### auto-columns
- **Doel**: Dynamisch kolommen genereren uit data
- **Config**: `autoGenerateColumns: true`, `stickyHeaders: true`
- **Features**: Quarter/team/category grouping

### columns
- **Doel**: Basis kolom setup met kleuren
- **Features**: Column drag, resize

### columns-remote
- **Doel**: Remote kolom configuratie laden
- **Features**: Dynamic column loading, header menu

### column-drag
- **Doel**: Kolommen slepen en herschikken
- **Features**: Team icons, event logging

### locked-column
- **Doel**: Kolommen vastzetten (start/end)
- **Config**: `locked: 'end'`
- **Features**: 8 kolommen, 2 swimlanes

### column-header-menu
- **Doel**: Custom context menu in headers
- **Features**: Postpone to next quarter, remove all tasks

### column-toolbars
- **Doel**: Toolbars in kolom headers
- **Config**: `topItems: { addTask: true }`, `bottomItems: { removeAll }`

### column-search
- **Doel**: Full-text zoeken met highlighting
- **Config**: `keyStrokeChangeDelay: 100`, `allowRegExp: true`
- **Features**: Regex patterns, match modes

### column-sort
- **Doel**: Per-kolom sorteren
- **Config**: Custom sorters, priority mapping
- **Features**: Longest name sorter, initial sorter

---

## FILTERING

### filtering
- **Doel**: Multi-level filtering (tasks, columns, swimlanes)
- **Config**: `chainFilters: true`
- **Features**: Filter fields, picker buttons

### column-filtering
- **Doel**: Advanced column filtering
- **Features**: Draggable filter popups

---

## SWIMLANES

### swimlanes
- **Doel**: Swimlane functionaliteit
- **Config**: `swimlaneField: 'prio'`, `swimlaneDrag: true`
- **Features**: 4 priority swimlanes, different tasksPerRow

### swimlanes-content
- **Doel**: Custom swimlane rendering met team members
- **Features**: Team member avatars, member count

---

## DRAG & DROP

### task-drag
- **Doel**: Advanced task dragging met confirmations
- **Features**: `beforeTaskDrop` listener, validation rules
- **Config**: Confirmation dialogs, toast notifications

### simple-task-edit
- **Doel**: Inline editing zonder modal
- **Config**: `simpleTaskEdit: true`
- **Features**: Inline field editors, tags support

---

## TASK EDITING

### task-edit
- **Doel**: Rich task editor met TinyMCE
- **Features**: Rich text editing, custom fields

### task-items
- **Doel**: Verschillende card item types
- **Features**: Progress bar, image display, team icons

### task-menu
- **Doel**: Custom context menu met color picker
- **Features**: 16 kleuren, labels submenu

---

## RESPONSIVE & LAYOUT

### responsive
- **Doel**: Adaptive layout per viewport
- **Config**: Breakpoints: small (≤375), narrow (≤600), medium (≤850), large
- **Features**: Per-state callbacks, feature toggling

### scrolling
- **Doel**: Scroll navigatie
- **Features**: `scrollToIntersection()`, `scrollToTask()`

### zooming
- **Doel**: Card density control
- **Config**: `tasksPerRow: 3`, zoom slider
- **Features**: Dynamic card sizing

---

## DATA LOADING

### bigdataset
- **Doel**: Performance met 5000 tasks
- **Config**: `virtualize: true`, `getTaskHeight: () => 142`
- **Features**: Partial rendering, useRawData

### catch-all-column
- **Doel**: "Other" kolom voor unmatched values
- **Config**: `id: '*'` voor catch-all
- **Features**: Avatar-based headers

### backend-sync
- **Doel**: Server synchronisatie

---

## GROUPING

### group-by
- **Doel**: Dynamic grouping by field
- **Features**: Runtime group switching, icon mapping

---

## INTERNATIONALIZATION

### localization
- **Doel**: Multi-language support
- **Features**: `L()` helper, RTL-aware

### rtl
- **Doel**: Right-to-left support
- **Features**: RTL text direction

---

## STYLING

### custom-theme
- **Doel**: Custom CSS theme

### themes
- **Doel**: Theme switcher
- **Features**: Material3, Stockholm, Svalbard, Visby, High Contrast

---

## ADVANCED

### charts
- **Doel**: Integrated chart visualization
- **Features**: Line/bar charts, activity tracking

### config-panel
- **Doel**: Runtime configuration UI
- **Features**: 14 feature toggles

### undo-redo
- **Doel**: State management
- **Config**: `autoRecord: true`
- **Features**: Transaction tracking

### tooltips
- **Doel**: Custom tooltip templates
- **Features**: XSS protection, deadline formatting

### webcomponents
- **Doel**: Web Components integration
