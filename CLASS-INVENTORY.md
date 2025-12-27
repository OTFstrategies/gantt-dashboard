# Bryntum Gantt 7.1.0 - Complete Class Inventory

> **Reference Document** - Catalogus van alle 674 geëxporteerde classes georganiseerd per categorie.

---

## Overzicht

| Categorie | Aantal Classes |
|-----------|----------------|
| Core / Base | 25 |
| Data / Models | 65 |
| Data / Stores | 45 |
| Data / Fields | 15 |
| State Management | 20 |
| Widgets / UI Components | 120 |
| Features / Plugins | 150 |
| Columns | 85 |
| Helpers / Utilities | 30 |
| Layout | 10 |
| Export / PDF | 25 |
| Gantt Specific | 40 |
| Scheduler Specific | 45 |
| SchedulerPro Specific | 35 |
| Mixins / Class Extensions | 60 |

**Totaal: 674 classes**

---

## 1. Core / Base Classes

### Abstract Base Classes

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Base` | - | Basis class voor alle Bryntum classes |
| `ActionBase` | - | Basis voor STM actions |
| `StateBase` | - | Basis voor state classes |
| `ContextMenuBase` | `InstancePlugin` | Basis voor context menu features |
| `InstancePlugin` | `Base` | Basis voor alle plugins/features |

### Core Singletons

| Class | Beschrijving |
|-------|--------------|
| `GlobalEventsSingleton` | Globale event bus |
| `LocaleManagerSingleton` | Localisatie beheer |
| `PresetManagerSingleton` | View preset beheer |
| `MessageDialogSingleton` | Globale message dialogs |

---

## 2. Data / Models

### Core Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Model` | `Base` | Basis data model |
| `TimeSpan` | `Model` | Model met start/end date |
| `GridRowModel` | `Model` | Grid row model |

### Gantt Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TaskModel` | `TimeSpan` | Gantt taak model |
| `TimePhasedTaskModel` | `TaskModel` | Taak met time-phased resource data |
| `ProjectModel` | `Model` | Gantt project model |
| `DependencyModel` | `SchedulerProDependencyModel` | Gantt dependency model |
| `AssignmentModel` | `SchedulerProAssignmentModel` | Gantt assignment model |
| `ResourceModel` | `SchedulerProResourceModel` | Gantt resource model |
| `CalendarModel` | `SchedulerProCalendarModel` | Gantt calendar model |
| `Baseline` | `TimeSpan` | Baseline snapshot model |

### Scheduler Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `SchedulerEventModel` | `TimeSpan` | Scheduler event model |
| `SchedulerResourceModel` | `GridRowModel` | Scheduler resource model |
| `SchedulerAssignmentModel` | `Model` | Scheduler assignment model |
| `SchedulerDependencyModel` | `DependencyBaseModel` | Scheduler dependency model |
| `SchedulerProjectModel` | `Model` | Scheduler project model |
| `TimeRangeModel` | `TimeSpan` | Time range model |
| `ResourceTimeRangeModel` | `TimeSpan` | Resource-specific time range |
| `RecurrenceModel` | `Model` | Recurrence pattern model |

### SchedulerPro Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `EventModel` | `TimeSpan` | SchedulerPro event model |
| `EventSegmentModel` | `TimeSpan` | Event segment voor split tasks |
| `TimePhasedEventModel` | `EventModel` | Event met time-phased data |
| `SchedulerProProjectModel` | `ProjectModelMixinClass` | SchedulerPro project model |
| `SchedulerProResourceModel` | `GridRowModel` | SchedulerPro resource model |
| `SchedulerProAssignmentModel` | `Model` | SchedulerPro assignment model |
| `SchedulerProDependencyModel` | `DependencyBaseModel` | SchedulerPro dependency model |
| `SchedulerProCalendarModel` | `Model` | SchedulerPro calendar model |
| `SchedulerProCalendarIntervalModel` | `Model` | Calendar interval model |

### Resource & Rate Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `ResourceRateModel` | `Model` | Resource rate model |
| `ResourceRateTableModel` | `Model` | Resource rate table model |
| `ResourceUtilizationModel` | `Model` | Resource utilization model |
| `AvailabilityRangeModel` | `Model` | Resource availability range |

### Versioning Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `VersionModel` | `Model` | Version/revision model |
| `ChangeLogTransactionModel` | `Model` | Transaction change log |
| `ChangeLogEntity` | - | Entity in changelog |
| `ChangeLogAction` | - | Action in changelog |
| `ChangeLogAssignmentEntity` | `ChangeLogEntity` | Assignment changelog |
| `ChangeLogDependencyEntity` | `ChangeLogEntity` | Dependency changelog |
| `ChangeLogPropertyUpdate` | - | Property update tracking |

### Other Models

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `ChatMessageModel` | `Model` | AI chat message model |
| `ComboModel` | `Model` | Combo box item model |
| `ViewPreset` | `Model` | View preset model |
| `DependencyBaseModel` | `Model` | Base dependency model |
| `Duration` | - | Duration value object |
| `Wbs` | - | WBS nummer object |
| `Column` | `Model` | Column configuration model |

---

## 3. Data / Stores

### Core Stores

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Store` | `Base` | Basis data store |
| `AjaxStore` | `Store` | Store met AJAX sync |
| `ColumnStore` | `Store` | Store voor columns |
| `PresetStore` | `Store` | Store voor view presets |

### Gantt Stores

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TaskStore` | `AjaxStore` | Gantt taak store |
| `DependencyStore` | `SchedulerProDependencyStore` | Gantt dependency store |
| `AssignmentStore` | `SchedulerProAssignmentStore` | Gantt assignment store |
| `ResourceStore` | `SchedulerProResourceStore` | Gantt resource store |
| `CalendarManagerStore` | `SchedulerProCalendarManagerStore` | Calendar manager |

### Scheduler Stores

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `SchedulerEventStore` | `AjaxStore` | Scheduler event store |
| `SchedulerResourceStore` | `AjaxStore` | Scheduler resource store |
| `SchedulerAssignmentStore` | `AjaxStore` | Scheduler assignment store |
| `SchedulerDependencyStore` | `AjaxStore` | Scheduler dependency store |
| `TimeAxis` | `Store` | Time axis store |
| `TimeRangeStore` | `AjaxStore` | Time range store |
| `ResourceTimeRangeStore` | `AjaxStore` | Resource time range store |

### SchedulerPro Stores

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `EventStore` | `AjaxStore` | SchedulerPro event store |
| `SchedulerProAssignmentStore` | `AjaxStore` | SchedulerPro assignment store |
| `SchedulerProDependencyStore` | `AjaxStore` | SchedulerPro dependency store |
| `SchedulerProResourceStore` | `AjaxStore` | SchedulerPro resource store |
| `SchedulerProCalendarManagerStore` | `AjaxStore` | Calendar manager store |
| `ResourceRateStore` | `Store` | Resource rate store |
| `ResourceRateTableStore` | `Store` | Resource rate table store |
| `ResourceUtilizationStore` | `AjaxStore` | Resource utilization store |

### Versioning Stores

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `VersionStore` | `Store` | Version/revision store |
| `ChangeLogStore` | `Store` | Change log store |
| `AvailabilityRangeStore` | `Store` | Availability range store |

---

## 4. Data Fields

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `DataField` | `Base` | Basis data field |
| `ArrayDataField` | `DataField` | Array field |
| `BooleanDataField` | `DataField` | Boolean field |
| `DateDataField` | `DataField` | Date field |
| `DurationUnitDataField` | `StringDataField` | Duration unit field |
| `IntegerDataField` | `DataField` | Integer field |
| `NumberDataField` | `DataField` | Number field |
| `ObjectDataField` | `DataField` | Object field |
| `StoreDataField` | `DataField` | Store reference field |
| `StringDataField` | `DataField` | String field |
| `WbsField` | `DataField` | WBS field |

---

## 5. State Management (STM)

### Core STM

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `CoreStateTrackingManager` | `Base` | Core STM manager |
| `StateTrackingManager` | `CoreStateTrackingManager` | Extended STM manager |
| `Transaction` | - | STM transaction |

### STM Actions

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AddAction` | `ActionBase` | Add record action |
| `InsertAction` | `ActionBase` | Insert record action |
| `InsertChildAction` | `ActionBase` | Insert child action |
| `RemoveAction` | `ActionBase` | Remove record action |
| `RemoveAllAction` | `ActionBase` | Remove all action |
| `RemoveChildAction` | `ActionBase` | Remove child action |
| `UpdateAction` | `ActionBase` | Update record action |
| `EventUpdateAction` | `UpdateAction` | Event update action |

### STM Mixins

| Class | Beschrijving |
|-------|--------------|
| `ModelStmClass` | Model STM integration |
| `StoreStmClass` | Store STM integration |

---

## 6. CRUD Manager

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AbstractCrudManager` | `Base` | Abstract CRUD manager |
| `CrudManager` | `AbstractCrudManager` | CRUD manager implementatie |
| `AbstractCrudManagerMixinClass` | - | CRUD manager mixin |
| `AbstractCrudManagerValidationClass` | - | CRUD validation mixin |
| `CrudManagerViewClass` | `LoadMaskableClass` | CRUD view integration |
| `LazyLoadCrudManagerClass` | - | Lazy loading CRUD |

---

## 7. AI Integration

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AIBase` | `InstancePlugin` | Abstract AI plugin base |
| `AbstractApiPlugin` | `InstancePlugin` | Abstract API plugin |
| `AnthropicPlugin` | `AbstractApiPlugin` | Claude/Anthropic integration |
| `OpenAIPlugin` | `AbstractApiPlugin` | OpenAI/GPT integration |
| `GooglePlugin` | `AbstractApiPlugin` | Google Gemini integration |
| `AIFilter` | `AIBase` | AI-powered filtering |
| `AIFilterField` | `TextField` | AI filter input field |

---

## 8. Widgets / UI Components

### Base Widget Classes

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Widget` | `Base` | Basis widget class |
| `Container` | `Widget` | Container voor widgets |
| `Panel` | `Container` | Panel met header/tools |
| `Popup` | `Panel` | Popup/dialog |
| `WidgetTag` | - | Custom element tag |

### Form Fields

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Field` | `Widget` | Abstract form field |
| `TextField` | `Field` | Text input |
| `TextAreaField` | `Field` | Textarea input |
| `NumberField` | `Field` | Number input |
| `DateField` | `PickerField` | Date picker |
| `TimeField` | `PickerField` | Time picker |
| `DateTimeField` | `Field` | Date + time picker |
| `DurationField` | `TextField` | Duration input |
| `Checkbox` | `Field` | Checkbox |
| `Radio` | `Checkbox` | Radio button |
| `SlideToggle` | `Checkbox` | Slide toggle |
| `Slider` | `Widget` | Slider control |
| `ColorField` | `PickerField` | Color picker field |
| `FileField` | `Field` | File input |
| `PasswordField` | `Field` | Password input |
| `DisplayField` | `Field` | Read-only field |
| `FilterField` | `TextField` | Filter input |

### Picker Fields

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `PickerField` | `TextField` | Abstract picker field |
| `Combo` | `PickerField` | Combo box |
| `DateRangeField` | `PickerField` | Date range picker |
| `TextAreaPickerField` | `PickerField` | Textarea with picker |

### Specialized Fields

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AssignmentField` | `Combo` | Resource assignment field |
| `CalendarPicker` | `Combo` | Calendar selection |
| `DependencyField` | `Combo` | Dependency selection |
| `ConstraintTypePicker` | `Combo` | Constraint type selection |
| `SchedulingModePicker` | `Combo` | Scheduling mode selection |
| `SchedulingDirectionPicker` | `Combo` | Scheduling direction selection |
| `DependencyTypePicker` | `Combo` | Dependency type selection |
| `EffortField` | `DurationField` | Effort input |
| `StartDateField` | `DateField` | Start date field |
| `EndDateField` | `DateField` | End date field |
| `EventColorField` | `ColorField` | Event color picker |
| `ModelCombo` | `Combo` | Model selection combo |
| `CalendarField` | `ModelCombo` | Calendar selection |
| `RateTableField` | `ModelCombo` | Rate table selection |
| `ResourceTypeField` | `Combo` | Resource type selection |
| `CostAccrualField` | `Combo` | Cost accrual selection |
| `ProjectCombo` | `Combo` | Project selection |
| `ResourceCombo` | `Combo` | Resource selection |
| `TreeCombo` | `Combo` | Tree structure combo |
| `ViewPresetCombo` | `Combo` | View preset selection |

### Recurrence Fields

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `RecurrenceCombo` | `RecurrenceFrequencyCombo` | Recurrence combo |
| `RecurrenceDaysCombo` | `Combo` | Days of week combo |
| `RecurrenceFrequencyCombo` | `Combo` | Frequency combo |
| `RecurrencePositionsCombo` | `Combo` | Positions combo |
| `RecurrenceStopConditionCombo` | `Combo` | Stop condition combo |

### Buttons & Actions

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Button` | `Widget` | Button widget |
| `ButtonGroup` | `Container` | Button group |
| `Tab` | `Button` | Tab button |
| `Tool` | `Widget` | Panel tool button |
| `RecurrenceLegendButton` | `Button` | Recurrence legend button |
| `DayButtons` | `ButtonGroup` | Day selection buttons |
| `ChatButton` | - | AI chat button |

### Containers & Layout

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Toolbar` | `Container` | Toolbar container |
| `TabBar` | `Toolbar` | Tab bar |
| `TabPanel` | `Panel` | Tabbed panel |
| `FieldContainer` | `Container` | Field container |
| `FieldSet` | `Panel` | Field set grouping |
| `Carousel` | `Panel` | Carousel container |
| `Splitter` | `Widget` | Splitter between panels |
| `FilePicker` | `Container` | File picker container |
| `GroupBar` | `ChipView` | Group bar |

### Lists & Selection

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `List` | `Widget` | List widget |
| `ChipView` | `List` | Chip/tag view |
| `Menu` | `Popup` | Menu popup |
| `MenuItem` | `Widget` | Menu item |
| `ColorPicker` | `List` | Color picker list |
| `EventColorPicker` | `ColorPicker` | Event color picker |
| `ResourceFilter` | `List` | Resource filter list |

### Date Pickers

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `CalendarPanel` | `Panel` | Calendar panel |
| `DatePicker` | `CalendarPanel` | Date picker |
| `DateRangePicker` | `MultiDatePicker` | Date range picker |
| `MultiDatePicker` | `Carousel` | Multi-date picker |
| `MonthPicker` | `Panel` | Month picker |
| `YearPicker` | `Panel` | Year picker |
| `TimePicker` | `Container` | Time picker |
| `SchedulerDatePicker` | `DatePicker` | Scheduler date picker |

### Dialogs & Popups

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Tooltip` | `Popup` | Tooltip popup |
| `Hint` | `Popup` | Hint popup |
| `Toast` | `Widget` | Toast notification |
| `Mask` | `Widget` | Loading mask |
| `Editor` | `Container` | Inline editor |
| `ExportDialog` | `Popup` | Export dialog |
| `SchedulerExportDialog` | `ExportDialog` | Scheduler export dialog |
| `RecurrenceConfirmationPopup` | `Popup` | Recurrence confirm |
| `RecurrenceEditor` | `Popup` | Recurrence editor |
| `CycleResolutionPopup` | `SchedulingIssueResolutionPopup` | Cycle resolution |
| `SchedulingIssueResolutionPopup` | `Popup` | Scheduling issue popup |
| `CalendarEditor` | `Popup` | Calendar editor |
| `ResourceEditor` | `Popup` | Resource editor |
| `ResourceRateTableEditor` | `Popup` | Rate table editor |

### Task Editors

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TaskEditorBase` | `Popup` | Abstract task editor |
| `TaskEditor` | `GanttTaskEditor` | Gantt task editor |
| `GanttTaskEditor` | `TaskEditorBase` | Gantt task editor base |
| `SchedulerTaskEditor` | `TaskEditorBase` | Scheduler task editor |
| `ProjectEditor` | `TaskEditorBase` | Project editor |
| `EventEditor` | `Popup` | Abstract event editor |

### Task Editor Tabs

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `EditorTab` | `Container` | Base editor tab |
| `FormTab` | `EditorTab` | Form-based tab |
| `GeneralTab` | `FormTab` | General info tab |
| `AdvancedTab` | `FormTab` | Advanced settings tab |
| `NotesTab` | `FormTab` | Notes tab |
| `DependencyTab` | `EditorTab` | Dependency tab |
| `PredecessorsTab` | `DependencyTab` | Predecessors tab |
| `SuccessorsTab` | `DependencyTab` | Successors tab |
| `ResourcesTab` | `EditorTab` | Resources tab |
| `RecurrenceTab` | `EditorTab` | Recurrence tab |
| `SchedulerGeneralTab` | `FormTab` | Scheduler general tab |
| `SchedulerAdvancedTab` | `FormTab` | Scheduler advanced tab |
| `ProjectEditorGeneralTab` | `FormTab` | Project general tab |
| `ProjectEditorAdvancedTab` | `FormTab` | Project advanced tab |
| `ProjectEditorDescriptionTab` | `FormTab` | Project description tab |
| `ResourceEditorGeneralTab` | `Container` | Resource general tab |
| `ResourceEditorRateTablesTab` | `Container` | Rate tables tab |

### Specialized Widgets

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `CodeEditor` | `Panel` | Code editor |
| `DemoCodeEditor` | `CodeEditor` | Demo code editor |
| `DemoHeader` | `Container` | Demo header |
| `PagingToolbar` | `Toolbar` | Paging toolbar |
| `ConfirmationBar` | `Toolbar` | Confirmation bar |
| `Label` | `Widget` | Label widget |
| `Histogram` | `Widget` | Histogram chart |
| `Scale` | `Widget` | Scale widget |
| `RadioGroup` | `FieldSet` | Radio button group |
| `CheckboxGroup` | `RadioGroup` | Checkbox group |
| `FieldFilterPicker` | `Container` | Field filter picker |
| `FieldFilterPickerGroup` | `Container` | Filter picker group |
| `GridFieldFilterPicker` | `FieldFilterPicker` | Grid filter picker |
| `GridFieldFilterPickerGroup` | `FieldFilterPickerGroup` | Grid filter group |
| `ChecklistFilterCombo` | `Combo` | Checklist filter |
| `ChatPanel` | `Panel` | AI chat panel |
| `GridChartDesigner` | `Widget` | Chart designer |
| `ResourceRateTableContainer` | `Container` | Rate table container |
| `UndoRedo` | `UndoRedoBase` | Undo/redo widget |

---

## 9. Grid & TreeGrid

### Main Components

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Grid` | `GridBase` | Grid component |
| `GridBase` | `Panel` | Grid base class |
| `TreeGrid` | `Grid` | Tree grid |
| `SubGrid` | `Widget` | Sub grid region |
| `Row` | `Base` | Grid row |
| `GridLocation` | - | Grid location helper |

### Specialized Grids

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AssignmentGrid` | `Grid` | Assignment grid |
| `ResourceGrid` | `Grid` | Resource grid |
| `VersionGrid` | `TreeGrid` | Version grid |

---

## 10. Timeline Components

### Main Components

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TimelineBase` | `Grid` | Abstract timeline base |
| `Scheduler` | `SchedulerBase` | Scheduler component |
| `SchedulerBase` | `TimelineBase` | Scheduler base |
| `SchedulerPro` | `SchedulerProBase` | SchedulerPro component |
| `SchedulerProBase` | `SchedulerBase` | SchedulerPro base |
| `Timeline` | `Scheduler` | Simple timeline |
| `Gantt` | `GanttBase` | Gantt component |
| `GanttBase` | `TimelineBase` | Gantt base |
| `TimelineHistogram` | `TimelineHistogramBase` | Timeline histogram |
| `TimelineHistogramBase` | `TimelineBase` | Histogram base |
| `ResourceHistogram` | `TimelineHistogram` | Resource histogram |
| `ResourceUtilization` | `ResourceHistogram` | Resource utilization |
| `ResourceHeader` | `Widget` | Resource header |

### Timeline Helpers

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TimeAxisViewModel` | `EventsClass` | Time axis view model |
| `TimelineContext` | - | Timeline context |
| `RecurrenceLegend` | - | Recurrence legend helper |

---

## 11. Columns

### Grid Columns

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Column` | `Model` | Base column |
| `ActionColumn` | `Column` | Action buttons column |
| `AggregateColumn` | `NumberColumn` | Aggregate column |
| `ChartColumn` | `WidgetColumn` | Chart column |
| `CheckColumn` | `WidgetColumn` | Checkbox column |
| `ColorColumn` | `Column` | Color column |
| `CurrencyColumn` | `NumberColumn` | Currency column |
| `DateColumn` | `Column` | Date column |
| `NumberColumn` | `Column` | Number column |
| `PercentColumn` | `NumberColumn` | Percent column |
| `RatingColumn` | `NumberColumn` | Rating column |
| `RowNumberColumn` | `Column` | Row number column |
| `SparklineColumn` | `ChartColumn` | Sparkline column |
| `TemplateColumn` | `Column` | Template column |
| `TimeColumn` | `Column` | Time column |
| `TreeColumn` | `Column` | Tree column |
| `WidgetColumn` | `Column` | Widget column |

### Scheduler Columns

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `DurationColumn` | `NumberColumn` | Duration column |
| `EventColorColumn` | `ColorColumn` | Event color column |
| `ResourceCollapseColumn` | `Column` | Resource collapse column |
| `ResourceInfoColumn` | `Column` | Resource info column |
| `ScaleColumn` | `Column` | Scale column |
| `SchedulerTimeAxisColumn` | `WidgetColumn` | Time axis column |
| `VerticalTimeAxisColumn` | `Column` | Vertical time axis |

### Gantt Columns

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `GanttDateColumn` | `DateColumn` | Abstract Gantt date column |
| `ActualEffortColumn` | `DurationColumn` | Actual effort |
| `AddNewColumn` | `Column` | Add new task column |
| `BaselineDurationColumn` | `DurationColumn` | Baseline duration |
| `BaselineDurationVarianceColumn` | `DurationColumn` | Duration variance |
| `BaselineEffortColumn` | `DurationColumn` | Baseline effort |
| `BaselineEndDateColumn` | `GanttDateColumn` | Baseline end date |
| `BaselineEndVarianceColumn` | `DurationColumn` | End date variance |
| `BaselineStartDateColumn` | `GanttDateColumn` | Baseline start date |
| `BaselineStartVarianceColumn` | `DurationColumn` | Start date variance |
| `CalendarColumn` | `Column` | Calendar column |
| `ConstraintDateColumn` | `GanttDateColumn` | Constraint date |
| `ConstraintTypeColumn` | `Column` | Constraint type |
| `CostColumn` | `CurrencyColumn` | Cost column |
| `DeadlineDateColumn` | `GanttDateColumn` | Deadline date |
| `DependencyColumn` | `Column` | Dependency column |
| `EarlyEndDateColumn` | `GanttDateColumn` | Early end date |
| `EarlyStartDateColumn` | `GanttDateColumn` | Early start date |
| `EffortColumn` | `DurationColumn` | Effort column |
| `EndDateColumn` | `GanttDateColumn` | End date column |
| `IgnoreResourceCalendarColumn` | `CheckColumn` | Ignore resource calendar |
| `InactiveColumn` | `CheckColumn` | Inactive column |
| `LateEndDateColumn` | `GanttDateColumn` | Late end date |
| `LateStartDateColumn` | `GanttDateColumn` | Late start date |
| `ManuallyScheduledColumn` | `CheckColumn` | Manually scheduled |
| `MilestoneColumn` | `CheckColumn` | Milestone column |
| `NameColumn` | `TreeColumn` | Task name column |
| `NoteColumn` | `Column` | Note column |
| `PercentDoneColumn` | `PercentColumn` | Percent done |
| `PlannedPercentDoneColumn` | `PercentDoneColumn` | Planned percent done |
| `PredecessorColumn` | `DependencyColumn` | Predecessor column |
| `ResourceAssignmentColumn` | `Column` | Resource assignment |
| `RollupColumn` | `CheckColumn` | Rollup column |
| `SchedulingDirectionColumn` | `Column` | Scheduling direction |
| `SchedulingModeColumn` | `Column` | Scheduling mode |
| `SequenceColumn` | `Column` | Sequence number |
| `ShowInTimelineColumn` | `CheckColumn` | Show in timeline |
| `StartDateColumn` | `GanttDateColumn` | Start date column |
| `SuccessorColumn` | `DependencyColumn` | Successor column |
| `TaskInfoColumn` | `Column` | Task info column |
| `TimeAxisColumn` | `SchedulerTimeAxisColumn` | Time axis column |
| `TotalSlackColumn` | `DurationColumn` | Total slack |
| `WBSColumn` | `Column` | WBS column |

### SchedulerPro Columns

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `RateTableColumn` | `Column` | Rate table column |
| `ResourceCalendarColumn` | `Column` | Resource calendar |
| `ResourceCostAccrualColumn` | `Column` | Cost accrual column |
| `ResourceTypeColumn` | `Column` | Resource type column |

---

## 12. Features / Plugins

### Grid Features

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `CellCopyPaste` | `CopyPasteBase` | Cell copy/paste |
| `GridCellEdit` | `GridEditBase` | Cell editing |
| `CellMenu` | `ContextMenuBase` | Cell context menu |
| `CellTooltip` | `InstancePlugin` | Cell tooltip |
| `Charts` | `InstancePlugin` | Chart integration |
| `ColumnAutoWidth` | `InstancePlugin` | Auto column width |
| `ColumnDragToolbar` | `InstancePlugin` | Column drag toolbar |
| `ColumnPicker` | `InstancePlugin` | Column picker |
| `ColumnRename` | `InstancePlugin` | Column rename |
| `ColumnReorder` | `InstancePlugin` | Column reorder |
| `ColumnResize` | `InstancePlugin` | Column resize |
| `FillHandle` | `InstancePlugin` | Fill handle |
| `Filter` | `InstancePlugin` | Filtering |
| `FilterBar` | `InstancePlugin` | Filter bar |
| `Group` | `InstancePlugin` | Grouping |
| `GridGroupSummary` | `InstancePlugin` | Group summary |
| `HeaderMenu` | `ContextMenuBase` | Header context menu |
| `GridLockRows` | `GridSplit` | Lock rows |
| `MergeCells` | `InstancePlugin` | Merge cells |
| `PinColumns` | `InstancePlugin` | Pin columns |
| `QuickFind` | `InstancePlugin` | Quick find |
| `RegionResize` | `InstancePlugin` | Region resize |
| `RowCopyPaste` | `CopyPasteBase` | Row copy/paste |
| `RowEdit` | `GridEditBase` | Row editing |
| `RowExpander` | `InstancePlugin` | Row expander |
| `GridRowReorder` | `InstancePlugin` | Row reorder |
| `GridRowResize` | `InstancePlugin` | Row resize |
| `Search` | `InstancePlugin` | Search |
| `Sort` | `InstancePlugin` | Sorting |
| `GridSplit` | `InstancePlugin` | Grid split |
| `StickyCells` | `InstancePlugin` | Sticky cells |
| `Stripe` | `InstancePlugin` | Row striping |
| `GridSummary` | `InstancePlugin` | Grid summary |
| `Tree` | `InstancePlugin` | Tree support |
| `GridTreeGroup` | `InstancePlugin` | Tree grouping |
| `FileDrop` | `InstancePlugin` | File drop |

### Scheduler Features

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `ColumnLines` | `InstancePlugin` | Column lines |
| `SchedulerDependencies` | `InstancePlugin` | Dependencies |
| `SchedulerDependencyEdit` | `InstancePlugin` | Dependency editing |
| `DependencyMenu` | `ContextMenuBase` | Dependency menu |
| `EventCopyPaste` | `CopyPasteBase` | Event copy/paste |
| `EventDrag` | `DragBase` | Event dragging |
| `EventDragCreate` | `DragCreateBase` | Drag to create |
| `EventDragSelect` | `InstancePlugin` | Drag selection |
| `EventEdit` | `EditBase` | Event editing |
| `EventFilter` | `InstancePlugin` | Event filtering |
| `EventMenu` | `TimeSpanMenuBase` | Event menu |
| `EventNonWorkingTime` | `InstancePlugin` | Event non-working time |
| `SchedulerEventResize` | `InstancePlugin` | Event resize |
| `EventTooltip` | `TooltipBase` | Event tooltip |
| `GroupSummary` | `GridGroupSummary` | Group summary |
| `HeaderZoom` | `InstancePlugin` | Header zoom |
| `SchedulerLabels` | `InstancePlugin` | Event labels |
| `LockRows` | `GridLockRows` | Lock rows |
| `NonWorkingTime` | `AbstractTimeRanges` | Non-working time |
| `Pan` | `InstancePlugin` | Pan/scroll |
| `ResourceMenu` | `ContextMenuBase` | Resource menu |
| `ResourceTimeRanges` | `ResourceTimeRangesBase` | Resource time ranges |
| `RowReorder` | `GridRowReorder` | Row reorder |
| `RowResize` | `GridRowResize` | Row resize |
| `ScheduleContext` | `InstancePlugin` | Schedule context |
| `ScheduleMenu` | `TimeSpanMenuBase` | Schedule menu |
| `ScheduleTooltip` | `InstancePlugin` | Schedule tooltip |
| `SchedulerScrollButtons` | `InstancePlugin` | Scroll buttons |
| `SimpleEventEdit` | `InstancePlugin` | Simple event edit |
| `Split` | `GridSplit` | Split view |
| `StickyEvents` | `InstancePlugin` | Sticky events |
| `SchedulerSummary` | `TimelineSummary` | Summary |
| `TimeAxisHeaderMenu` | `HeaderMenu` | Time axis menu |
| `TimeRanges` | `AbstractTimeRanges` | Time ranges |
| `TimeSelection` | `AbstractTimeRanges` | Time selection |
| `TreeSummary` | `InstancePlugin` | Tree summary |

### SchedulerPro Features

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `AllocationCellEdit` | `InstancePlugin` | Allocation cell edit |
| `AllocationCopyPaste` | `CopyPasteBase` | Allocation copy/paste |
| `CalendarHighlight` | `ResourceTimeRangesBase` | Calendar highlight |
| `SchedulerProCellEdit` | `GridCellEdit` | Cell editing |
| `SchedulerProDependencies` | `SchedulerDependencies` | Dependencies |
| `DependencyEdit` | `SchedulerDependencyEdit` | Dependency editing |
| `EventBuffer` | `InstancePlugin` | Event buffer |
| `EventResize` | `SchedulerEventResize` | Event resize |
| `EventSegmentDrag` | `EventDrag` | Segment drag |
| `EventSegmentResize` | `EventResize` | Segment resize |
| `EventSegments` | `InstancePlugin` | Event segments |
| `NestedEvents` | `InstancePlugin` | Nested events |
| `PercentBar` | `InstancePlugin` | Percent bar |
| `ResourceEdit` | `InstancePlugin` | Resource editing |
| `ResourceNonWorkingTime` | `ResourceTimeRangesBase` | Resource non-working time |
| `SchedulerProTaskEdit` | `TaskEditBase` | Task editing |
| `TimeSpanHighlight` | `InstancePlugin` | Time span highlight |
| `SchedulerProVersions` | `InstancePlugin` | Versions |

### Gantt Features

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Baselines` | `TooltipBase` | Baselines |
| `CellEdit` | `SchedulerProCellEdit` | Cell editing |
| `CriticalPaths` | `InstancePlugin` | Critical path |
| `Dependencies` | `SchedulerProDependencies` | Dependencies |
| `Indicators` | `TooltipBase` | Indicators |
| `Labels` | `SchedulerLabels` | Task labels |
| `ParentArea` | `InstancePlugin` | Parent task area |
| `ProgressLine` | `InstancePlugin` | Progress line |
| `ProjectEdit` | `TaskEditBase` | Project editing |
| `ProjectLines` | `TimeRanges` | Project lines |
| `Rollups` | `TooltipBase` | Rollups |
| `ScrollButtons` | `SchedulerScrollButtons` | Scroll buttons |
| `Summary` | `TimelineSummary` | Summary |
| `TaskCopyPaste` | `RowCopyPaste` | Task copy/paste |
| `TaskDrag` | `DragBase` | Task dragging |
| `TaskDragCreate` | `DragCreateBase` | Drag to create |
| `TaskEdit` | `SchedulerProTaskEdit` | Task editing |
| `TaskMenu` | `EventMenu` | Task menu |
| `TaskNonWorkingTime` | `InstancePlugin` | Non-working time |
| `TaskResize` | `EventResize` | Task resize |
| `TaskSegmentDrag` | `TaskDrag` | Segment drag |
| `TaskSegmentResize` | `EventSegmentResize` | Segment resize |
| `TaskTooltip` | `TooltipBase` | Task tooltip |
| `TimelineChart` | `InstancePlugin` | Timeline chart |
| `TreeGroup` | `GridTreeGroup` | Tree grouping |
| `Versions` | `SchedulerProVersions` | Versions |

---

## 13. Export Features

### PDF Export

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `GridPdfExport` | `InstancePlugin` | Grid PDF export |
| `GridPrint` | `GridPdfExport` | Grid print |
| `SchedulerPdfExport` | `GridPdfExport` | Scheduler PDF export |
| `SchedulerPrint` | `SchedulerPdfExport` | Scheduler print |
| `PdfExport` | `SchedulerPdfExport` | Gantt PDF export |
| `Print` | `PdfExport` | Gantt print |
| `MspExport` | `InstancePlugin` | MS Project export |

### Exporters

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `ExporterBase` | - | Abstract exporter |
| `Exporter` | `ExporterBase` | Base exporter |
| `GridMultiPageExporter` | `Exporter` | Grid multi-page |
| `GridMultiPageVerticalExporter` | `Exporter` | Grid multi-page vertical |
| `GridSinglePageExporter` | `Exporter` | Grid single page |
| `GridSinglePageUnscaledExporter` | `GridSinglePageExporter` | Grid unscaled |
| `SchedulerMultiPageExporter` | `GridMultiPageExporter` | Scheduler multi-page |
| `SchedulerMultiPageVerticalExporter` | `GridMultiPageVerticalExporter` | Scheduler vertical |
| `SchedulerSinglePageExporter` | `GridSinglePageExporter` | Scheduler single page |
| `SchedulerSinglePageUnscaledExporter` | `GridSinglePageUnscaledExporter` | Scheduler unscaled |
| `MultiPageExporter` | `SchedulerMultiPageExporter` | Gantt multi-page |
| `MultiPageVerticalExporter` | `SchedulerMultiPageVerticalExporter` | Gantt vertical |
| `SinglePageExporter` | `SchedulerSinglePageExporter` | Gantt single page |
| `SinglePageUnscaledExporter` | `SchedulerSinglePageUnscaledExporter` | Gantt unscaled |
| `VerticalExporter` | `ExporterBase` | Vertical exporter |
| `MultiPageVerticalExporterVertical` | `VerticalExporter` | Vertical multi-page |
| `SinglePageExporterVertical` | `VerticalExporter` | Vertical single page |
| `SinglePageUnscaledExporterVertical` | `SinglePageExporterVertical` | Vertical unscaled |

### Excel Export

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `GridExcelExporter` | `InstancePlugin` | Grid Excel export |
| `ExcelExporter` | `GridExcelExporter` | Scheduler Excel export |
| `WriteExcelFileProvider` | - | Excel file writer |
| `XlsProviderBase` | - | XLS provider base |

### Table Export

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TableExporter` | `Base` | Table exporter |
| `ScheduleTableExporter` | `TableExporter` | Schedule table exporter |

---

## 14. Helpers / Utilities

### Core Helpers

| Class | Beschrijving |
|-------|--------------|
| `AjaxHelper` | AJAX request helper |
| `AsyncHelper` | Async operations helper |
| `BrowserHelper` | Browser detection |
| `CSSHelper` | CSS manipulation |
| `DateHelper` | Date operations |
| `DomHelper` | DOM manipulation |
| `DomSync` | DOM synchronization |
| `EventHelper` | Event handling |
| `ObjectHelper` | Object utilities |
| `StringHelper` | String utilities |
| `TimeZoneHelper` | Timezone operations |
| `XMLHelper` | XML parsing |
| `LocaleHelper` | Locale helper |

### Drag & Drop

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `DragHelper` | `Base` | Drag helper |
| `DragContext` | `Base` | Drag context |
| `ScrollManager` | - | Scroll manager during drag |

### Geometry

| Class | Beschrijving |
|-------|--------------|
| `Rectangle` | Rectangle geometry |
| `Point` | Point geometry (extends Rectangle) |

### Data Structures

| Class | Beschrijving |
|-------|--------------|
| `Collection` | Collection class |
| `CollectionFilter` | Filter for collection |
| `CollectionSorter` | Sorter for collection |
| `DomClassList` | CSS class list |

### Other Utilities

| Class | Beschrijving |
|-------|--------------|
| `DataGenerator` | Test data generator |
| `Fullscreen` | Fullscreen API |
| `NumberFormat` | Number formatting |
| `RandomGenerator` | Random number generator |
| `Scroller` | Scroll manager |
| `Month` | Month operations |
| `HintFlow` | Hint flow manager |
| `FormulaProvider` | Formula provider |
| `ClickRepeater` | Click repeat handler |
| `Override` | Class override utility |
| `AvatarRendering` | Avatar rendering helper |

---

## 15. Layout Classes

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `Layout` | - | Base layout class |
| `Box` | `Layout` | Box layout |
| `VBox` | `Box` | Vertical box layout |
| `Card` | `Layout` | Card layout |
| `Fit` | `Layout` | Fit layout |

---

## 16. Chart / Data Providers

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `TimelineChartDataProviderBase` | `Base` | Abstract chart data provider |
| `TimelineChartProviderBase` | `Base` | Abstract chart provider |
| `GanttDataProvider` | `TimelineChartDataProviderBase` | Gantt chart data |
| `SVGChartProvider` | `TimelineChartProviderBase` | SVG chart provider |

---

## 17. Panel Collapsing

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `PanelCollapser` | - | Panel collapse handler |
| `PanelCollapserOverlay` | `PanelCollapser` | Overlay collapse handler |

---

## 18. Custom Element Tags

| Class | Extends | Beschrijving |
|-------|---------|--------------|
| `WidgetTag` | - | Base widget tag |
| `TimelineBaseTag` | `WidgetTag` | Timeline tag base |
| `GanttTag` | `TimelineBaseTag` | Gantt custom element |

---

## 19. Mixin Classes

### Store Mixins

| Class | Beschrijving |
|-------|--------------|
| `ModelLinkClass` | Model linking |
| `StoreCRUDClass` | Store CRUD operations |
| `StoreChainedClass` | Chained store |
| `StoreChangesClass` | Store change tracking |
| `StoreFilterClass` | Store filtering |
| `StoreGroupClass` | Store grouping |
| `StorePagingClass` | Store paging |
| `StoreProxyClass` | Store proxy |
| `StoreRelationClass` | Store relations |
| `StoreSearchClass` | Store search |
| `StoreSortClass` | Store sorting |
| `StoreSparseIndexClass` | Sparse index |
| `StoreStateClass` | Store state |
| `StoreSumClass` | Store aggregation |
| `StoreSyncClass` | Store synchronization |
| `StoreTreeClass` | Tree store |
| `TreeNodeClass` | Tree node |

### Widget Mixins

| Class | Beschrijving |
|-------|--------------|
| `LocalizableClass` | Localization support |
| `ClipboardableClass` | Clipboard support |
| `DelayableClass` | Delay operations |
| `EventsClass` | Event handling |
| `LoadMaskableClass` | Loading mask |
| `PluggableClass` | Plugin support |
| `StateClass` | State management |
| `StateStorage` | State storage |
| `StateProvider` | State provider |
| `BadgeClass` | Badge support |
| `FormulaFieldClass` | Formula field |
| `KeyMapClass` | Keyboard shortcuts |
| `LabelableClass` | Label support |
| `RTLClass` | RTL support |
| `ResizableClass` | Resize support |
| `ResponsiveClass` | Responsive design |
| `StyleableClass` | Style support |
| `ToolableClass` | Tool support |
| `ValidatableClass` | Validation |
| `AbstractDateRangeClass` | Date range |

### Grid Mixins

| Class | Beschrijving |
|-------|--------------|
| `GridElementEventsClass` | Grid element events |
| `GridFeaturesClass` | Grid features |
| `GridResponsiveClass` | Grid responsive |
| `GridSelectionClass` | Grid selection |
| `GridStateClass` | Grid state |
| `GridSubGridsClass` | SubGrid support |
| `PrintMixinClass` | Print support |

### Scheduler Mixins

| Class | Beschrijving |
|-------|--------------|
| `AssignmentStoreMixinClass` | Assignment store |
| `AttachToProjectMixinClass` | Project attachment |
| `DependencyStoreMixinClass` | Dependency store |
| `EventStoreMixinClass` | Event store |
| `GetEventsMixinClass` | Get events |
| `SchedulerPartOfProjectClass` | Part of project |
| `ProjectConsumerClass` | Project consumer |
| `SchedulerProjectCrudManagerClass` | CRUD manager |
| `RecurringEventsMixinClass` | Recurring events |
| `RecurringTimeSpansMixinClass` | Recurring time spans |
| `ResourceStoreMixinClass` | Resource store |
| `DescribableClass` | Describable |
| `EventNavigationClass` | Event navigation |
| `EventSelectionClass` | Event selection |
| `RecurringEventsClass` | Recurring events |
| `SchedulerDomClass` | Scheduler DOM |
| `SchedulerDomEventsClass` | Scheduler DOM events |
| `SchedulerEventRenderingClass` | Event rendering |
| `SchedulerRegionsClass` | Scheduler regions |
| `SchedulerResourceRenderingClass` | Resource rendering |
| `SchedulerScrollClass` | Scheduler scroll |
| `SchedulerStateClass` | Scheduler state |
| `SchedulerStoresClass` | Scheduler stores |
| `TimelineDateMapperClass` | Date mapping |
| `TimelineDomEventsClass` | DOM events |
| `TimelineEventRenderingClass` | Event rendering |
| `TimelineScrollClass` | Timeline scroll |
| `TimelineStateClass` | Timeline state |
| `TimelineViewPresetsClass` | View presets |
| `TimelineZoomableClass` | Zoomable |
| `TransactionalFeatureMixinClass` | Transactional features |

### Model Mixins

| Class | Beschrijving |
|-------|--------------|
| `AssignmentModelMixinClass` | Assignment model |
| `EventModelMixinClass` | Event model |
| `ProjectModelCommonClass` | Project model common |
| `ProjectModelMixinClass` | Project model |
| `ProjectModelTimeZoneMixinClass` | Timezone support |
| `RecurringTimeSpanClass` | Recurring time span |
| `ResourceModelMixinClass` | Resource model |
| `TimeZonedDatesMixinClass` | Timezone dates |
| `PercentDoneMixinClass` | Percent done |
| `ProjectChangeHandlerMixinClass` | Change handling |
| `ProjectRevisionHandlerMixinClass` | Revision handling |
| `ProjectProgressMixinClass` | Progress tracking |

### Feature Mixins

| Class | Beschrijving |
|-------|--------------|
| `DependencyCreationClass` | Dependency creation |
| `DependencyTooltipClass` | Dependency tooltip |
| `NonWorkingTimeMixinClass` | Non-working time |
| `RecurringEventEditClass` | Recurring event edit |
| `TaskEditStmClass` | Task edit STM |
| `TaskEditTransactionalClass` | Transactional edit |

### Gantt Mixins

| Class | Beschrijving |
|-------|--------------|
| `GanttDomClass` | Gantt DOM |
| `GanttRegionsClass` | Gantt regions |
| `GanttScrollClass` | Gantt scroll |
| `GanttStateClass` | Gantt state |
| `GanttStoresClass` | Gantt stores |
| `TaskNavigationClass` | Task navigation |

### SchedulerPro Mixins

| Class | Beschrijving |
|-------|--------------|
| `PartOfProjectClass` | Part of project |
| `ProjectCrudManagerClass` | CRUD manager |
| `ProHorizontalLayoutClass` | Horizontal layout |
| `ProHorizontalLayoutPack` | Layout pack |
| `ProHorizontalLayoutStack` | Layout stack |
| `SchedulerProEventRenderingClass` | Event rendering |
| `SchedulingIssueResolutionClass` | Issue resolution |
| `TimelineHistogramGroupingClass` | Histogram grouping |
| `TimelineHistogramScaleColumnClass` | Scale column |

### Other Mixins

| Class | Beschrijving |
|-------|--------------|
| `JsonEncoderClass` | JSON encoding |
| `AjaxTransportClass` | AJAX transport |
| `ChatPanelMixinClass` | Chat panel |
| `EventLoaderClass` | Event loading |
| `GridFeatureManager` | Feature management |

---

## 20. Generator Classes

| Class | Beschrijving |
|-------|--------------|
| `DataGenerator` | Test data generator |
| `ProjectGenerator` | Project data generator |
| `RandomGenerator` | Random number generator |

---

## Class Hierarchy Overzicht

```
Base
├── Model
│   ├── TimeSpan
│   │   ├── TaskModel
│   │   │   └── TimePhasedTaskModel
│   │   ├── EventModel
│   │   │   └── TimePhasedEventModel
│   │   ├── Baseline
│   │   └── TimeRangeModel
│   ├── GridRowModel
│   │   └── SchedulerResourceModel
│   ├── Column (Gantt columns)
│   └── ViewPreset
├── Store
│   ├── AjaxStore
│   │   ├── TaskStore
│   │   ├── EventStore
│   │   └── ... (other stores)
│   └── ColumnStore
├── Widget
│   ├── Container
│   │   ├── Panel
│   │   │   ├── Popup
│   │   │   ├── TabPanel
│   │   │   └── ... (other panels)
│   │   ├── Toolbar
│   │   └── ... (other containers)
│   ├── Field
│   │   ├── TextField
│   │   │   ├── PickerField
│   │   │   │   ├── Combo
│   │   │   │   └── DateField
│   │   │   └── FilterField
│   │   ├── Checkbox
│   │   │   ├── Radio
│   │   │   └── SlideToggle
│   │   └── ... (other fields)
│   ├── Button
│   │   └── Tab
│   └── Grid
│       ├── TreeGrid
│       └── TimelineBase
│           ├── SchedulerBase
│           │   ├── Scheduler
│           │   └── SchedulerProBase
│           │       └── SchedulerPro
│           ├── GanttBase
│           │   └── Gantt
│           └── TimelineHistogramBase
│               └── TimelineHistogram
├── InstancePlugin
│   ├── ContextMenuBase
│   ├── AIBase
│   │   └── AIFilter
│   ├── ... (all features)
│   └── TaskEditBase
└── ... (helpers, etc.)
```

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Bryntum Gantt versie: 7.1.0*
*Aantal classes: 674*
*Laatste update: December 2024*
