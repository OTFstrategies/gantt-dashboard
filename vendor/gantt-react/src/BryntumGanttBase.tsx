/**
 * React wrapper for Bryntum GanttBase
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, AssignmentModel, AssignmentModelConfig, Base, Baselines, BaselinesConfig, BryntumScrollOptions, CalendarManagerStore, CalendarModel, CalendarModelConfig, CellCopyPaste, CellCopyPasteConfig, CellEdit, CellEditConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnLines, ColumnLinesConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, CriticalPaths, CriticalPathsConfig, CycleResolutionPopup, DateConstraint, Dependencies, DependenciesConfig, DependencyBaseModel, DependencyEdit, DependencyEditConfig, DependencyModel, DependencyModelConfig, DomClassList, DomConfig, DurationUnit, EmptyTextDomConfig, EventColor, EventEdit, EventFilter, EventFilterConfig, EventModel, EventResizeData, EventSegments, EventSegmentsConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Gantt, GanttBase, GanttBaseListeners, Grid, GridBase, GridColumnConfig, GridExcelExporter, GridExcelExporterConfig, GridGroupSummary, GridGroupSummaryConfig, GridLocation, GridLocationConfig, GridLockRows, GridLockRowsConfig, GridRowResize, GridRowResizeConfig, GridSelectionMode, GridSplit, GridSplitConfig, GridStateInfo, Group, GroupConfig, HeaderMenu, HeaderMenuConfig, HeaderZoom, HeaderZoomConfig, Indicators, IndicatorsConfig, KeyMapConfig, Labels, LabelsConfig, Mask, MaskConfig, Menu, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, MspExport, MspExportConfig, NonWorkingTime, NonWorkingTimeConfig, PagingToolbarConfig, Pan, PanConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, ParentArea, ParentAreaConfig, PdfExport, PdfExportConfig, PercentBar, PercentBarConfig, PinColumns, PinColumnsConfig, Popup, PreserveScrollOptions, PresetStore, Print, PrintConfig, ProgressLine, ProgressLineConfig, ProjectEdit, ProjectEditConfig, ProjectEditor, ProjectLines, ProjectLinesConfig, ProjectModel, ProjectModelConfig, QuickFind, QuickFindConfig, RecordPositionContext, RecurrenceConfirmationPopup, RecurrenceConfirmationPopupConfig, RegionResize, RegionResizeConfig, ResourceModel, ResourceModelConfig, Rollups, RollupsConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, RowReorder, RowReorderConfig, ScheduleMenu, ScheduleMenuConfig, ScheduleTooltip, ScheduleTooltipConfig, Scheduler, SchedulerAssignmentModel, SchedulerDependencyEdit, SchedulerDependencyModel, SchedulerEventModel, SchedulerPro, SchedulerProResourceModel, SchedulerProTaskEdit, SchedulerResourceModel, SchedulerTimeAxisColumn, SchedulingIssueResolutionPopup, ScrollButtons, ScrollButtonsConfig, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, Sort, SortConfig, StateProvider, StickyCells, StickyCellsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, Summary, SummaryConfig, TabConfig, TaskCopyPaste, TaskCopyPasteConfig, TaskDrag, TaskDragConfig, TaskDragCreate, TaskDragCreateConfig, TaskEdit, TaskEditConfig, TaskEditorBase, TaskMenu, TaskMenuConfig, TaskModel, TaskModelConfig, TaskNonWorkingTime, TaskNonWorkingTimeConfig, TaskResize, TaskResizeConfig, TaskResizeData, TaskSegmentDrag, TaskSegmentDragConfig, TaskSegmentResize, TaskSegmentResizeConfig, TaskStore, TaskStoreConfig, TaskTooltip, TaskTooltipConfig, TimeAxis, TimeAxisConfig, TimeAxisHeaderMenu, TimeAxisHeaderMenuConfig, TimeRanges, TimeRangesConfig, TimeSpan, TimeSpanConfig, TimeSpanHighlight, TimeSpanHighlightConfig, TimelineBase, TimelineChart, TimelineChartConfig, TimelineContext, TimelineStateInfo, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, Tree, TreeConfig, TreeGroup, TreeGroupConfig, Versions, VersionsConfig, VerticalTimeAxisColumn, ViewPreset, ViewPresetConfig, VisibleDate, Widget, XLSColumn } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumGanttBaseProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * When this widget is a child of a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container), it will by default be participating in a
     * flexbox layout. This config allows you to set this widget's
     * [align-self](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self) style.
     */
    alignSelf? : string
    /**
     * Set to `false` to not allow creating dependencies
     */
    allowCreate? : boolean
    /**
     * Set it to `true` to allow dependency creation only for parent events (only applies to Scheduler Pro using the `NestedEvents` feature). Normally the nested event container
     * inside parent events cannot be scrolled when using dependencies, but by enabling this setting and limiting
     * to where dependencies can be drawn scrolling will be enabled.
     */
    allowCreateOnlyParent? : boolean
    /**
     * `false` to require a drop on a target event bar side circle to define the dependency type.
     * If dropped on the event bar, the `defaultValue` of the DependencyModel `type` field will be used to
     * determine the target task side.
     */
    allowDropOnEventBar? : boolean
    /**
     * Set to `true` to animate row removals caused by filtering.
     * @deprecated 7.0.0 Deprecated `animateFilterRemovals`. Use `transition.filterRemoval` instead
     */
    animateFilterRemovals? : boolean
    /**
     * Controls if removing and inserting rows should be animated. Set to `false` to prevent those animations,
     * removing the related delays.
     * @deprecated 7.0.0 Deprecated `animateRemovingRows`. Use `transition.removeRecord` instead
     */
    animateRemovingRows? : boolean
    /**
     * When the [Tree](https://bryntum.com/products/gantt/docs/api/Grid/feature/Tree) feature is in use and the Store is a tree store, this
     * config may be set to `true` to visually animate branch node expand and collapse operations.
     * *This is not supported in Scheduler and Gantt*
     * @deprecated 7.0.0 Deprecated `animateTreeNodeToggle`. Use `transition.toggleTreeNode` instead
     */
    animateTreeNodeToggle? : boolean
    /**
     * Element (or the id of an element) to append this widget's element to. Can be configured, or set once at
     * runtime. To access the element of a rendered widget, see [element](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-element).
     */
    appendTo? : HTMLElement|string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject
     * into an element which will be linked using the `aria-describedby` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Inline assignments, will be loaded into the backing project's AssignmentStore.
     */
    assignments? : AssignmentModel[]|AssignmentModelConfig[]
    /**
     * You can set this option to `false` to make the timeline panel start and end on the exact provided
     * [startDate](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-startDate)/[endDate](#Scheduler/view/TimelineBase#config-endDate) w/o adjusting them.
     */
    autoAdjustTimeAxis? : boolean
    /**
     * Automatically set grids height to fit all rows (no scrolling in the grid). In general you should avoid
     * using `autoHeight: true`, since it will bypass Grids virtual rendering and render all rows at once, which
     * in a larger grid is really bad for performance.
     */
    autoHeight? : boolean
    /**
     * Controls how much space to leave between stacked event bars in px.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-barMargin)
     */
    barMargin? : number
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar. Another way to add a bbar is to use [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-bbar)
     */
    bbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * Custom CSS classes to add to the panel's body element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-bodyCls)
     */
    bodyCls? : string|object
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * This config defines the size of the start and end invisible parts of the timespan when [infiniteScroll](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineScroll#config-infiniteScroll) set to `true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-bufferCoef)
     */
    bufferCoef? : number
    /**
     * This config defines the scroll limit, which, when exceeded will cause a timespan shift.
     * The limit is calculated as the `panelWidth * [bufferCoef](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineScroll#config-bufferCoef) * bufferThreshold`. During scrolling, if the left or right side
     * has less than that of the rendered content - a shift is triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-bufferThreshold)
     */
    bufferThreshold? : number
    /**
     * Inline calendars, will be loaded into the backing project's CalendarManagerStore.
     */
    calendars? : CalendarModel[]|CalendarModelConfig[]
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * Set to `false` to crop text in grid cells without ellipsis (...). When enabled, cells containing pure
     * use `display : block`, instead of `display : flex` to allow ellipsis to work.
     * <strong>NOTE</strong> Only supported in browsers that support `:has()` CSS selector
     */
    cellEllipsis? : boolean
    /**
     * Custom CSS classes to add to element.
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-cls)
     */
    cls? : string|object
    /**
     * Controls whether the panel is collapsed (the body of the panel is hidden while only the header is
     * visible). Only valid if the panel is [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible).
     */
    collapsed? : boolean
    /**
     * This config enables collapsibility for the panel. See [collapsed](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsed).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-collapsible)
     */
    collapsible? : boolean|PanelCollapserConfig|PanelCollapserOverlayConfig
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-color)
     */
    color? : string
    /**
     * Programmatic control over which column to start in when used in a grid layout.
     */
    column? : number
    /**
     * Set to `false` to not show column lines. End result might be overruled by/differ between themes.
     */
    columnLines? : boolean
    /**
     * Accepts column definitions for the grid during initialization. They will be used to create
     * [Column](https://bryntum.com/products/gantt/docs/api/Grid/column/Column) instances that are added to a [ColumnStore](#Grid/data/ColumnStore).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-columns)
     */
    columns? : ColumnStore|GridColumnConfig[]|ColumnStoreConfig
    config? : object
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-contentElementCls)
     */
    contentElementCls? : string|object
    /**
     * Event which is used to show context menus.
     * Available options are: 'contextmenu', 'click', 'dblclick'.
     */
    contextMenuTriggerEvent? : 'contextmenu'|'click'|'dblclick'
    /**
     * A tooltip config object that will be applied to the dependency creation [Tooltip](https://bryntum.com/products/gantt/docs/api/Core/widget/Tooltip)
     */
    creationTooltip? : TooltipConfig
    /**
     * A template function that will be called to generate the HTML contents of the dependency creation tooltip.
     * You can return either an HTML string or a [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) object.
     * @param {object} data Data about the dependency being created
     * @param {Scheduler.model.TimeSpan} data.source The from event
     * @param {Scheduler.model.TimeSpan} data.target The target event
     * @param {string} data.fromSide The from side (start, end, top, bottom)
     * @param {string} data.toSide The target side (start, end, top, bottom)
     * @param {boolean} data.valid The validity of the dependency
     * @returns {string,DomConfig}
     */
    creationTooltipTemplate? : (data: { source: TimeSpan, target: TimeSpan, fromSide: string, toSide: string, valid: boolean }) => string|DomConfig
    /**
     * Class implementing the popup resolving *scheduling cycles*.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-cycleResolutionPopupClass)
     */
    cycleResolutionPopupClass? : typeof CycleResolutionPopup
    /**
     * Convenient shortcut to set data in grids store both during initialization and at runtime. Can also be
     * used to retrieve data at runtime, although we do recommend interacting with Grids store instead using
     * the [store](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#property-store) property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-data)
     */
    data? : object[]|Model[]|ModelConfig[]
    /**
     * When this Widget configuration is used in the Grid's RowExpander feature's `widget` config, provide the
     * field on the expanded record to use for populating this widget's store (if applicable)
     */
    dataField? : string
    /**
     * Object to apply to elements dataset (each key will be used as a data-attribute on the element)
     */
    dataset? : Record<string, string>
    /**
     * Region to which columns are added when they have none specified
     */
    defaultRegion? : string
    /**
     * The file name of an image file to use when a resource has no image, or its image cannot be loaded.
     */
    defaultResourceImageName? : string
    /**
     * Inline dependencies, will be loaded into the backing project's DependencyStore.
     */
    dependencies? : DependencyModel[]|DependencyModelConfig[]
    /**
     * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks.
     */
    dependencyIdField? : string
    /**
     * Set to `true` to destroy the store when the grid is destroyed.
     */
    destroyStore? : boolean
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-disabled)
     */
    disabled? : boolean|'inert'
    /**
     * Set to `true` to not get a warning when calling [getState](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#function-getState) when there is a column
     * configured without an `id`. But the recommended action is to always configure columns with an `id` when
     * using states.
     */
    disableGridColumnIdWarning? : boolean
    /**
     * Set to `true` to not get a warning when using another base class than GridRowModel for your grid data. If
     * you do, and would like to use the full feature set of the grid then include the fields from GridRowModel
     * in your model definition.
     */
    disableGridRowModelWarning? : boolean
    /**
     * Defines how dates will be formatted in tooltips etc. This config has priority over similar config on the
     * view preset. For allowed values see [format](https://bryntum.com/products/gantt/docs/api/Core/helper/DateHelper#function-format-static).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-displayDateFormat)
     */
    displayDateFormat? : string
    /**
     * Set to `true` to display special popups allowing user
     * to resolve [scheduling conflicts](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/SchedulingIssueResolutionPopup),
     * [cycles](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/CycleResolutionPopup) or calendar misconfigurations.
     * The popup will suggest user ways to resolve the corresponding case.
     */
    displaySchedulingIssueResolutionPopup? : boolean
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * Make this Panel a docked drawer which slides out from one side of the browser viewport by default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-drawer)
     * @param {'start','left','end','right','top','bottom'} side The side of the viewport to dock the drawer to.  * `'start'` means the `inline-start` side. * `'end'` means the `inline-end` side.
     * @param {string,number} size The size of the drawer in its collapsible axis.
     * @param {boolean} inline If using the [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-appendTo) config to place the drawer inside a host widget, this may be set to `true` to make the drawer inline within that host. Note that, if using this, the layout of the host element must have `flex-direction` set appropriately.
     * @param {boolean,object} autoClose Specifies what user actions should automatically close the drawer. Defaults to closing when the user clicks outside of the drawer or when focus moves outside of the drawer.
     * @param {boolean,string} autoClose.mousedown If the user clicks outside of the drawer, the drawer will automatically be hidden. If the value is a string, it is used as a CSS selector to filter clicks which should close the drawer.
     * @param {boolean,string} autoClose.focusout If focus moves outside of the drawer, the drawer will automatically be hidden.
     * @param {string} autoClose.mouseout Hides the drawer when the mouse leaves the drawer after the `autoCloseDelay` period.
     * @param {number} autoCloseDelay When using `mouseout`, this is the delay in milliseconds
     */
    drawer? : boolean|{side?: 'start'|'left'|'end'|'right'|'top'|'bottom', size?: string|number, inline?: boolean, autoClose: { mousedown?: boolean|string, focusout?: boolean|string, mouseout?: string }, autoCloseDelay?: number}
    /**
     * Decimal precision used when displaying durations, used by tooltips and DurationColumn.
     * Specify `false` to use raw value
     */
    durationDisplayPrecision? : number|boolean
    /**
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-elementAttributes)
     */
    elementAttributes? : Record<string, string|null>
    /**
     * Text or HTML, or a [EmptyTextDomConfig](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#typedef-EmptyTextDomConfig) block to display when there is no data to display in the grid.
     * When using multiple Grid regions, provide the `region` property to decide where the text is shown.
     * By default, it is shown in the first region.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-emptyText)
     */
    emptyText? : string|EmptyTextDomConfig
    /**
     * Allow using [Delete] and [Backspace] to remove events/assignments
     */
    enableDeleteKey? : boolean
    /**
     * Set to `false` if you don't want event bar DOM updates to animate.
     * @deprecated 7.0.0 Deprecated `enableEventAnimations`. Use `transition.changeEvent` instead
     */
    enableEventAnimations? : boolean
    /**
     * Enables showing occurrences of recurring events across the scheduler's time axis. If you want to disable
     * the recurrence popup, you can choose set the `defaultAction` to `future` to affect all future
     * occurrences, or `single` to just affect the currently selected event.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-enableRecurringEvents)
     */
    enableRecurringEvents? : boolean|{
        defaultAction?: 'single'|'future'
    }
    /**
     * Configure this as `true` to allow elements within cells to be styled as `position: sticky`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-enableSticky)
     */
    enableSticky? : boolean
    /**
     * Set to `true` to allow text selection in the grid cells. Note, this cannot be used simultaneously with the
     * `RowReorder` feature.
     */
    enableTextSelection? : boolean
    /**
     * When true, some features will start a project transaction, blocking the project queue, suspending
     * store events and preventing UI from updates. It behaves similar to
     * [instantUpdate](https://bryntum.com/products/gantt/docs/api/Grid/column/Column#config-instantUpdate) set to `false`.
     * Set `false` to not use project queue.
     */
    enableTransactionalFeatures? : boolean
    /**
     * Set to `true` to listen for CTRL-Z (CMD-Z on Mac OS) keyboard event and trigger undo (redo when SHIFT is
     * pressed). Only applicable when using a [StateTrackingManager](https://bryntum.com/products/gantt/docs/api/Core/data/stm/StateTrackingManager).
     */
    enableUndoRedoKeys? : boolean
    /**
     * The end date of the timeline (if not configure with [infiniteScroll](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-infiniteScroll)).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-endDate)
     */
    endDate? : Date|string
    /**
     * Task color used by default. Tasks can specify their own [eventColor](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-eventColor),
     * which will override this config.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-eventColor)
     */
    eventColor? : EventColor
    /**
     * Event style used by default. Events and resources can specify their own style, with priority order being:
     * Event -&gt; Resource -&gt; Scheduler default. Determines the appearance of the event by assigning a CSS class
     * to it. Available styles are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-eventStyle)
     */
    eventStyle? : 'tonal'|'filled'|'bordered'|'traced'|'outlined'|'indented'|'line'|'dashed'|'minimal'|'rounded'|'calendar'|'interday'|'gantt'|null
    extraData? : any
    /**
     * Set to `true` to stretch the last column in a grid with all fixed width columns
     * to fill extra available space if the grid's width is wider than the sum of all
     * configured column widths.
     */
    fillLastColumn? : boolean
    /**
     * Specify `true` to force rendered events/tasks to fill entire ticks. This only affects rendering, start
     * and end dates retain their value on the data level.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-fillTicks)
     */
    fillTicks? : boolean
    /**
     * Use fixed row height. Setting this to `true` will configure the underlying RowManager to use fixed row
     * height, which sacrifices the ability to use rows with variable height to gain a fraction better
     * performance.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-fixedRowHeight)
     */
    fixedRowHeight? : boolean
    /**
     * When this widget is a child of a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container), it will by default be participating in a
     * flexbox layout. This config allows you to set this widget's
     * [flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) style.
     * This may be configured as a single number or a `&lt;flex-grow&gt; &lt;flex-shrink&gt; &lt;flex-basis&gt;` format string.
     * numeric-only values are interpreted as the `flex-grow` value.
     */
    flex? : number|string
    /**
     * Config object of a footer. May contain a `dock`, `html` and a `cls` property. A footer is not a widget,
     * but rather plain HTML that follows the last element of the panel's body and [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-footer)
     */
    footer? : {
        dock?: 'top'|'right'|'bottom'|'left'|'start'|'end'
        html?: string
        cls?: string
    }|string
    /**
     * Set to `true` to force the time columns to fit to the available space (horizontal or vertical depends on mode).
     * Note that setting [suppressFit](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-suppressFit) to `true`, will disable `forceFit` functionality. Zooming
     * cannot be used when `forceFit` is set.
     */
    forceFit? : boolean
    /**
     * An object which names formula prefixes which will be applied to all columns configured with
     * `formula : true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-formulaProviders)
     */
    formulaProviders? : Record<string, FormulaProviderConfig>
    /**
     * Refresh entire row when a record changes (`true`) or, if possible, only the cells affected (`false`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-fullRowRefresh)
     */
    fullRowRefresh? : boolean
    /**
     * Returns dates that will constrain resize and drag operations. The method will be called with the
     * task being dragged.
     * @param {Gantt.model.TaskModel} taskRecord The task record being moved or resized.
     * @returns {DateConstraint} Constraining object containing `start` and `end` constraints. Omitting either will mean that end is not constrained. So you can prevent a resize or move from moving *before* a certain time while not constraining the end date.
     */
    getDateConstraints? : (taskRecord: TaskModel) => DateConstraint
    /**
     * A function called for each row to determine its height. It is passed a [record](https://bryntum.com/products/gantt/docs/api/Core/data/Model) and
     * expected to return the desired height of that records row. If the function returns a falsy value, Grids
     * configured [rowHeight](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-rowHeight) is used.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-getRowHeight)
     * @param {Core.data.Model} getRowHeight.record Record to determine row height for
     * @returns {number} Desired row height
     */
    getRowHeight? : (getRowHeight: { record: Model }) => number
    /**
     * A config [object](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#typedef-PanelHeader) for the panel's header or a string in place of a `title`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-header)
     */
    header? : string|boolean|PanelHeader
    /**
     * Widget's height, used to set element `style.height`. Either specify a valid height string or a number,
     * which will get 'px' appended. We recommend using CSS as the primary way to control height, but in some
     * cases this config is convenient.
     */
    height? : string|number
    /**
     * Configure with true to make widget initially hidden.
     */
    hidden? : boolean
    /**
     * Set to `true` to hide the footer elements
     */
    hideFooters? : boolean
    /**
     * Set to `true` to hide the column header elements
     */
    hideHeaders? : boolean
    /**
     * Set to `true` to hide the Grid's horizontal scrollbar(s)
     */
    hideHorizontalScrollbar? : boolean
    /**
     * By default the row hover effect is not visible in the Scheduler part of the grid.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-hideRowHover)
     */
    hideRowHover? : boolean
    /**
     * A CSS class to add to hovered row elements
     */
    hoverCls? : string
    /**
     * An icon to show before the [title](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-title). Either pass a CSS class as a string, or pass a
     * [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) object describing an element to represent the icon.
     */
    icon? : string|DomConfig
    /**
     * Widget id, if not specified one will be generated. Also used for lookups through Widget.getById
     */
    id? : string
    /**
     * Set to `true` to ignore reacting to DOM events (mouseover/mouseout etc) while scrolling. Useful if you
     * want to maximize scroll performance.
     */
    ignoreDomEventsWhileScrolling? : boolean
    /**
     * Determines if the widgets read-only state should be controlled by its parent.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Set to `true` to automatically adjust the panel timespan during scrolling in the time dimension,
     * when the scroller comes close to the start/end edges.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-infiniteScroll)
     */
    infiniteScroll? : boolean
    /**
     * Convenience setting to align input fields of child widgets. By default, the Field input element is
     * placed immediately following the `label`. If you prefer to have all input fields aligned to the
     * right, set this config to `'end'`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-inputFieldAlign)
     */
    inputFieldAlign? : 'start'|'end'
    /**
     * Element (or element id) to insert this widget before. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertBefore? : HTMLElement|string
    /**
     * Element (or element id) to append this widget element to, as a first child. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertFirst? : HTMLElement|string
    /**
     * See [Keyboard shortcuts](https://bryntum.com/products/gantt/docs/api/Gantt/view/Gantt#keyboard-shortcuts) for details
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * Convenience setting to use same label placement on all child widgets.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|'align-before'|'auto'|null
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-listeners)
     */
    listeners? : GanttBaseListeners
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object, or a message to be shown when a store is performing a remote
     * operation, or Crud Manager is loading data from the sever. Set to `null` to disable default load mask.
     */
    loadMask? : string|MaskConfig|null
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object to adjust the [maskDefaults](#Core/widget/Widget#config-maskDefaults)
     * when data is loading. The message and optional configuration from the
     * [loadMask](https://bryntum.com/products/gantt/docs/api/Core/mixin/LoadMaskable#config-loadMask) config take priority over these options, just as they do
     * for `maskDefaults`, respectively.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-loadMaskDefaults)
     */
    loadMaskDefaults? : MaskConfig
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object to adjust the [maskDefaults](#Core/widget/Widget#config-maskDefaults)
     * when an error occurs loading data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-loadMaskError)
     */
    loadMaskError? : MaskConfig|Mask|boolean
    /**
     * Set to `false` to disable localization of this object.
     */
    localizable? : boolean
    /**
     * Time in ms until a longpress is triggered
     */
    longPressTime? : number
    /**
     * When `true`, events are sized and positioned based on rowHeight, resourceMargin and barMargin settings.
     * Set this to `false` if you want to control height and vertical position using CSS instead.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-managedEventSizing)
     */
    managedEventSizing? : boolean
    /**
     * Widget's margin. This may be configured as a single number or a `TRBL` format string.
     * numeric-only values are interpreted as pixels.
     */
    margin? : number|string
    /**
     * Grids change the `maskDefaults` to cover only their `body` element.
     */
    maskDefaults? : MaskConfig
    /**
     * Set to `true` to apply the default mask to the widget. Alternatively, this can be the mask message or a
     * [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object.
     */
    masked? : boolean|string|MaskConfig
    /**
     * Get/set end date limit of the timeline.
     * Actions such as timeline scrolling, all types of timeline zooms and shifts
     * will respect this limit.
     */
    maxDate? : Date|string
    /**
     * The element's maxHeight. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [height](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-height), *reading* the value will return the numeric value in pixels.
     */
    maxHeight? : string|number
    /**
     * The maximum time axis unit to display non-working ranges for ('hour' or 'day' etc).
     * When zooming to a view with a larger unit, no non-working time elements will be rendered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-maxTimeAxisUnit)
     */
    maxTimeAxisUnit? : DurationUnit
    /**
     * The elements maxWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    maxWidth? : string|number
    /**
     * The maximum zoom level to which [zoomIn](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineZoomable#function-zoomIn) will work. Defaults to the number of
     * [ViewPresets](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/ViewPreset) available, see [presets](#Scheduler/view/mixin/TimelineViewPresets#property-presets)
     * for information. Unless you have modified the collection of available presets, the max zoom level is
     * milliseconds.
     */
    maxZoomLevel? : number
    /**
     * Get/set start date limit of the timeline.
     * Actions such as timeline scrolling, all types of timeline zooms and shifts
     * will respect this limit.
     */
    minDate? : Date|string
    /**
     * Grid's `min-height`. Defaults to `10em` to be sure that the Grid always has a height wherever it is
     * inserted.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-minHeight)
     */
    minHeight? : string|number
    /**
     * The elements minWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    minWidth? : string|number
    /**
     * The minimum zoom level to which [zoomOut](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineZoomable#function-zoomOut) will work. Defaults to 0 (year ticks)
     */
    minZoomLevel? : number
    /**
     * Grid monitors window resize by default.
     */
    monitorResize? : boolean
    /**
     * A callback function or a set of `name: value` properties to apply on tasks created using the task context menu.
     * Be aware that `name` value will be ignored since it's auto generated and may be configured with localization.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-newTaskDefaults)
     * @returns {Gantt.model.TaskModelConfig,object} Set of properties to apply on tasks created using the task context menu
     */
    newTaskDefaults? : TaskModelConfig|object|(() => TaskModelConfig|object)
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-owner)
     */
    owner? : Widget|any
    /**
     * Partners this Timeline panel with another Timeline in order to sync their region sizes (sub-grids like locked, normal will get the same width),
     * start and end dates, view preset, zoom level and scrolling position. All these values will be synced with the timeline defined as the `partner`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-partner)
     */
    partner? : TimelineBase
    /**
     * Specify plugins (an array of classes) in config
     */
    plugins? : Function[]
    /**
     * True to preserve focused cell after loading new data
     */
    preserveFocusOnDatasetChange? : boolean
    /**
     * Preserve the grid's vertical scroll position when changesets are applied, as in the case of remote
     * changes, or when stores are configured with [syncDataOnLoad](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-syncDataOnLoad).
     */
    preserveScroll? : PreserveScrollOptions|boolean
    /**
     * Specify `true` to preserve vertical scroll position after store actions that trigger a `refresh` event,
     * such as loading new data and filtering.
     */
    preserveScrollOnDatasetChange? : boolean
    /**
     * An array of [ViewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/ViewPreset) config objects
     * which describes the available timeline layouts for this scheduler.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-presets)
     */
    presets? : ViewPresetConfig[]
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * A [ProjectModel](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel) instance or a config object. The project holds all Gantt data.
     */
    project? : ProjectModel|ProjectModelConfig|RefObject<any>
    /**
     * Accepts the following values:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-projectProgressReporting)
     */
    projectProgressReporting? : string|null
    /**
     * Configure as `true` to make the Gantt read-only, by disabling any UIs for modifying data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-readOnly)
     */
    readOnly? : boolean
    /**
     * The confirmation dialog shown when a recurring event is edited.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-recurrenceConfirmationPopup)
     */
    recurrenceConfirmationPopup? : RecurrenceConfirmationPopupConfig|RecurrenceConfirmationPopup
    relayStoreEvents? : boolean
    /**
     * Either a default `rendition` to apply to all child widgets, or a map of renditions keyed by child widget
     * `type`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-rendition)
     */
    rendition? : string|Record<string, string>|null
    /**
     * Configure this property to allow the widget/component to be resized. Pressing <kbd>Shift</kbd> while resizing will
     * constrain the aspect ratio.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-resizable)
     */
    resizable? : boolean|{
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        handles?: object
    }
    /**
     * Set to `false` to only measure cell contents when double-clicking the edge between column headers.
     */
    resizeToFitIncludesHeader? : boolean
    /**
     * The path for resource images, used by various widgets such as the resource assignment column.
     * @deprecated 7.0 In favor of [resourceImagePath](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-resourceImagePath)
     */
    resourceImageFolderPath? : string
    /**
     * The path for resource images, used by various widgets such as the resource assignment column.
     */
    resourceImagePath? : string
    /**
     * Inline resources, will be loaded into the backing project's ResourceStore.
     */
    resources? : ResourceModel[]|ResourceModelConfig[]
    /**
     * "Break points" for which responsive config to use for columns and css.
     */
    responsiveLevels? : Record<string, number|string>
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-ripple)
     */
    ripple? : boolean|{
        delegate?: string
        color?: string
        radius?: number
        clip?: string
    }
    /**
     * If you are rendering this widget to a shadow root inside a web component, set this config to the shadowRoot. If not inside a web component, set it to `document.body`
     */
    rootElement? : ShadowRoot|HTMLElement
    /**
     * Row height in pixels. This allows the default height for rows to be controlled. Note that it may be
     * overriden by specifying a [rowHeight](https://bryntum.com/products/gantt/docs/api/Grid/data/GridRowModel#field-rowHeight) on a per record basis, or from
     * a column [renderer](https://bryntum.com/products/gantt/docs/api/Grid/column/Column#config-renderer).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-rowHeight)
     */
    rowHeight? : number
    /**
     * Set to `false` to not show row lines. End result might be overruled by/differ between themes.
     */
    rowLines? : boolean
    /**
     * This may be configured as `true` to make the widget's element use the `direction:rtl` style.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-rtl)
     */
    rtl? : boolean
    /**
     * Class implementing the popup resolving *scheduling conflicts* and *calendar misconfigurations*.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-schedulingIssueResolutionPopupClass)
     */
    schedulingIssueResolutionPopupClass? : typeof SchedulingIssueResolutionPopup
    /**
     * Configures whether the grid is scrollable in the `Y` axis. This is used to configure a [Scroller](https://bryntum.com/products/gantt/docs/api/Core/helper/util/Scroller).
     * See the [scrollerClass](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-scrollerClass) config option.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-scrollable)
     */
    scrollable? : boolean|ScrollerConfig|Scroller
    /**
     * The class to instantiate to use as the [scrollable](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-scrollable). Defaults to [Scroller](#Core/helper/util/Scroller).
     */
    scrollerClass? : typeof Scroller
    /**
     * Configuration values for the [ScrollManager](https://bryntum.com/products/gantt/docs/api/Core/util/ScrollManager) class on initialization. Returns the
     * [ScrollManager](https://bryntum.com/products/gantt/docs/api/Core/util/ScrollManager) at runtime.
     */
    scrollManager? : ScrollManagerConfig|ScrollManager
    /**
     * True to scroll the task bar into view when clicking a cell, you can also pass a
     * [scroll config](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#function-scrollTaskIntoView) object.
     */
    scrollTaskIntoViewOnCellClick? : boolean|BryntumScrollOptions
    /**
     * Selection configuration settings, change these properties to control how selection works and what can be
     * selected.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-selectionMode)
     */
    selectionMode? : GridSelectionMode
    /**
     * If set to `true` this will:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-showCostControls)
     */
    showCostControls? : boolean
    /**
     * `false` to not show a tooltip while creating a dependency
     */
    showCreationTooltip? : boolean
    /**
     * Configure as `true` to have the grid show a red "changed" tag in cells whose
     * field value has changed and not yet been committed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-showDirty)
     */
    showDirty? : boolean|{
        duringEdit?: boolean
        newRecord?: boolean
    }
    /**
     * Set to `true` to show the lag in the tooltip
     */
    showLagInTooltip? : boolean
    /**
     * Set to `false` to hide recurring fields in event editor, even if the
     * [Recurring Events](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/RecurringEvents#config-enableRecurringEvents) is `true`
     * and a recurring event is being edited.
     */
    showRecurringUI? : boolean
    /**
     * If set to `true` this will show a color field in the [TaskEdit](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskEdit) editor and also a
     * picker in the [TaskMenu](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskMenu). Both enables the user to choose a color which will be
     * applied to the task bar's background. See TaskModel's [eventColor](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-eventColor)
     * config.
     */
    showTaskColorPickers? : boolean
    /**
     * Set to `true` to show a tooltip when hovering a dependency line
     */
    showTooltip? : boolean
    /**
     * Specify as `false` to not show unscheduled tasks on the Gantt chart. Unscheduled tasks will be rendered as
     * an icon
     */
    showUnscheduledTasks? : boolean
    /**
     * Set to `true` to snap to the current time resolution increment while interacting with scheduled events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-snap)
     */
    snap? : boolean
    /**
     * Affects drag drop and resizing of events when [snap](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineDateMapper#config-snap)
     * is enabled.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-snapRelativeToEventStartDate)
     */
    snapRelativeToEventStartDate? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * The start date of the timeline (if not configure with [infiniteScroll](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-infiniteScroll)).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-startDate)
     */
    startDate? : Date|string
    /**
     * This value can be one of the following:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-stateful)
     */
    stateful? : boolean|object|string[]
    /**
     * The events that, when fired by this component, should trigger it to save its state by calling
     * [saveState](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#function-saveState).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-statefulEvents)
     */
    statefulEvents? : object|string[]
    /**
     * The key to use when saving this object's state in the [stateProvider](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateProvider). If this config is
     * not assigned, and [stateful](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateful) is not set to `false`, the [id](#Core/widget/Widget#config-id)
     * (if explicitly specified) will be used as the `stateId`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-stateId)
     */
    stateId? : string
    /**
     * The `StateProvider` to use to save and restore this object's [state](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#property-state). By default, `state`
     * will be saved using the [default state provider](https://bryntum.com/products/gantt/docs/api/Core/state/StateProvider#property-instance-static).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-stateProvider)
     */
    stateProvider? : StateProvider
    /**
     * The properties of this settings object controls how grid is restored from state data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-stateSettings)
     */
    stateSettings? : {
        restoreUnconfiguredColumns?: boolean
    }
    /**
     * When set, the text in the major time axis header sticks in the scrolling viewport as long as possible.
     */
    stickyHeaders? : boolean
    /**
     * Store that holds records to display in the grid, or a store config object. If the configuration contains
     * a `readUrl`, an `AjaxStore` will be created.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-store)
     */
    store? : Store|StoreConfig|AjaxStore|AjaxStoreConfig
    /**
     * An object containing widgets keyed by name. By default (when no `type` is given), strips are
     * [toolbars](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar). If you want to pass an array, you can use
     * the toolbar's [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-strips)
     */
    strips? : Record<string, ContainerItemConfig>
    /**
     * An object containing sub grid configuration objects keyed by a `region` property.
     * By default, grid has a 'locked' region (if configured with locked columns) and a 'normal' region.
     * The 'normal' region defaults to use `flex: 1`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-subGridConfigs)
     */
    subGridConfigs? : Record<string, SubGridConfig>
    /**
     * Set to `true` to prevent auto calculating of a minimal [tickSize](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineEventRendering#property-tickSize)
     * to always fit the content to the screen size. Setting this property on `true` will disable [forceFit](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-forceFit) behaviour.
     */
    suppressFit? : boolean
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object, or a message to be shown when Crud Manager
     * is persisting changes on the server. Set to `null` to disable default sync mask.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-syncMask)
     */
    syncMask? : string|MaskConfig|null
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * When this container is used as a tab in a TabPanel, these items are added to the
     * [TabBar](https://bryntum.com/products/gantt/docs/api/Core/widget/TabBar) when this container is the active tab.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-tabBarItems)
     */
    tabBarItems? : ToolbarItems[]|Widget[]
    /**
     * An empty function by default, but provided so that you can override it. This function is called each time
     * a task is rendered into the gantt to render the contents of the task.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-taskRenderer)
     * @param {object} detail An object containing the information needed to render a Task.
     * @param {Gantt.model.TaskModel} detail.taskRecord The task record.
     * @param {object} detail.renderData An object containing details about the task rendering.
     * @param {Core.helper.util.DomClassList,string} detail.renderData.cls An object whose property names represent the CSS class names to be added to the tasks's element. Set a property's value to truthy or falsy to add or remove the class name based on the property name. Using this technique, you do not have to know whether the class is already there, or deal with concatenation.
     * @param {string,Record<string, string>} detail.renderData.style Inline styles for the task bar DOM element. Use either 'border: 1px solid black' or { border: '1px solid black' }
     * @param {Core.helper.util.DomClassList,string} detail.renderData.wrapperCls An object whose property names represent the CSS class names to be added to the event wrapper element. Set a property's value to truthy or falsy to add or remove the class name based on the property name. Using this technique, you do not have to know whether the class is already there, or deal with concatenation.
     * @param {Core.helper.util.DomClassList,string} detail.renderData.iconCls An object whose property names represent the CSS class names to be added to a task icon element.
     * @param {Scheduler.model.TimeSpan[],TimeSpanConfig[]} indicators An array that can be populated with TimeSpan records or their config objects to have them rendered in the task row
     * @returns {string,DomConfig,DomConfig[]} A simple string, or a DomConfig object defining the actual HTML
     */
    taskRenderer? : (detail: { taskRecord: TaskModel, renderData: { cls: DomClassList|string, style: string|Record<string, string>, wrapperCls: DomClassList|string, iconCls: DomClassList|string } }, indicators: TimeSpan[]|TimeSpanConfig[]) => string|DomConfig|DomConfig[]
    /**
     * Inline tasks, will be loaded into an internally created TaskStore.
     */
    tasks? : TaskModel[]|TaskModelConfig[]
    /**
     * The [TaskStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/TaskStore) holding the tasks to be rendered into the Gantt.
     */
    taskStore? : TaskStore|TaskStoreConfig
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar.
     * This creates a toolbar docked to the top of the panel immediately below the header.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-tbar)
     */
    tbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * CSS class used for terminals
     */
    terminalCls? : string
    /**
     * Delay in ms before hiding the terminals when the mouse leaves an event bar or terminal.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-terminalHideDelay)
     */
    terminalHideDelay? : number
    /**
     * Terminal offset from their initial position, in px. Positive values move terminals further away from the
     * event bar, negative values inside the event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-terminalOffset)
     */
    terminalOffset? : number
    /**
     * Delay in ms before showing the terminals when hovering over an event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-terminalShowDelay)
     */
    terminalShowDelay? : number
    /**
     * Where (on event bar edges) to display terminals. The sides are `'start'`, `'top'`,
     * `'end'` and `'bottom'`
     */
    terminalSides? : string[]
    /**
     * Terminal diameter in px, overrides the default CSS value for it (which might depend on theme).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-terminalSize)
     */
    terminalSize? : number|string
    /**
     * The width/height (depending on vertical / horizontal mode) of all the time columns.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-tickSize)
     */
    tickSize? : number
    /**
     * A [TimeAxis](https://bryntum.com/products/gantt/docs/api/Scheduler/data/TimeAxis) config object or instance, used to create a backing data store of
     * 'ticks' providing the input date data for the time axis of timeline panel. Created automatically if none
     * supplied.
     */
    timeAxis? : TimeAxisConfig|TimeAxis
    /**
     * Inline time ranges, will be loaded into the backing project's time range store.
     */
    timeRanges? : TimeSpan[]|TimeSpanConfig[]
    /**
     * Gets/sets the current time resolution object, which contains a unit identifier and an increment count
     * `{ unit, increment }`. This value means minimal task duration you can create using UI.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-timeResolution)
     */
    timeResolution? : {
        increment?: number
        unit?: DurationUnit
    }|number
    /**
     * Set to a time zone or a UTC offset. This will set the projects
     * [timeZone](https://bryntum.com/products/gantt/docs/api/Scheduler/model/ProjectModel#config-timeZone) config accordingly. As this config is only a referer,
     * please see project's config [documentation](https://bryntum.com/products/gantt/docs/api/Scheduler/model/ProjectModel#config-timeZone) for more
     * information.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-timeZone)
     */
    timeZone? : string|number
    /**
     * A title to display in the header or owning TabPanel. Causes creation and docking of a header
     * to the top if no header is configured.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-title)
     */
    title? : string
    /**
     * True to toggle the collapsed/expanded state when clicking a parent task bar.
     */
    toggleParentTasksOnClick? : boolean
    /**
     * The [tools](https://bryntum.com/products/gantt/docs/api/Core/widget/Tool) to add either before or after the `title` in the Panel header. Each
     * property name is the reference by which an instantiated tool may be retrieved from the live
     * `[tools](https://bryntum.com/products/gantt/docs/api/Core/widget/mixin/Toolable#property-tools)` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-tools)
     */
    tools? : Record<string, ToolConfig>|null
    /**
     * A template function allowing you to configure the contents of the tooltip shown when hovering a
     * dependency line. You can return either an HTML string or a [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) object.
     * @param {Scheduler.model.DependencyBaseModel} dependency The dependency record
     * @returns {string,DomConfig}
     */
    tooltipTemplate? : (dependency: DependencyBaseModel) => string|DomConfig
    /**
     * Configure UI transitions for various actions in the grid.
     */
    transition? : {
        insertRecord?: boolean
        removeRecord?: boolean
        toggleColumn?: boolean
        expandCollapseColumn?: boolean
        toggleRegion?: boolean
        toggleTreeNode?: boolean
        toggleGroup?: boolean
        filterRemoval?: boolean
        removeEvent?: boolean
        changeEvent?: boolean
    }
    /**
     * Animation transition duration in milliseconds.
     */
    transitionDuration? : number
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-ui)
     */
    ui? : 'plain'|'toolbar'|string|object
    /**
     * By default, the day of week and week of month of the event's start date are used to create
     * helpful contextual recurrence types when editing a non-recurring event record and choosing
     * an initial recurrence type.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-useContextualRecurrenceRules)
     */
    useContextualRecurrenceRules? : boolean
    /**
     * A string key used to lookup a predefined [ViewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/ViewPreset) (e.g. 'weekAndDay', 'hourAndDay'),
     * managed by [PresetManager](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/PresetManager). See [PresetManager](#Scheduler/preset/PresetManager) for more information.
     * Or a config object for a viewPreset.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-viewPreset)
     */
    viewPreset? : string|ViewPresetConfig
    /**
     * A date to bring into view initially on the scrollable timeline.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-visibleDate)
     */
    visibleDate? : Date|VisibleDate
    /**
     * Integer number indicating the size of timespan during zooming. When zooming, the timespan is adjusted to make
     * the scrolling area `visibleZoomFactor` times wider than the timeline area itself. Used in
     * [zoomToSpan](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineZoomable#function-zoomToSpan) and [zoomToLevel](#Scheduler/view/mixin/TimelineZoomable#function-zoomToLevel) functions.
     */
    visibleZoomFactor? : number
    /**
     * A valid JS day index between 0-6 (0: Sunday, 1: Monday etc.) to be considered the start day of the week.
     * When omitted, the week start day is retrieved from the active locale class.
     */
    weekStartDay? : number
    /**
     * A widgets weight determines its position among siblings when added to a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container).
     * Higher weights go further down.
     */
    weight? : number
    /**
     * Widget's width, used to set element `style.width`. Either specify a valid width string or a number, which
     * will get 'px' appended. We recommend using CSS as the primary way to control width, but in some cases
     * this config is convenient.
     */
    width? : string|number
    /**
     * An object with format `{ fromDay, toDay, fromHour, toHour }` that describes the working days and hours.
     * This object will be used to populate TimeAxis [include](https://bryntum.com/products/gantt/docs/api/Scheduler/data/TimeAxis#config-include) property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-workingTime)
     */
    workingTime? : {
        fromDay?: number
        toDay?: number
        fromHour?: number
        toHour?: number
    }
    /**
     * Whether the originally rendered timespan should be preserved while zooming. By default, it is set to `false`,
     * meaning the timeline panel will adjust the currently rendered timespan to limit the amount of HTML content to
     * render. When setting this option to `true`, be careful not to allow to zoom a big timespan in seconds
     * resolution for example. That will cause <strong>a lot</strong> of HTML content to be rendered and affect performance. You
     * can use [minZoomLevel](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineZoomable#config-minZoomLevel) and [maxZoomLevel](#Scheduler/view/mixin/TimelineZoomable#config-maxZoomLevel) config options for that.
     */
    zoomKeepsOriginalTimespan? : boolean
    /**
     * If true, you can zoom in and out on the time axis using CTRL-key + mouse wheel.
     */
    zoomOnMouseWheel? : boolean
    /**
     * True to zoom to time span when double-clicking a time axis cell.
     */
    zoomOnTimeAxisDoubleClick? : boolean

    // Events
    /**
     * Fired on the owning Scheduler/Gantt after a dependency drag creation operation finished, no matter to outcome
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     * @param {Scheduler.model.TimeSpan} event.target The target task
     * @param {Scheduler.model.DependencyBaseModel} event.dependency The created dependency
     */
    onAfterDependencyCreateDrop? : ((event: { source: TimeSpan, target: TimeSpan, dependency: DependencyBaseModel }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget after a dependency is successfully saved using the
     * dependency edit popup
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler instance or Gantt instance
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The dependency about to be saved
     */
    onAfterDependencySave? : ((event: { source: Scheduler, dependencyRecord: SchedulerDependencyModel }) => void)|string
    /**
     * Fires on the owning Gantt at the end of the drag create gesture whether or not
     * a task was scheduled by the gesture.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {HTMLElement} event.proxyElement The element showing the drag creation zone.
     */
    onAfterDragCreate? : ((event: { source: Gantt, proxyElement: HTMLElement }) => void)|string
    /**
     * Fires on the owning Scheduler after editor is closed by any action - save, delete or cancel
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {'save','delete','cancel'} event.action The action that was taken to end the edit. One of 'save', 'delete' or 'cancel'
     * @param {Scheduler.feature.EventEdit} event.eventEdit The eventEdit feature
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record that has been edited.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The Resource record for the event. If the event is being created, it will not contain a resource, so this parameter specifies the resource the event is being created for.
     * @param {HTMLElement} event.eventElement The element which represents the event in the scheduler display.
     * @param {Core.widget.Popup} event.editor The editor
     */
    onAfterEventEdit? : ((event: { source: Scheduler, action: 'save'|'delete'|'cancel', eventEdit: EventEdit, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement, editor: Popup }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance after an event record is saved
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.eventRecord The event record about to be saved
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onAfterEventSave? : ((event: { source: SchedulerPro, eventRecord: EventModel, editor: TaskEditorBase }) => void)|string
    /**
     * Fires on the owning Gantt widget instance after project editing is finished by applying changes or
     * cancelling them.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.ProjectModel} event.projectRecord The edited project record
     * @param {Gantt.widget.ProjectEditor} event.editor The editor widget
     */
    onAfterProjectEdit? : ((event: { source: Gantt, projectRecord: ProjectModel, editor: ProjectEditor }) => void)|string
    /**
     * Fires on the owning Gantt widget instance after a project is saved
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.ProjectModel} event.projectRecord The project about to be saved
     * @param {Gantt.widget.ProjectEditor} event.editor The editor widget
     */
    onAfterProjectSave? : ((event: { source: Gantt, projectRecord: ProjectModel, editor: ProjectEditor }) => void)|string
    /**
     * Fires on the owning Gantt after a task drop, regardless if the drop validity
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords
     * @param {boolean} event.valid
     */
    onAfterTaskDrop? : ((event: { source: Gantt, taskRecords: TaskModel[], valid: boolean }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance after task editing is finished by applying changes, cancelling them
     * or deleting the task record.
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.taskRecord Task record used in the task editor
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onAfterTaskEdit? : ((event: { source: SchedulerPro, taskRecord: EventModel, editor: TaskEditorBase }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance after a task is saved
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.taskRecord The task about to be saved
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onAfterTaskSave? : ((event: { source: SchedulerPro, taskRecord: EventModel, editor: TaskEditorBase }) => void)|string
    /**
     * Fires on the owning Gantt after a task drop, regardless if the drop validity
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords Dropped segments
     * @param {boolean} event.valid
     */
    onAfterTaskSegmentDrop? : ((event: { source: Gantt, taskRecords: TaskModel[], valid: boolean }) => void)|string
    /**
     * Fires before an assignment is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or
     * by the event editor. Can for example be used to display a custom dialog to confirm deletion, in which
     * case records should be "manually" removed after confirmation:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeAssignmentDelete)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The Scheduler instance
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The assignment records about to be deleted
     * @param {object} event.context Additional removal context:
     * @param {Function} event.context.finalize Function to call to finalize the removal. Used to asynchronously decide to remove the records or not. Provide `false` to the function to prevent the removal.
     * @param {boolean} event.context.finalize.removeRecords Provide `false` to the function to prevent the removal.
     */
    onBeforeAssignmentDelete? : ((event: { source: Scheduler, assignmentRecords: SchedulerAssignmentModel[], context: { finalize: { removeRecords?: boolean } } }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before the cell editing is canceled, return `false` to prevent cancellation.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {Grid.util.GridLocation} event.editorContext Editing context
     */
    onBeforeCancelCellEdit? : ((event: { source: Grid, editorContext: GridLocation }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before the row editing is canceled, return false to signal that the value is invalid and editing should not be finalized.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeCancelRowEdit)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Target grid
     * @param {RowEditorContext} event.editorContext Editing context
     */
    onBeforeCancelRowEdit? : ((event: { grid: Grid, editorContext: RowEditorContext }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before editing starts, return `false` to prevent editing
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {CellEditorContext} event.editorContext Editing context
     */
    onBeforeCellEditStart? : ((event: { source: Grid, editorContext: CellEditorContext }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before deleting a range of selected cell values by pressing `Backspace` or `Del`
     * buttons while [autoEdit](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellEdit#config-autoEdit) is set to `true`. Return `false` to prevent editing.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {(Grid.util.GridLocation|Core.data.Model)[]} event.gridSelection An array of cell selectors or records that will have their values deleted (the records themselves will not get deleted, only visible column values).
     */
    onBeforeCellRangeDelete? : ((event: { source: Grid, gridSelection: (GridLocation|Model)[] }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires for each selected record on the owning Grid before editing a range of selected cell values
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Current selected record from the range
     * @param {string} event.field The field being changed
     * @param {any} event.value The value being set
     */
    onBeforeCellRangeEdit? : ((event: { record: Model, field: string, value: any }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired prior to starting a column drag gesture. The drag is canceled if a listener returns `false`.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance.
     * @param {Grid.column.Column} event.column The dragged column.
     * @param {Event} event.event The browser event.
     */
    onBeforeColumnDragStart? : ((event: { source: Grid, column: Column, event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired when a column is dropped, and you can return false from a listener to abort the operation.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance.
     * @param {Grid.column.Column} event.column The dragged column.
     * @param {Grid.column.Column} event.insertBefore The column before which the dragged column will be inserted.
     * @param {Grid.column.Column} event.newParent The new parent column.
     * @param {Event} event.event The browser event.
     * @param {string} event.region The region where the column was dropped.
     */
    onBeforeColumnDropFinalize? : ((event: { source: Grid, column: Column, insertBefore: Column, newParent: Column, event: Event, region: string }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired prior to starting a column resize gesture. The resize is canceled if a listener returns
     * `false`.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Grid.column.Column} event.column The column
     * @param {Event} event.domEvent The browser event
     */
    onBeforeColumnResize? : ((event: { source: Grid, column: Column, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before a copy action is performed, return `false` to prevent the action
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {Grid.util.GridLocation[]} event.cells The cells about to be copied or cut
     * @param {string} event.data The string data about to be copied or cut
     * @param {boolean} event.isCut `true` if this is a cut action
     * @param {string} event.entityName 'cell' to distinguish this event from other beforeCopy events
     */
    onBeforeCopy? : ((event: { source: Grid, cells: GridLocation[], data: string, isCut: boolean, entityName: string }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before CSV export starts. Return `false` to cancel the export.
     * @param {object} event Event object
     * @param {ExportConfig} event.config Export config
     * @param {Grid.column.Column[]} event.columns An array of columns to export
     * @param {Core.data.Model[]} event.rows An array of records to export
     * @param {string} event.lineDelimiter The CSV delimiter to separate lines
     * @param {string} event.columnDelimiter The CSV delimiter to separate values on one line
     */
    onBeforeCSVExport? : ((event: { config: ExportConfig, columns: Column[], rows: Model[], lineDelimiter: string, columnDelimiter: string }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before a dependency is added from the dependency
     * edit popup
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler or Gantt instance
     * @param {Scheduler.feature.SchedulerDependencyEdit} event.dependencyEdit The dependency edit feature
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The dependency about to be added
     */
    onBeforeDependencyAdd? : ((event: { source: Scheduler, dependencyEdit: SchedulerDependencyEdit, dependencyRecord: SchedulerDependencyModel }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler/Gantt before a dependency creation drag operation starts. Return `false` to
     * prevent it
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     */
    onBeforeDependencyCreateDrag? : ((event: { source: TimeSpan }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler/Gantt when a dependency drag creation operation is about to finalize
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     * @param {Scheduler.model.TimeSpan} event.target The target task
     * @param {'start','end','top','bottom'} event.fromSide The from side (start / end / top / bottom)
     * @param {'start','end','top','bottom'} event.toSide The to side (start / end / top / bottom)
     */
    onBeforeDependencyCreateFinalize? : ((event: { source: TimeSpan, target: TimeSpan, fromSide: 'start'|'end'|'top'|'bottom', toSide: 'start'|'end'|'top'|'bottom' }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before a dependency is deleted from the dependency
     * edit popup, or when clicking the delete icon on a selected dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler instance
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The dependency record about to be deleted
     */
    onBeforeDependencyDelete? : ((event: { source: Scheduler, dependencyRecord: SchedulerDependencyModel }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before an dependency is displayed in the editor.
     * This may be listened for to allow an application to take over dependency editing duties. Return `false` to
     * stop the default editing UI from being shown or a `Promise` yielding `true` or `false` for async vetoing.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler or Gantt instance
     * @param {Scheduler.feature.SchedulerDependencyEdit} event.dependencyEdit The dependencyEdit feature
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The record about to be shown in the editor.
     */
    onBeforeDependencyEdit? : ((event: { source: Scheduler, dependencyEdit: SchedulerDependencyEdit, dependencyRecord: SchedulerDependencyModel }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget when the editor for a dependency is available, but before it is shown. Allows
     * manipulating fields before the widget is shown.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler or Gantt instance
     * @param {Scheduler.feature.SchedulerDependencyEdit} event.dependencyEdit The dependencyEdit feature
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The record about to be shown in the editor.
     * @param {Core.widget.Popup} event.editor The editor popup
     */
    onBeforeDependencyEditShow? : ((event: { source: Scheduler, dependencyEdit: SchedulerDependencyEdit, dependencyRecord: SchedulerDependencyModel, editor: Popup }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before a dependency is saved using the dependency edit popup
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler or Gantt instance
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord The dependency about to be saved
     * @param {object} event.values The new values
     */
    onBeforeDependencySave? : ((event: { source: Scheduler, dependencyRecord: SchedulerDependencyModel, values: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onBeforeDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Fires on the owning Gantt at the beginning of the drag gesture
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {Date} event.date The datetime associated with the drag start point.
     */
    onBeforeDragCreate? : ((event: { source: Gantt, taskRecord: TaskModel, date: Date }) => void)|string
    /**
     * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
     * in the listener, to show a confirmation popup etc
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeDragCreateFinalize)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Scheduler instance
     * @param {HTMLElement} event.proxyElement Proxy element, representing future event
     * @param {object} event.context
     * @param {boolean} event.context.async Set true to handle drag create asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize drag create. This method accepts one argument: pass true to update records, or false, to ignore changes
     */
    onBeforeDragCreateFinalize? : ((event: { source: Gantt, proxyElement: HTMLElement, context: { async: boolean, finalize: Function } }) => void)|string
    /**
     * Fires before an event is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or by the
     * event editor. Return `false` to immediately veto the removal (or a `Promise` yielding `true` or `false`
     * for async vetoing).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeEventDelete)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler,any} event.source The Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords The records about to be deleted
     * @param {object} event.context Additional removal context:
     * @param {Function} event.context.finalize Function to call to finalize the removal. Used to asynchronously decide to remove the records or not. Provide `false` to the function to prevent the removal.
     * @param {boolean} event.context.finalize.removeRecords Provide `false` to the function to prevent the removal.
     */
    onBeforeEventDelete? : ((event: { source: Scheduler|any, eventRecords: SchedulerEventModel[], context: { finalize: { removeRecords?: boolean } } }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler before an event is displayed in an editor.
     * This may be listened for to allow an application to take over event editing duties. Returning `false`
     * stops the default editing UI from being shown.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeEventEdit)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.feature.EventEdit} event.eventEdit The eventEdit feature
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record about to be shown in the event editor.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The Resource record for the event. If the event is being created, it will not contain a resource, so this parameter specifies the resource the event is being created for.
     * @param {HTMLElement} event.eventElement The element which represents the event in the scheduler display.
     */
    onBeforeEventEdit? : ((event: { source: Scheduler, eventEdit: EventEdit, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler when the editor for an event is available but before it is populated with
     * data and shown. Allows manipulating fields etc.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.feature.EventEdit} event.eventEdit The eventEdit feature
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record about to be shown in the event editor.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The Resource record for the event. If the event is being created, it will not contain a resource, so this parameter specifies the resource the event is being created for.
     * @param {HTMLElement} event.eventElement The element which represents the event in the scheduler display.
     * @param {Core.widget.Popup} event.editor The editor
     */
    onBeforeEventEditShow? : ((event: { source: Scheduler, eventEdit: EventEdit, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement, editor: Popup }) => void)|string
    /**
     * Fired on the owning Scheduler before resizing starts. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record being resized
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     */
    onBeforeEventResize? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler to allow implementer to prevent immediate finalization by returning a promise
     * in the listener, to show a confirmation popup etc
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeEventResizeFinalize)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {object} event.context [DEPRECATED] de-nested to outer params object
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record being resized
     * @param {Date} event.startDate New startDate (changed if resizing start side)
     * @param {Date} event.endDate New endDate (changed if resizing end side)
     * @param {Date} event.originalStartDate Start date before resize
     * @param {Date} event.originalEndDate End date before resize
     * @param {boolean} event.async Set true to handle resize asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.finalize Call this method to finalize resize. This method accepts one argument: pass `true` to update records, or `false`, to ignore changes
     * @param {Event} event.event Browser event
     * @param {EventResizeData[]} event.resizeData Data of all events that are being resized
     */
    onBeforeEventResizeFinalize? : ((event: { source: Scheduler, context: object, eventRecord: SchedulerEventModel, startDate: Date, endDate: Date, originalStartDate: Date, originalEndDate: Date, async: boolean, finalize: Function, event: Event, resizeData: EventResizeData[] }) => Promise<void>)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance before an event record is saved, return `false` to prevent it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeEventSave)
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.eventRecord The event record about to be saved
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onBeforeEventSave? : ((event: { source: SchedulerPro, eventRecord: EventModel, editor: TaskEditorBase }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler Pro before resizing starts. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.eventRecord Segment being resized
     * @param {SchedulerPro.model.SchedulerProResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     */
    onBeforeEventSegmentResize? : ((event: { source: SchedulerPro, eventRecord: EventModel, resourceRecord: SchedulerProResourceModel, event: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler Pro to allow implementer to prevent immediate finalization by setting
     * `data.context.async = true` in the listener, to show a confirmation popup etc
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeEventSegmentResizeFinalize)
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source Scheduler Pro instance
     * @param {object} event.context
     * @param {boolean} event.context.async Set true to handle resize asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize resize. This method accepts one argument: pass `true` to update records, or `false`, to ignore changes
     */
    onBeforeEventSegmentResizeFinalize? : ((event: { source: SchedulerPro, context: { async: boolean, finalize: Function } }) => void)|string
    /**
     * Fires on the owning Grid before Excel export starts. Return `false` to cancel the export.
     * @param {object} event Event object
     * @param {ExportConfig} event.config Export config
     * @param {XLSColumn[]} event.columns An array of columns to export
     * @param {any[][]} event.rows An array of records to export
     */
    onBeforeExcelExport? : ((event: { config: ExportConfig, columns: XLSColumn[], rows: any[] }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before dragging of the FillHandle starts, return `false` to prevent the drag operation.
     * @param {object} event Event object
     * @param {Grid.util.GridLocation} event.cell Information about the column / record
     * @param {MouseEvent} event.domEvent The raw DOM event
     */
    onBeforeFillHandleDragStart? : ((event: { cell: GridLocation, domEvent: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before the cell editing is finished, return false to signal that the value is invalid and editing should not be finalized.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Target grid
     * @param {CellEditorContext} event.editorContext Editing context
     */
    onBeforeFinishCellEdit? : ((event: { grid: Grid, editorContext: CellEditorContext }) => void)|string
    /**
     * Fires on the owning Grid before the row editing is finished, return false to signal that the value is invalid and editing should not be finalized.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeFinishRowEdit)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Target grid
     * @param {RowEditorContext} event.editorContext Editing context
     */
    onBeforeFinishRowEdit? : ((event: { grid: Grid, editorContext: RowEditorContext }) => Promise<boolean>|boolean|void)|string
    /**
     * Triggered before a widget is hidden. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget being hidden.
     */
    onBeforeHide? : ((event: { source: Widget }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt before export starts. Return `false` to cancel the export.
     * @param {object} event Event object
     * @param {object} event.config Export config
     */
    onBeforeMspExport? : ((event: { config: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before pan starts. Return `false` to prevent the operation.
     * @param {object} event Event object
     * @param {Event} event.event The native browser DOM event
     */
    onBeforePan? : ((event: { event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before a paste action is performed, return `false` to prevent the action
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {string} event.clipboardData The clipboardData about to be pasted
     * @param {Grid.util.GridLocation} event.targetCell The cell from which the paste will be started
     * @param {string} event.entityName 'cell' to distinguish this event from other beforePaste events
     */
    onBeforePaste? : ((event: { source: Grid, clipboardData: string, targetCell: GridLocation, entityName: string }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before export started. Return `false` to cancel the export.
     * @param {object} event Event object
     * @param {object} event.config Export config
     */
    onBeforePdfExport? : ((event: { config: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before the [viewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineViewPresets#config-viewPreset) is changed.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler instance.
     * @param {Date} event.startDate The new start date of the timeline.
     * @param {Date} event.endDate The new end date of the timeline.
     * @param {Scheduler.preset.ViewPreset} event.from The outgoing ViewPreset.
     * @param {Scheduler.preset.ViewPreset} event.to The ViewPreset being switched to.
     */
    onBeforePresetChange? : ((event: { source: Scheduler, startDate: Date, endDate: Date, from: ViewPreset, to: ViewPreset }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt widget instance before a project is displayed in the editor.
     * This may be listened to in order to take over the project editing flow. Returning `false`
     * stops the default editing UI from being shown.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeProjectEdit)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.feature.ProjectEdit} event.projectEdit The projectEdit feature
     * @param {Gantt.model.ProjectModel} event.projectRecord The project about to be shown in the editor.
     */
    onBeforeProjectEdit? : ((event: { source: Gantt, projectEdit: ProjectEdit, projectRecord: ProjectModel }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt widget when the editor for a project is available but
     * before it is shown. Allows manipulating fields etc.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.feature.ProjectEdit} event.projectEdit The projectEdit feature
     * @param {Gantt.model.ProjectModel} event.projectRecord The project about to be shown in the editor.
     * @param {Gantt.widget.ProjectEditor} event.editor The editor
     */
    onBeforeProjectEditShow? : ((event: { source: Gantt, projectEdit: ProjectEdit, projectRecord: ProjectModel, editor: ProjectEditor }) => void)|string
    /**
     * Fires on the owning Gantt widget instance before a project is saved, return `false` to prevent it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeProjectSave)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.ProjectModel} event.projectRecord The project about to be saved
     * @param {Gantt.widget.ProjectEditor} event.editor The editor widget
     */
    onBeforeProjectSave? : ((event: { source: Gantt, projectRecord: ProjectModel, editor: ProjectEditor }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before a row is rendered.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {Grid.row.Row} event.row The row about to be rendered.
     * @param {Core.data.Model} event.record The record for the row.
     * @param {number} event.recordIndex The zero-based index of the record.
     */
    onBeforeRenderRow? : ((event: { source: Grid, row: Row, record: Model, recordIndex: number }) => void)|string
    /**
     * Grid rows are about to be rendered
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source This grid.
     */
    onBeforeRenderRows? : ((event: { source: Grid }) => void)|string
    /**
     * This event fires before row collapse is started.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeRowCollapse)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onBeforeRowCollapse? : ((event: { record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires before row expand is started.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeRowExpand)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onBeforeRowExpand? : ((event: { record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before the selection changes. Returning `false` from a listener prevents the change
     * @param {object} event Event object
     * @param {string} event.action `'select'`/`'deselect'`
     * @param {'row','cell'} event.mode `'row'`/`'cell'`
     * @param {Grid.view.Grid} event.source
     * @param {Core.data.Model[]} event.deselected The records to be deselected in this operation.
     * @param {Core.data.Model[]} event.selected The records to be selected in this operation.
     * @param {Core.data.Model[]} event.selection The records in the current selection, before applying `selected` and `deselected`
     * @param {Grid.util.GridLocation[]} event.deselectedCells The cells to be deselected in this operation.
     * @param {Grid.util.GridLocation[]} event.selectedCells The cells to be selected in this operation.
     * @param {Grid.util.GridLocation[]} event.cellSelection The cells in the current selection, before applying `selectedCells` and `deselectedCells`
     */
    onBeforeSelectionChange? : ((event: { action: string, mode: 'row'|'cell', source: Grid, deselected: Model[], selected: Model[], selection: Model[], deselectedCells: GridLocation[], selectedCells: GridLocation[], cellSelection: GridLocation[] }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before this container will load record values into its child fields. This is useful if you
     * want to modify the UI before data is loaded (e.g. set some input field to be readonly)
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The container
     * @param {Core.data.Model} event.record The record
     */
    onBeforeSetRecord? : ((event: { source: Container, record: Model }) => void)|string
    /**
     * Triggered before a widget is shown. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Core.widget.Widget,any} event.source The widget being shown
     */
    onBeforeShow? : ((event: { source: Widget|any }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler/Gantt before showing dependency terminals on a task or event. Return `false` to
     * prevent it
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The hovered task
     */
    onBeforeShowTerminals? : ((event: { source: TimeSpan }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid before editing starts, return `false` to prevent editing
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {RowEditorContext} event.editorContext Editing context
     */
    onBeforeStartRowEdit? : ((event: { source: Grid, editorContext: RowEditorContext }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before state is applied to the source. Allows editing the state object or preventing the operation.
     * @param {object} event Event object
     * @param {GridStateInfo} event.state State object config
     */
    onBeforeStateApply? : ((event: { state: GridStateInfo }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before state is saved by the StateProvider. Allows editing the state object or preventing the operation.
     * @param {object} event Event object
     * @param {GridStateInfo} event.state State object config
     */
    onBeforeStateSave? : ((event: { state: GridStateInfo }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires when adding a task from the UI to allow data mutation.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The task
     */
    onBeforeTaskAdd? : ((event: { source: Gantt, taskRecord: TaskModel }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget before a task is deleted, return `false` to prevent it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskDelete)
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance.
     * @param {SchedulerPro.model.EventModel} event.taskRecord The record about to be deleted
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onBeforeTaskDelete? : ((event: { source: SchedulerPro, taskRecord: EventModel, editor: TaskEditorBase }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt before task dragging starts. Return false to prevent the action.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {Event} event.event The native browser event
     */
    onBeforeTaskDrag? : ((event: { source: Gantt, taskRecord: TaskModel, event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
     * in the listener, to show a confirmation popup etc
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskDropFinalize)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {object} event.context
     * @param {Gantt.model.TaskModel[]} event.context.taskRecords The dragged task records
     * @param {boolean} event.context.valid Set this to `false` to mark the drop as invalid
     * @param {boolean} event.context.async Set true to handle dragdrop asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize dragdrop. This method accepts one argument: pass true to update records, or false, to ignore changes
     */
    onBeforeTaskDropFinalize? : ((event: { source: Gantt, context: { taskRecords: TaskModel[], valid: boolean, async: boolean, finalize: Function } }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance before a task is displayed in the editor.
     * This may be listened to in order to take over the task editing flow. Returning `false`
     * stops the default editing UI from being shown.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskEdit)
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.feature.SchedulerProTaskEdit} event.taskEdit The taskEdit feature
     * @param {SchedulerPro.model.EventModel} event.taskRecord The task about to be shown in the editor.
     * @param {HTMLElement} event.taskElement The element which represents the task
     */
    onBeforeTaskEdit? : ((event: { source: SchedulerPro, taskEdit: SchedulerProTaskEdit, taskRecord: EventModel, taskElement: HTMLElement }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget when the editor for an event is available but before it is shown. Allows
     * manipulating fields etc.
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The SchedulerPro instance
     * @param {SchedulerPro.feature.SchedulerProTaskEdit} event.taskEdit The taskEdit feature
     * @param {SchedulerPro.model.EventModel} event.taskRecord The task about to be shown in the editor.
     * @param {HTMLElement} event.eventElement The element which represents the task
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor
     */
    onBeforeTaskEditShow? : ((event: { source: SchedulerPro, taskEdit: SchedulerProTaskEdit, taskRecord: EventModel, eventElement: HTMLElement, editor: TaskEditorBase }) => void)|string
    /**
     * Fires on the owning Gantt before resizing starts. Return `false` to prevent the operation.
     * @param {object} event Event object
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {Event} event.event
     */
    onBeforeTaskResize? : ((event: { taskRecord: TaskModel, event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting
     * `data.context.async = true` in the listener, to show a confirmation popup etc.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskResizeFinalize)
     * @param {object} event Event object
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {object} event.context
     * @param {Date} event.context.endDate New endDate
     * @param {Date} event.context.originalEndDate End date before resize
     * @param {TaskResizeData[]} event.context.resizeData Resize data for selected tasks. Only available when [resizeSelected](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskResize#config-resizeSelected) is `true`.
     * @param {Event} event.event Browser event
     * @param {boolean} event.context.async Set true to handle resize asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize resize. This method accepts one argument: pass true to update records, or false, to ignore changes
     */
    onBeforeTaskResizeFinalize? : ((event: { taskRecord: TaskModel, source: Gantt, context: { endDate: Date, originalEndDate: Date, resizeData: TaskResizeData[], async: boolean, finalize: Function }, event: Event }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget instance before a task is saved, return `false` to prevent it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskSave)
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.taskRecord The task about to be saved
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor widget
     */
    onBeforeTaskSave? : ((event: { source: SchedulerPro, taskRecord: EventModel, editor: TaskEditorBase }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt before segment dragging starts. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel} event.taskRecord The segment about to be dragged
     * @param {Event} event.event The native browser event
     */
    onBeforeTaskSegmentDrag? : ((event: { source: Gantt, taskRecord: TaskModel, event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
     * in the listener, to show a confirmation popup etc
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskSegmentDropFinalize)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {object} event.context
     * @param {Gantt.model.TaskModel[]} event.context.taskRecords Dragged segments
     * @param {boolean} event.context.valid Set this to `false` to mark the drop as invalid
     * @param {boolean} event.context.async Set true to handle dragdrop asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize dragdrop. This method accepts one argument: pass true to update records, or false, to ignore changes
     */
    onBeforeTaskSegmentDropFinalize? : ((event: { source: Gantt, context: { taskRecords: TaskModel[], valid: boolean, async: boolean, finalize: Function } }) => void)|string
    /**
     * Fired on the owning Gantt before resizing starts. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord Segment being resized
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     */
    onBeforeTaskSegmentResize? : ((event: { source: Gantt, taskRecord: TaskModel, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Gantt to allow implementer to prevent immediate finalization by setting
     * `data.context.async = true` in the listener, to show a confirmation popup etc.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-beforeTaskSegmentResizeFinalize)
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {object} event.context
     * @param {boolean} event.context.async Set true to handle resize asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize resize. This method accepts one argument: pass `true` to update records, or `false`, to ignore changes
     */
    onBeforeTaskSegmentResizeFinalize? : ((event: { source: Gantt, context: { async: boolean, finalize: Function } }) => void)|string
    /**
     * Fired when a group is going to be expanded or collapsed using the UI.
     * Returning `false` from a listener prevents the operation
     * @param {object} event Event object
     * @param {Core.data.Model} event.groupRecord [DEPRECATED] Use `groupRecords` param instead
     * @param {Core.data.Model[]} event.groupRecords The group records being toggled
     * @param {boolean} event.collapse Collapsed (true) or expanded (false)
     * @param {Event} event.domEvent The user interaction event (eg a `click` event) if the toggle request was instigated by user interaction.
     */
    onBeforeToggleGroup? : ((event: { groupRecord: Model, groupRecords: Model[], collapse: boolean, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before a parent node record toggles its collapsed state.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {Core.data.Model} event.record The record being toggled.
     * @param {boolean} event.collapse `true` if the node is being collapsed.
     */
    onBeforeToggleNode? : ((event: { source: Grid, record: Model, collapse: boolean }) => void)|string
    /**
     * Fires on the owning Grid when editing is cancelled
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {Grid.util.GridLocation} event.editorContext Editing context
     * @param {Event} event.event Included if the cancellation was triggered by a DOM event
     */
    onCancelCellEdit? : ((event: { source: Grid, editorContext: GridLocation, event: Event }) => void)|string
    /**
     * Fires when any other event is fired from the object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-catchAll)
     * @param {object} event Event object
     * @param {{[key: string]: any, type: string}} event.event The Object that contains event details
     * @param {string} event.event.type The type of the event which is caught by the listener
     */
    onCatchAll? : ((event: {[key: string]: any, type: string}) => void)|string
    /**
     * Fired when user clicks in a grid cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid The grid instance
     * @param {Core.data.Model} event.record The record representing the row
     * @param {Grid.column.Column} event.column The column to which the cell belongs
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {HTMLElement} event.target The target element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellClick? : ((event: { grid: Grid, record: Model, column: Column, cellElement: HTMLElement, target: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when user activates contextmenu in a grid cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid The grid instance
     * @param {Core.data.Model} event.record The record representing the row
     * @param {Grid.column.Column} event.column The column to which the cell belongs
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {HTMLElement} event.target The target element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellContextMenu? : ((event: { grid: Grid, record: Model, column: Column, cellElement: HTMLElement, target: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when user double clicks a grid cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid The grid instance
     * @param {Core.data.Model} event.record The record representing the row
     * @param {Grid.column.Column} event.column The column to which the cell belongs
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {HTMLElement} event.target The target element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellDblClick? : ((event: { grid: Grid, record: Model, column: Column, cellElement: HTMLElement, target: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * This event fires on the owning grid before the context menu is shown for a cell.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-cellMenuBeforeShow)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Column
     * @param {Core.data.Model} event.record Record
     */
    onCellMenuBeforeShow? : ((event: { source: Grid, menu: Menu, items: Record<string, MenuItemConfig>, column: Column, record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning grid when an item is selected in the cell context menu.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Grid.column.Column} event.column Column
     * @param {Core.data.Model} event.record Record
     */
    onCellMenuItem? : ((event: { source: Grid, menu: Menu, item: MenuItem, column: Column, record: Model }) => void)|string
    /**
     * This event fires on the owning grid after the context menu is shown for a cell.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Column
     * @param {Core.data.Model} event.record Record
     */
    onCellMenuShow? : ((event: { source: Grid, menu: Menu, items: Record<string, MenuItemConfig>, column: Column, record: Model }) => void)|string
    /**
     * This event fires on the owning grid when a check item is toggled in the cell context menu.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Grid.column.Column} event.column Column
     * @param {Core.data.Model} event.record Record
     * @param {boolean} event.checked Checked or not
     */
    onCellMenuToggleItem? : ((event: { source: Grid, menu: Menu, item: MenuItem, column: Column, record: Model, checked: boolean }) => void)|string
    /**
     * Fired when the mouse enters a cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Core.data.Model} event.record The record representing the hovered cell
     * @param {Grid.column.Column} event.column The column currently hovered
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellMouseEnter? : ((event: { source: Grid, record: Model, column: Column, cellElement: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when the mouse leaves a cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Core.data.Model} event.record The record representing the cell that the mouse left
     * @param {Grid.column.Column} event.column The column representing the cell that the mouse left
     * @param {HTMLElement} event.cellElement The cell HTML element that the mouse left
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellMouseLeave? : ((event: { source: Grid, record: Model, column: Column, cellElement: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when a user moves the mouse out of a grid cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid The grid instance
     * @param {Core.data.Model} event.record The record representing the row
     * @param {Grid.column.Column} event.column The column to which the cell belongs
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {HTMLElement} event.target The target element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellMouseOut? : ((event: { grid: Grid, record: Model, column: Column, cellElement: HTMLElement, target: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when user moves the mouse over a grid cell
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid The grid instance
     * @param {Core.data.Model} event.record The record representing the row
     * @param {Grid.column.Column} event.column The column to which the cell belongs
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {HTMLElement} event.target The target element
     * @param {MouseEvent} event.event The native DOM event
     */
    onCellMouseOver? : ((event: { grid: Grid, record: Model, column: Column, cellElement: HTMLElement, target: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fires when a Panel is collapsed using the [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible) setting.
     * @param {object} event Event object
     * @param {Core.widget.Panel} event.source This Panel.
     */
    onCollapse? : ((event: { source: Panel }) => void)|string
    /**
     * Fired before a parent node record is collapsed.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {Core.data.Model} event.record The record which has been collapsed.
     */
    onCollapseNode? : ((event: { source: Grid, record: Model }) => void)|string
    /**
     * This event is fired when a column is being dragged, and you can set the `valid` flag on the `context` object
     * to indicate whether the drop position is valid or not.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance.
     * @param {Grid.column.Column} event.column The dragged column.
     * @param {Grid.column.Column} event.insertBefore The column before which the dragged column will be inserted (if not last).
     * @param {Event} event.event The browser event.
     * @param {object} event.context
     * @param {boolean} event.context.valid Set this to `true` or `false` to indicate whether the drop position is valid.
     */
    onColumnDrag? : ((event: { source: Grid, column: Column, insertBefore: Column, event: Event, context: { valid: boolean } }) => void)|string
    /**
     * This event is fired when a column drag gesture has started.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance.
     * @param {Grid.column.Column} event.column The dragged column.
     * @param {Event} event.event The browser event.
     */
    onColumnDragStart? : ((event: { source: Grid, column: Column, event: Event }) => void)|string
    /**
     * This event is always fired after a column is dropped. The `valid` param is `true` if the operation was not
     * vetoed and the column was moved in the column store.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance.
     * @param {Grid.column.Column} event.column The dragged column.
     * @param {Grid.column.Column} event.insertBefore The column before which the dragged column will be inserted.
     * @param {Grid.column.Column} event.newParent The new parent column.
     * @param {boolean} event.valid `true` if the operation was not vetoed.
     * @param {Event} event.event The browser event.
     * @param {string} event.region The region where the column was dropped.
     */
    onColumnDrop? : ((event: { source: Grid, column: Column, insertBefore: Column, newParent: Column, valid: boolean, event: Event, region: string }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired after a resize gesture is completed.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Grid.column.Column} event.column The resized column
     * @param {Event} event.domEvent The browser event
     */
    onColumnResize? : ((event: { source: Grid, column: Column, domEvent: Event }) => void)|string
    /**
     * This event is fired when a column resize gesture starts.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Grid.column.Column} event.column The column
     * @param {Event} event.domEvent The browser event
     */
    onColumnResizeStart? : ((event: { source: Grid, column: Column, domEvent: Event }) => void)|string
    /**
     * This event fires on the owning widget when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The owning widget
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     */
    onContextMenuItem? : ((event: { source: Widget, menu: Menu, item: MenuItem }) => void)|string
    /**
     * This event fires on the owning widget when a check item is toggled in the context menu.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The owning widget
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {boolean} event.checked Checked or not
     */
    onContextMenuToggleItem? : ((event: { source: Widget, menu: Menu, item: MenuItem, checked: boolean }) => void)|string
    /**
     * Fires on the owning Grid after a copy action is performed.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {Grid.util.GridLocation[]} event.cells The cells about to be copied or cut
     * @param {string} event.copiedDataString The concatenated data string that was copied or cut
     * @param {boolean} event.isCut `true` if this was a cut action
     * @param {string} event.entityName 'cell' to distinguish this event from other copy events
     */
    onCopy? : ((event: { source: Grid, cells: GridLocation[], copiedDataString: string, isCut: boolean, entityName: string }) => void)|string
    /**
     * Fired when critical paths get highlighted.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-criticalPathsHighlighted)
     */
    onCriticalPathsHighlighted? : (() => void)|string
    /**
     * Fired when critical paths get hidden.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-criticalPathsUnhighlighted)
     */
    onCriticalPathsUnhighlighted? : (() => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when the line indicating the current time is updated (see [currentTimeLineUpdateInterval](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges#config-currentTimeLineUpdateInterval)).
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Date} event.date The current date
     */
    onCurrentTimelineUpdate? : ((event: { source: Scheduler, date: Date }) => void)|string
    /**
     * Fired when data in the store changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-dataChange)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owning grid
     * @param {Core.data.Store} event.store The originating store
     * @param {'remove','removeAll','add','clearchanges','filter','update','dataset','replace'} event.action Name of action which triggered the change. May be one of:  * `'remove'` * `'removeAll'` * `'add'` * `'clearchanges'` * `'filter'` * `'update'` * `'dataset'` * `'replace'`
     * @param {Core.data.Model} event.record Changed record, for actions that affects exactly one record (`'update'`)
     * @param {Core.data.Model[]} event.records Changed records, passed for all actions except `'removeAll'`
     * @param {object} event.changes Passed for the `'update'` action, info on which record fields changed
     */
    onDataChange? : ((event: { source: Grid, store: Store, action: 'remove'|'removeAll'|'add'|'clearchanges'|'filter'|'update'|'dataset'|'replace', record: Model, records: Model[], changes: object }) => void)|string
    /**
     * Fired when the range of dates encapsulated by the UI changes. This will be when
     * moving a view in time by reconfiguring its [timeAxis](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-timeAxis). This will happen
     * when zooming, or changing [viewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-viewPreset).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-dateRangeChange)
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source This Scheduler/Gantt instance.
     * @param {object} event.old The old date range
     * @param {Date} event.old.startDate the old start date.
     * @param {Date} event.old.endDate the old end date.
     * @param {object} event.new The new date range
     * @param {Date} event.new.startDate the new start date.
     * @param {Date} event.new.endDate the new end date.
     */
    onDateRangeChange? : ((event: { source: TimelineBase, old: { startDate: Date, endDate: Date }, new: { startDate: Date, endDate: Date } }) => void)|string
    /**
     * Fired when dependencies are rendered
     */
    onDependenciesDrawn? : (() => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when a click is registered on a dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependency
     * @param {MouseEvent} event.event
     */
    onDependencyClick? : ((event: { source: Scheduler, dependency: SchedulerDependencyModel, event: MouseEvent }) => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when a context menu event is registered on a dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependency
     * @param {MouseEvent} event.event
     */
    onDependencyContextMenu? : ((event: { source: Scheduler, dependency: SchedulerDependencyModel, event: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler/Gantt when a dependency creation drag operation starts
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     */
    onDependencyCreateDragStart? : ((event: { source: TimeSpan }) => void)|string
    /**
     * Fired on the owning Scheduler/Gantt when a dependency drag creation operation succeeds
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     * @param {Scheduler.model.TimeSpan} event.target The target task
     * @param {Scheduler.model.DependencyBaseModel} event.dependency The created dependency
     */
    onDependencyCreateDrop? : ((event: { source: TimeSpan, target: TimeSpan, dependency: DependencyBaseModel }) => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when a double click is registered on a dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependency
     * @param {MouseEvent} event.event
     */
    onDependencyDblClick? : ((event: { source: Scheduler, dependency: SchedulerDependencyModel, event: MouseEvent }) => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when the mouse moves out of a dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependency
     * @param {MouseEvent} event.event
     */
    onDependencyMouseOut? : ((event: { source: Scheduler, dependency: SchedulerDependencyModel, event: MouseEvent }) => void)|string
    /**
     * Fires on the owning Scheduler/Gantt when the mouse moves over a dependency line.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependency
     * @param {MouseEvent} event.event
     */
    onDependencyMouseOver? : ((event: { source: Scheduler, dependency: SchedulerDependencyModel, event: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler/Gantt when asynchronous dependency validation completes
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     * @param {Scheduler.model.TimeSpan} event.target The target task
     * @param {number} event.dependencyType The dependency type, see [Type](https://bryntum.com/products/gantt/docs/api/Scheduler/model/DependencyBaseModel#property-Type-static)
     */
    onDependencyValidationComplete? : ((event: { source: TimeSpan, target: TimeSpan, dependencyType: number }) => void)|string
    /**
     * Fired on the owning Scheduler/Gantt when asynchronous dependency validation starts
     * @param {object} event Event object
     * @param {Scheduler.model.TimeSpan} event.source The source task
     * @param {Scheduler.model.TimeSpan} event.target The target task
     * @param {number} event.dependencyType The dependency type, see [Type](https://bryntum.com/products/gantt/docs/api/Scheduler/model/DependencyBaseModel#property-Type-static)
     */
    onDependencyValidationStart? : ((event: { source: TimeSpan, target: TimeSpan, dependencyType: number }) => void)|string
    /**
     * Fires when an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Fires when a field is mutated and the state of the [hasChanges](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-hasChanges) property changes
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The container.
     * @param {boolean} event.dirty The dirty state of the Container - `true` if there are any fields which have been changed since initial load.
     */
    onDirtyStateChange? : ((event: { source: Container, dirty: boolean }) => void)|string
    /**
     * Fires on the owning Gantt after the task has been scheduled.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {MouseEvent} event.event The ending mouseup event.
     * @param {HTMLElement} event.proxyElement The proxy element showing the drag creation zone.
     */
    onDragCreateEnd? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent, proxyElement: HTMLElement }) => void)|string
    /**
     * Fires on the owning Gantt after the drag start has created a proxy element.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {HTMLElement} event.proxyElement The proxy representing the new event.
     */
    onDragCreateStart? : ((event: { source: Gantt, proxyElement: HTMLElement }) => void)|string
    /**
     * Fires while drag selecting. UI will update with current range, but the cells will not be selected until
     * mouse up. This event can be listened for to perform actions while drag selecting.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source
     * @param {GridLocationConfig[],Grid.util.GridLocation[]} event.selectedCells The cells that is currently being dragged over
     * @param {Core.data.Model[]} event.selectedRecords The records that is currently being dragged over
     */
    onDragSelecting? : ((event: { source: Grid, selectedCells: GridLocationConfig[]|GridLocation[], selectedRecords: Model[] }) => void)|string
    /**
     * Triggered when a widget's [element](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-element) is available.
     * @param {object} event Event object
     * @param {HTMLElement} event.element The Widget's element.
     */
    onElementCreated? : ((event: { element: HTMLElement }) => void)|string
    /**
     * Fired before the editor will load the event record data into its input fields. This is useful if you
     * want to modify the fields before data is loaded (e.g. set some input field to be readonly)
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The editor widget
     * @param {Scheduler.model.SchedulerEventModel} event.record The record
     */
    onEventEditBeforeSetRecord? : ((event: { source: Container, record: SchedulerEventModel }) => void)|string
    /**
     * This event fires on the owning Scheduler before the context menu is shown for an event. Allows manipulation of the items
     * to show in the same way as in `processItems`. Returning `false` from a listener prevents the menu from
     * being shown.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record for which the menu was triggered
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record, if assignments are used
     * @param {HTMLElement} event.eventElement
     * @param {MouseEvent} event.event Pointer event which triggered the context menu (if any)
     */
    onEventMenuBeforeShow? : ((event: { source: Scheduler, items: Record<string, MenuItemConfig>, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, eventElement: HTMLElement, event?: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Scheduler when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Core.widget.MenuItem} event.item
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record, if assignments are used
     * @param {HTMLElement} event.eventElement
     */
    onEventMenuItem? : ((event: { source: Scheduler, item: MenuItem, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, eventElement: HTMLElement }) => void)|string
    /**
     * This event fires on the owning Scheduler after showing the context menu for an event
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record for which the menu was triggered
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record, if assignments are used
     * @param {HTMLElement} event.eventElement
     */
    onEventMenuShow? : ((event: { source: Scheduler, menu: Menu, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, eventElement: HTMLElement }) => void)|string
    /**
     * Fires on the owning Scheduler on each resize move event
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record being resized
     * @param {Date} event.startDate
     * @param {Date} event.endDate
     * @param {HTMLElement} event.element
     * @param {EventResizeData[]} event.resizeData Resize data for selected events
     */
    onEventPartialResize? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, startDate: Date, endDate: Date, element: HTMLElement, resizeData: EventResizeData[] }) => void)|string
    /**
     * Fires on the owning Scheduler after the resizing gesture has finished.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {boolean} event.changed Shows if the record has been changed by the resize action
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record being resized
     * @param {EventResizeData[]} event.resizeData Resize data for selected events
     */
    onEventResizeEnd? : ((event: { source: Scheduler, changed: boolean, eventRecord: SchedulerEventModel, resizeData: EventResizeData[] }) => void)|string
    /**
     * Fires on the owning Scheduler when event resizing starts
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record being resized
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     * @param {EventResizeData[]} event.resizeData Resize data for selected events. Only available when [resizeSelected](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventResize#config-resizeSelected) is `true`
     */
    onEventResizeStart? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, event: MouseEvent, resizeData: EventResizeData[] }) => void)|string
    /**
     * Fires on the owning Scheduler Pro on each segment resize move event
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.eventRecord Segment being resized
     * @param {Date} event.startDate
     * @param {Date} event.endDate
     * @param {HTMLElement} event.element
     */
    onEventSegmentPartialResize? : ((event: { source: SchedulerPro, eventRecord: EventModel, startDate: Date, endDate: Date, element: HTMLElement }) => void)|string
    /**
     * Fires on the owning Scheduler Pro after the resizing gesture has finished.
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source Scheduler Pro instance
     * @param {boolean} event.changed Shows if the record has been changed by the resize action
     * @param {SchedulerPro.model.EventModel} event.eventRecord Segment being resized
     */
    onEventSegmentResizeEnd? : ((event: { source: SchedulerPro, changed: boolean, eventRecord: EventModel }) => void)|string
    /**
     * Fires on the owning Scheduler Pro when segment resizing starts
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.eventRecord Segment being resized
     * @param {SchedulerPro.model.SchedulerProResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     */
    onEventSegmentResizeStart? : ((event: { source: SchedulerPro, eventRecord: EventModel, resourceRecord: SchedulerProResourceModel, event: MouseEvent }) => void)|string
    /**
     * Fires when a Panel is expanded using the [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible) setting.
     * @param {object} event Event object
     * @param {Core.widget.Panel} event.source This Panel.
     */
    onExpand? : ((event: { source: Panel }) => void)|string
    /**
     * Fired after a parent node record is expanded.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {Core.data.Model} event.record The record which has been expanded.
     */
    onExpandNode? : ((event: { source: Grid, record: Model }) => void)|string
    /**
     * Fired when a file is dropped on the widget element
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The owning Grid instance
     * @param {DataTransferItem} event.file The dropped file descriptor
     * @param {DragEvent} event.domEvent The native DragEvent
     */
    onFileDrop? : ((event: { source: Grid, file: DataTransferItem, domEvent: DragEvent }) => void)|string
    /**
     * Fired before the FillHandle dragging is finalized and values are applied to cells, return `false` to prevent the
     * drag operation from applying data changes.
     * @param {object} event Event object
     * @param {Grid.util.GridLocation} event.from The from cell
     * @param {Grid.util.GridLocation} event.to The to cell
     * @param {MouseEvent} event.domEvent The raw DOM event
     */
    onFillHandleBeforeDragFinalize? : ((event: { from: GridLocation, to: GridLocation, domEvent: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired while dragging the FillHandle.
     * @param {object} event Event object
     * @param {Grid.util.GridLocation} event.from The from cell
     * @param {Grid.util.GridLocation} event.to The to cell
     * @param {MouseEvent} event.domEvent The raw DOM event
     */
    onFillHandleDrag? : ((event: { from: GridLocation, to: GridLocation, domEvent: MouseEvent }) => void)|string
    /**
     * Fired when a FillHandle drag operation is aborted.
     */
    onFillHandleDragAbort? : (() => void)|string
    /**
     * Fired after a FillHandle drag operation.
     * @param {object} event Event object
     * @param {Grid.util.GridLocation} event.from The from cell
     * @param {Grid.util.GridLocation} event.to The to cell
     * @param {MouseEvent} event.domEvent The raw DOM event
     */
    onFillHandleDragEnd? : ((event: { from: GridLocation, to: GridLocation, domEvent: MouseEvent }) => void)|string
    /**
     * Fired when dragging of the FillHandle starts.
     * @param {object} event Event object
     * @param {Grid.util.GridLocation} event.cell Information about the column / record
     * @param {MouseEvent} event.domEvent The raw DOM event
     */
    onFillHandleDragStart? : ((event: { cell: GridLocation, domEvent: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid when cell editing is finished
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Target grid
     * @param {CellEditorContext} event.editorContext Editing context
     */
    onFinishCellEdit? : ((event: { grid: Grid, editorContext: CellEditorContext }) => void)|string
    /**
     * Fires on the owning Grid before the row editing is finished, return false to signal that the value is invalid and editing should not be finalized.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-finishRowEdit)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Target grid
     * @param {RowEditorContext} event.editorContext Editing context
     */
    onFinishRowEdit? : ((event: { grid: Grid, editorContext: RowEditorContext }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired when focus enters this Widget.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {HTMLElement} event.fromElement The element which lost focus.
     * @param {HTMLElement} event.toElement The element which gained focus.
     * @param {Core.widget.Widget} event.fromWidget The widget which lost focus.
     * @param {Core.widget.Widget} event.toWidget The widget which gained focus.
     * @param {boolean} event.backwards `true` if the `toElement` is before the `fromElement` in document order.
     */
    onFocusIn? : ((event: { source: Widget, fromElement: HTMLElement, toElement: HTMLElement, fromWidget: Widget, toWidget: Widget, backwards: boolean }) => void)|string
    /**
     * Fired when focus exits this Widget's ownership tree. This is different from a `blur` event.
     * focus moving from within this Widget's ownership tree, even if there are floating widgets
     * will not trigger this event. This is when focus exits this widget completely.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {HTMLElement} event.fromElement The element which lost focus.
     * @param {HTMLElement} event.toElement The element which gained focus.
     * @param {Core.widget.Widget} event.fromWidget The widget which lost focus.
     * @param {Core.widget.Widget} event.toWidget The widget which gained focus.
     * @param {boolean} event.backwards `true` if the `toElement` is before the `fromElement` in document order.
     */
    onFocusOut? : ((event: { source: Widget, fromElement: HTMLElement, toElement: HTMLElement, fromWidget: Widget, toWidget: Widget, backwards: boolean }) => void)|string
    /**
     * Fired before dragging starts, return false to prevent the drag operation.
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {MouseEvent,TouchEvent} event.event
     */
    onGridRowBeforeDragStart? : ((event: { source: GridBase, context: { records: Model[] }, event: MouseEvent|TouchEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before the row drop operation is finalized. You can return false to abort the drop operation, or a
     * Promise yielding `true` / `false` which allows for asynchronous abort (e.g. first show user a confirmation dialog).
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {boolean} event.context.valid Set this to true or false to indicate whether the drop position is valid
     * @param {Core.data.Model} event.context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
     * @param {Core.data.Model} event.context.parent The parent record of the current drop position (only applicable for trees)
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {RecordPositionContext[]} event.context.oldPositionContext An array of objects with information about the previous tree position. Objects contain the `record`, and its original `parentIndex` and `parentId` values
     * @param {MouseEvent} event.event
     */
    onGridRowBeforeDropFinalize? : ((event: { source: GridBase, context: { valid: boolean, insertBefore: Model, parent: Model, records: Model[], oldPositionContext: RecordPositionContext[] }, event: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired while the row is being dragged, in the listener function you have access to `context.insertBefore` a grid /
     * tree record, and additionally `context.parent` (a TreeNode) for trees. You can signal that the drop position is
     * valid or invalid by setting `context.valid = false;`
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {boolean} event.context.valid Set this to true or false to indicate whether the drop position is valid.
     * @param {Core.data.Model} event.context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
     * @param {Core.data.Model} event.context.parent The parent record of the current drop position (only applicable for trees)
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {MouseEvent} event.event
     */
    onGridRowDrag? : ((event: { source: GridBase, context: { valid: boolean, insertBefore: Model, parent: Model, records: Model[] }, event: MouseEvent }) => void)|string
    /**
     * Fired when a row drag operation is aborted
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {MouseEvent} event.event
     */
    onGridRowDragAbort? : ((event: { source: GridBase, context: { records: Model[] }, event: MouseEvent }) => void)|string
    /**
     * Fired when dragging starts.
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {MouseEvent,TouchEvent} event.event
     */
    onGridRowDragStart? : ((event: { source: GridBase, context: { records: Model[] }, event: MouseEvent|TouchEvent }) => void)|string
    /**
     * Fired after the row drop operation has completed, regardless of validity
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.source
     * @param {object} event.context
     * @param {boolean} event.context.valid true or false depending on whether the drop position was valid
     * @param {Core.data.Model} event.context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
     * @param {Core.data.Model} event.context.parent The parent record of the current drop position (only applicable for trees)
     * @param {Core.data.Model[]} event.context.records The dragged row records
     * @param {RecordPositionContext[]} event.context.oldPositionContext An array of objects with information about the previous tree position. Objects contain the record, and its original `parentIndex` and `parentId` values
     * @param {MouseEvent} event.event
     */
    onGridRowDrop? : ((event: { source: GridBase, context: { valid: boolean, insertBefore: Model, parent: Model, records: Model[], oldPositionContext: RecordPositionContext[] }, event: MouseEvent }) => void)|string
    /**
     * Fired when a grid header is clicked on.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-headerClick)
     * @param {object} event Event object
     * @param {Event} event.domEvent The triggering DOM event.
     * @param {Grid.column.Column} event.column The column clicked on.
     */
    onHeaderClick? : ((event: { domEvent: Event, column: Column }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Grid before the context menu is shown for a header.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Grid/feature/HeaderMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-headerMenuBeforeShow)
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Column
     */
    onHeaderMenuBeforeShow? : ((event: { source: Grid, menu: Menu, items: Record<string, MenuItemConfig>, column: Column }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Grid when an item is selected in the header context menu.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Grid.column.Column} event.column Column
     */
    onHeaderMenuItem? : ((event: { source: Grid, menu: Menu, item: MenuItem, column: Column }) => void)|string
    /**
     * This event fires on the owning Grid after the context menu is shown for a header
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Column
     */
    onHeaderMenuShow? : ((event: { source: Grid, menu: Menu, items: Record<string, MenuItemConfig>, column: Column }) => void)|string
    /**
     * This event fires on the owning Grid when a check item is toggled in the header context menu.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Grid.column.Column} event.column Column
     * @param {boolean} event.checked Checked or not
     */
    onHeaderMenuToggleItem? : ((event: { source: Grid, menu: Menu, item: MenuItem, column: Column, checked: boolean }) => void)|string
    /**
     * Triggered after a widget was hidden
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget
     */
    onHide? : ((event: { source: Widget }) => void)|string
    /**
     * Fires when row locking is enabled.
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.clone The created clone
     */
    onLockRows? : ((event: { clone: GridBase }) => void)|string
    /**
     * Mouse moved out from element in grid
     * @param {object} event Event object
     * @param {MouseEvent} event.event The native browser event
     */
    onMouseOut? : ((event: { event: MouseEvent }) => void)|string
    /**
     * Mouse moved in over element in grid
     * @param {object} event Event object
     * @param {MouseEvent} event.event The native browser event
     */
    onMouseOver? : ((event: { event: MouseEvent }) => void)|string
    /**
     * Fires on the owning Gantt when project content is exported
     * to XML, before the XML is downloaded by the browser.
     * @param {object} event Event object
     * @param {object} event.config Export config
     * @param {string} event.fileContent Exported XML-file content
     */
    onMspExport? : ((event: { config: object, fileContent: string }) => void)|string
    /**
     * Fired when a user gesture causes the active item to change.
     * @param {object} event Event object
     * @param {Event} event.event The browser event which instigated navigation. May be a click or key or focus event.
     * @param {HTMLElement,null} event.item The newly active item, or `null` if focus moved out.
     * @param {HTMLElement,null} event.oldItem The previously active item, or `null` if focus is moving in.
     */
    onNavigate? : ((event: { event: Event, item: HTMLElement|null, oldItem: HTMLElement|null }) => void)|string
    /**
     * Fires when the requested date range cannot fit into any zoom level higher than the current level.
     * @param {object} event Event object
     * @param {number} event.currentZoomLevel The current zoom level
     * @param {Date} event.startDate The requested start date
     * @param {Date} event.endDate The requested end date
     */
    onNoZoomChange? : ((event: { currentZoomLevel: number, startDate: Date, endDate: Date }) => void)|string
    /**
     * Triggered when a widget which had been in a non-visible state for any reason
     * achieves visibility.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-paint)
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget being painted.
     * @param {boolean} event.firstPaint `true` if this is the first paint.
     */
    onPaint? : ((event: { source: Widget, firstPaint: boolean }) => void)|string
    /**
     * Fires on the owning Grid after a paste action is performed.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {string} event.clipboardData The clipboardData that was pasted
     * @param {Core.data.Model[]} event.modifiedRecords The records which have been modified due to the paste action
     * @param {Grid.util.GridLocation} event.targetCell The cell from which the paste will be started
     * @param {string} event.entityName 'cell' to distinguish this event from other paste events
     */
    onPaste? : ((event: { source: Grid, clipboardData: string, modifiedRecords: Model[], targetCell: GridLocation, entityName: string }) => void)|string
    /**
     * Fires on the owning Grid when export has finished
     * @param {object} event Event object
     * @param {Response} event.response Optional response, if received
     * @param {Error} event.error Optional error, if exception occurred
     */
    onPdfExport? : ((event: { response?: any, error?: Error }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when dragging the percent bar
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source SchedulerPro or Gantt instance
     * @param {Core.data.Model} event.taskRecord The task record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onPercentBarDrag? : ((event: { source: TimelineBase, taskRecord: Model, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget if a percent bar drag-drop operation is aborted
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source SchedulerPro instance
     * @param {Core.data.Model} event.taskRecord The task record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onPercentBarDragAbort? : ((event: { source: TimelineBase, taskRecord: Model, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when percent bar dragging starts
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source SchedulerPro or Gantt instance
     * @param {Core.data.Model} event.taskRecord The task record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onPercentBarDragStart? : ((event: { source: TimelineBase, taskRecord: Model, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when dropping the percent bar
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source SchedulerPro or Gantt instance
     * @param {Core.data.Model} event.taskRecord The task record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onPercentBarDrop? : ((event: { source: TimelineBase, taskRecord: Model, domEvent: MouseEvent }) => void)|string
    /**
     * Fired after the [viewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineViewPresets#config-viewPreset) has changed.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler instance.
     * @param {Date} event.startDate The new start date of the timeline.
     * @param {Date} event.centerDate The new center date of the timeline.
     * @param {Date} event.endDate The new end date of the timeline.
     * @param {Scheduler.preset.ViewPreset} event.from The outgoing ViewPreset.
     * @param {Scheduler.preset.ViewPreset} event.to The ViewPreset being switched to.
     */
    onPresetChange? : ((event: { source: Scheduler, startDate: Date, centerDate: Date, endDate: Date, from: ViewPreset, to: ViewPreset }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Gantt widget when the editor for a project is canceled.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.ProjectModel} event.projectRecord The edited project
     * @param {Gantt.widget.ProjectEditor} event.editor The editor
     */
    onProjectEditCanceled? : ((event: { source: Gantt, projectRecord: ProjectModel, editor: ProjectEditor }) => void)|string
    /**
     * Fired when a Widget's read only state is toggled
     * @param {object} event Event object
     * @param {boolean} event.readOnly Read only or not
     */
    onReadOnly? : ((event: { readOnly: boolean }) => void)|string
    /**
     * This event is fired after a widget's elements have been synchronized due to a direct or indirect call
     * to [recompose](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#function-recompose), if this results in some change to the widget's rendered DOM elements.
     */
    onRecompose? : (() => void)|string
    /**
     * Task is released, no longer in view/removed. A good spot for cleaning custom things added in a `renderTask`
     * listener up, if needed.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {object} event.renderData Task render data
     * @param {Gantt.model.TaskModel} event.taskRecord Rendered task
     * @param {HTMLElement} event.element Task element
     */
    onReleaseTask? : ((event: { source: Gantt, renderData: object, taskRecord: TaskModel, element: HTMLElement }) => void)|string
    /**
     * Fires after a row is rendered.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {Grid.row.Row} event.row The row that has been rendered.
     * @param {Core.data.Model} event.record The record for the row.
     * @param {number} event.recordIndex The zero-based index of the record.
     */
    onRenderRow? : ((event: { source: Grid, row: Row, record: Model, recordIndex: number }) => void)|string
    /**
     * Grid rows have been rendered
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source This grid.
     */
    onRenderRows? : ((event: { source: Grid }) => void)|string
    /**
     * Task is rendered, its element is available in DOM.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {object} event.renderData Task render data
     * @param {Gantt.model.TaskModel} event.taskRecord Rendered task
     * @param {HTMLElement} event.element Task element
     */
    onRenderTask? : ((event: { source: Gantt, renderData: object, taskRecord: TaskModel, element: HTMLElement }) => void)|string
    /**
     * Fired when the encapsulating element of a Widget resizes *only when [monitorResize](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-monitorResize) is `true`*.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {number} event.width The new width
     * @param {number} event.height The new height
     * @param {number} event.oldWidth The old width
     * @param {number} event.oldHeight The old height
     */
    onResize? : ((event: { source: Widget, width: number, height: number, oldWidth: number, oldHeight: number }) => void)|string
    /**
     * Triggered when clicking a resource avatar or chip in the cells of the [ResourceAssignmentColumn](https://bryntum.com/products/gantt/docs/api/Gantt/column/ResourceAssignmentColumn).
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source This Gantt
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {Gantt.model.ResourceModel} event.resourceRecord Resource record
     * @param {Event} event.event Browser event
     */
    onResourceAssignmentClick? : ((event: { source: Gantt, taskRecord: TaskModel, resourceRecord: ResourceModel, event: Event }) => void)|string
    /**
     * Grid resize lead to a new responsive level being applied
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.grid Grid that was resized
     * @param {string} event.level New responsive level (small, large, etc)
     * @param {number} event.width New width in px
     * @param {string} event.oldLevel Old responsive level
     * @param {number} event.oldWidth Old width in px
     */
    onResponsive? : ((event: { grid: Grid, level: string, width: number, oldLevel: string, oldWidth: number }) => void)|string
    /**
     * This event fires when a row has finished collapsing.
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onRowCollapse? : ((event: { record: Model }) => void)|string
    /**
     * This event fires when a row expand has finished expanding.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-rowExpand)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     * @param {object} event.expandedElements An object with the Grid region name as property and the expanded body element as value
     * @param {Core.widget.Widget} event.widget In case of expanding a Widget, this will be a reference to the instance created by the actual expansion. If there is multiple Grid regions, use the `widgets` param instead.
     * @param {object} event.widgets In case of expanding a Widget, this will be an object with the Grid region name as property and the reference to the widget instance created by the actual expansion
     */
    onRowExpand? : ((event: { record: Model, expandedElements: object, widget: Widget, widgets: object }) => void)|string
    /**
     * Fired when the mouse enters a row
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Core.data.Model} event.record The record representing the hovered row
     * @param {Grid.column.Column} event.column The column currently hovered
     * @param {HTMLElement} event.cellElement The cell HTML element
     * @param {MouseEvent} event.event The native DOM event
     */
    onRowMouseEnter? : ((event: { source: Grid, record: Model, column: Column, cellElement: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * Fired when the mouse leaves a row
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The grid instance
     * @param {Core.data.Model} event.record The record representing the row that the mouse left
     * @param {HTMLElement} event.cellElement The cell HTML element that the mouse left
     * @param {MouseEvent} event.event The native DOM event
     */
    onRowMouseLeave? : ((event: { source: Grid, record: Model, cellElement: HTMLElement, event: MouseEvent }) => void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget before the context menu is shown for the schedule.
     * Allows manipulation of the items to show in the same way as in `processItems`. Returning `false` from a listener
     * prevents the menu from being shown.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {Date} event.date Clicked date, rounded according to viewPreset's settings
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record, if assignments are used
     * @param {HTMLElement} event.eventElement
     */
    onScheduleMenuBeforeShow? : ((event: { source: Scheduler, items: Record<string, MenuItemConfig>, resourceRecord: SchedulerResourceModel, date: Date, assignmentRecord: SchedulerAssignmentModel, eventElement: HTMLElement }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Core.widget.MenuItem} event.item
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord
     * @param {Date} event.date Clicked date, rounded according to viewPreset's settings
     * @param {HTMLElement} event.element
     */
    onScheduleMenuItem? : ((event: { source: Scheduler, item: MenuItem, resourceRecord: SchedulerResourceModel, date: Date, element: HTMLElement }) => void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget after showing the context menu for the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord
     * @param {Date} event.date Clicked date, rounded according to viewPreset's settings
     * @param {HTMLElement} event.targetElement
     */
    onScheduleMenuShow? : ((event: { source: Scheduler, items: Record<string, MenuItemConfig>, menu: Menu, resourceRecord: SchedulerResourceModel, date: Date, targetElement: HTMLElement }) => void)|string
    /**
     * Grid has scrolled vertically
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {number} event.scrollTop The vertical scroll position.
     */
    onScroll? : ((event: { source: Grid, scrollTop: number }) => void)|string
    /**
     * Fires on owner when the scroll button is clicked, return `false` to prevent default scroll behavior
     * @param {object} event Event object
     * @param {Event} event.domEvent DOM event
     * @param {Gantt.model.TaskModel} event.taskRecord The task record
     */
    onScrollButtonClick? : ((event: { domEvent: Event, taskRecord: TaskModel }) => Promise<boolean>|boolean|void)|string
    /**
     * The selection has been changed.
     * @param {object} event Event object
     * @param {'select','deselect'} event.action `'select'`/`'deselect'`
     * @param {'row','cell'} event.mode `'row'`/`'cell'`
     * @param {Grid.view.Grid} event.source
     * @param {Core.data.Model[]} event.deselected The records deselected in this operation.
     * @param {Core.data.Model[]} event.selected The records selected in this operation.
     * @param {Core.data.Model[]} event.selection The records in the new selection.
     * @param {Grid.util.GridLocation[]} event.deselectedCells The cells deselected in this operation.
     * @param {Grid.util.GridLocation[]} event.selectedCells The cells selected in this operation.
     * @param {Grid.util.GridLocation[]} event.cellSelection The cells in the new selection.
     */
    onSelectionChange? : ((event: { action: 'select'|'deselect', mode: 'row'|'cell', source: Grid, deselected: Model[], selected: Model[], selection: Model[], deselectedCells: GridLocation[], selectedCells: GridLocation[], cellSelection: GridLocation[] }) => void)|string
    /**
     * The selectionMode configuration has been changed.
     * @param {object} event Event object
     * @param {object} event.selectionMode The new [selectionMode](https://bryntum.com/products/gantt/docs/api/Grid/view/mixin/GridSelection#config-selectionMode)
     */
    onSelectionModeChange? : ((event: { selectionMode: object }) => void)|string
    /**
     * Triggered after a widget is shown.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget
     */
    onShow? : ((event: { source: Widget }) => void)|string
    /**
     * Fires when splitting the Grid.
     * @param {object} event Event object
     * @param {Grid.view.GridBase[]} event.subViews The sub views created by the split
     * @param {object} event.options The options passed to the split call
     * @param {'horizontal','vertical','both'} event.options.direction The direction of the split
     * @param {Grid.column.Column} event.options.atColumn The column to split at
     * @param {Core.data.Model} event.options.atRecord The record to split at
     */
    onSplit? : ((event: { subViews: GridBase[], options: { direction: 'horizontal'|'vertical'|'both', atColumn: Column, atRecord: Model } }) => void)|string
    /**
     * Fired by the Grid when the collapse icon is clicked. Return `false` to prevent the default collapse action,
     * if you want to implement your own behavior.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The Grid instance.
     * @param {Grid.view.SubGrid} event.subGrid The subgrid
     * @param {Event} event.domEvent The native DOM event
     */
    onSplitterCollapseClick? : ((event: { source: Grid, subGrid: SubGrid, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired by the Grid after a sub-grid has been resized using the splitter
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The Grid instance.
     * @param {Grid.view.SubGrid} event.subGrid The resized subgrid
     * @param {Event} event.domEvent The native DOM event
     */
    onSplitterDragEnd? : ((event: { source: Grid, subGrid: SubGrid, domEvent: Event }) => void)|string
    /**
     * Fired by the Grid when a sub-grid resize gesture starts
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The Grid instance.
     * @param {Grid.view.SubGrid} event.subGrid The subgrid about to be resized
     * @param {Event} event.domEvent The native DOM event
     */
    onSplitterDragStart? : ((event: { source: Grid, subGrid: SubGrid, domEvent: Event }) => void)|string
    /**
     * Fired by the Grid when the expand icon is clicked. Return `false` to prevent the default expand action,
     * if you want to implement your own behavior.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The Grid instance.
     * @param {Grid.view.SubGrid} event.subGrid The subgrid
     * @param {Event} event.domEvent The native DOM event
     */
    onSplitterExpandClick? : ((event: { source: Grid, subGrid: SubGrid, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Grid when editing starts
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {CellEditorContext} event.editorContext Editing context
     */
    onStartCellEdit? : ((event: { source: Grid, editorContext: CellEditorContext }) => void)|string
    /**
     * Fires on the owning Grid when editing starts
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source Owner grid
     * @param {RowEditorContext} event.editorContext Editing context
     */
    onStartRowEdit? : ((event: { source: Grid, editorContext: RowEditorContext }) => void)|string
    /**
     * Fires after a sub grid is collapsed.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance
     * @param {Grid.view.SubGrid} event.subGrid The sub grid instance
     */
    onSubGridCollapse? : ((event: { source: Grid, subGrid: SubGrid }) => void)|string
    /**
     * Fires after a sub grid is expanded.
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance
     * @param {Grid.view.SubGrid} event.subGrid The sub grid instance
     */
    onSubGridExpand? : ((event: { source: Grid, subGrid: SubGrid }) => void)|string
    /**
     * Triggered after a click on a task bar.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskClick? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered after a rightclick (or long press on a touch device) on a task.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskContextMenu? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered after a doubleclick on a task.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskDblClick? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Fires on the owning Gantt while a task is being dragged
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords
     * @param {Date} event.startDate
     * @param {Date} event.endDate
     * @param {object} event.dragData
     * @param {boolean} event.changed `true` if startDate has changed.
     */
    onTaskDrag? : ((event: { source: Gantt, taskRecords: TaskModel[], startDate: Date, endDate: Date, dragData: object, changed: boolean }) => void)|string
    /**
     * Fires on the owning Gantt when task dragging starts
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords
     */
    onTaskDragStart? : ((event: { source: Gantt, taskRecords: TaskModel[] }) => void)|string
    /**
     * Fires on the owning Gantt after a valid task drop
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords
     * @param {boolean} event.isCopy
     */
    onTaskDrop? : ((event: { source: Gantt, taskRecords: TaskModel[], isCopy: boolean }) => void)|string
    /**
     * Fires on the owning Scheduler or Gantt widget when the editor for an event is canceled.
     * @param {object} event Event object
     * @param {SchedulerPro.view.SchedulerPro} event.source The Scheduler Pro instance
     * @param {SchedulerPro.model.EventModel} event.taskRecord the task about the shown in the editor
     * @param {SchedulerPro.widget.TaskEditorBase} event.editor The editor
     */
    onTaskEditCanceled? : ((event: { source: SchedulerPro, taskRecord: EventModel, editor: TaskEditorBase }) => void)|string
    /**
     * Triggered when a keydown event is observed if there are selected tasks.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source This Gantt
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {KeyboardEvent} event.event Browser event
     */
    onTaskKeyDown? : ((event: { source: Gantt, taskRecord: TaskModel, event: KeyboardEvent }) => void)|string
    /**
     * Triggered when a keyup event is observed if there are selected tasks.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source This Gantt
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {KeyboardEvent} event.event Browser event
     */
    onTaskKeyUp? : ((event: { source: Gantt, taskRecord: TaskModel, event: KeyboardEvent }) => void)|string
    /**
     * This event fires on the owning Gantt before the context menu is shown for a task. Allows manipulation of the items
     * to show in the same way as in `processItems`. Returning false from a listener prevents the menu from
     * being shown.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {MenuItemConfig[]} event.items Menu item configs
     * @param {Gantt.model.TaskModel} event.taskRecord Event record for which the menu was triggered
     * @param {HTMLElement} event.taskElement
     */
    onTaskMenuBeforeShow? : ((event: { source: Gantt, items: MenuItemConfig[], taskRecord: TaskModel, taskElement: HTMLElement }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Gantt when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Core.widget.MenuItem} event.item
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {HTMLElement} event.taskElement
     */
    onTaskMenuItem? : ((event: { source: Gantt, item: MenuItem, taskRecord: TaskModel, taskElement: HTMLElement }) => void)|string
    /**
     * This event fires on the owning Gantt after showing the context menu for an event
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Gantt.model.TaskModel} event.taskRecord Event record for which the menu was triggered
     * @param {HTMLElement} event.taskElement
     */
    onTaskMenuShow? : ((event: { source: Gantt, menu: Menu, taskRecord: TaskModel, taskElement: HTMLElement }) => void)|string
    /**
     * Triggered after a mousedown on a task bar.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskMouseDown? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for mouseout from a task.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskMouseOut? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered after a mouseover on a task.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskMouseOver? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered after a mouseup on a task bar.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord The Task record
     * @param {MouseEvent} event.event The native browser event
     */
    onTaskMouseUp? : ((event: { source: Gantt, taskRecord: TaskModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when clicking a nonworking time element
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt chart instance
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {object} event.interval The raw data describing the nonworking time interval
     * @param {string} event.interval.name The interval name (if any)
     * @param {Date} event.interval.startDate The interval start date
     * @param {Date} event.interval.endDate The interval end date
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTaskNonWorkingTimeClick? : ((event: { source: Gantt, taskRecord: TaskModel, interval: { name: string, startDate: Date, endDate: Date }, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered when right-clicking a nonworking time element
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt chart instance
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {object} event.interval The raw data describing the nonworking time interval
     * @param {string} event.interval.name The interval name (if any)
     * @param {Date} event.interval.startDate The interval start date
     * @param {Date} event.interval.endDate The interval end date
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTaskNonWorkingTimeContextMenu? : ((event: { source: Gantt, taskRecord: TaskModel, interval: { name: string, startDate: Date, endDate: Date }, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered when double-clicking a nonworking time element
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source The Gantt chart instance
     * @param {Gantt.model.TaskModel} event.taskRecord Task record
     * @param {object} event.interval The raw data describing the nonworking time interval
     * @param {string} event.interval.name The interval name (if any)
     * @param {Date} event.interval.startDate The interval start date
     * @param {Date} event.interval.endDate The interval end date
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTaskNonWorkingTimeDblClick? : ((event: { source: Gantt, taskRecord: TaskModel, interval: { name: string, startDate: Date, endDate: Date }, domEvent: MouseEvent }) => void)|string
    /**
     * Fires on the owning Gantt on each resize move event
     * @param {object} event Event object
     * @param {TaskResizeData[]} event.resizeData Data for the tasks that are being resized. Only available when [resizeSelected](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskResize#config-resizeSelected) is `true`. The nested properties are same as `context`
     * @param {Gantt.model.TaskModel} event.taskRecord Task record being resized
     * @param {Date} event.startDate New startDate
     * @param {Date} event.endDate New endDate
     * @param {HTMLElement} event.element
     */
    onTaskPartialResize? : ((event: { resizeData: TaskResizeData[], taskRecord: TaskModel, startDate: Date, endDate: Date, element: HTMLElement }) => void)|string
    /**
     * Fires on the owning Gantt after the resizing gesture has finished.
     * @param {object} event Event object
     * @param {boolean} event.changed
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {TaskResizeData[]} event.resizeData Resize data for selected tasks. Only available when [resizeSelected](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskResize#config-resizeSelected) is `true`
     */
    onTaskResizeEnd? : ((event: { changed: boolean, taskRecord: TaskModel, resizeData: TaskResizeData[] }) => void)|string
    /**
     * Fires on the owning Gantt when task resizing starts
     * @param {object} event Event object
     * @param {Gantt.model.TaskModel} event.taskRecord
     * @param {Event} event.event
     * @param {TaskResizeData[]} event.resizeData Resize data for selected tasks. Only available when [resizeSelected](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskResize#config-resizeSelected) is `true`
     */
    onTaskResizeStart? : ((event: { taskRecord: TaskModel, event: Event, resizeData: TaskResizeData[] }) => void)|string
    /**
     * Fires on the owning Gantt while a segment is being dragged
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords Dragged segments
     * @param {Date} event.startDate
     * @param {Date} event.endDate
     * @param {object} event.dragData
     * @param {boolean} event.changed `true` if startDate has changed.
     */
    onTaskSegmentDrag? : ((event: { source: Gantt, taskRecords: TaskModel[], startDate: Date, endDate: Date, dragData: object, changed: boolean }) => void)|string
    /**
     * Fires on the owning Gantt when segment dragging starts
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords Dragged segments
     */
    onTaskSegmentDragStart? : ((event: { source: Gantt, taskRecords: TaskModel[] }) => void)|string
    /**
     * Fires on the owning Gantt after a valid task drop
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source
     * @param {Gantt.model.TaskModel[]} event.taskRecords Dropped segments
     * @param {boolean} event.isCopy
     */
    onTaskSegmentDrop? : ((event: { source: Gantt, taskRecords: TaskModel[], isCopy: boolean }) => void)|string
    /**
     * Fires on the owning Gantt on each resize move event
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord Segment being resized
     * @param {Date} event.startDate
     * @param {Date} event.endDate
     * @param {HTMLElement} event.element
     */
    onTaskSegmentPartialResize? : ((event: { source: Gantt, taskRecord: TaskModel, startDate: Date, endDate: Date, element: HTMLElement }) => void)|string
    /**
     * Fires on the owning Gantt after the resizing gesture has finished.
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {boolean} event.changed Shows if the record has been changed by the resize action
     * @param {Gantt.model.TaskModel} event.taskRecord Segment being resized
     */
    onTaskSegmentResizeEnd? : ((event: { source: Gantt, changed: boolean, taskRecord: TaskModel }) => void)|string
    /**
     * Fires on the owning Gantt when event resizing starts
     * @param {object} event Event object
     * @param {Gantt.view.Gantt} event.source Gantt instance
     * @param {Gantt.model.TaskModel} event.taskRecord Segment being resized
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the resize starts within
     * @param {MouseEvent} event.event Browser event
     */
    onTaskSegmentResizeStart? : ((event: { source: Gantt, taskRecord: TaskModel, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Fired when the tick size changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-tickSizeChange)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler instance.
     * @param {number} event.tickSize The tick size in pixels
     */
    onTickSizeChange? : ((event: { source: Scheduler, tickSize: number }) => void)|string
    /**
     * Fired when the timeaxis has changed, for example by zooming or configuring a new time span.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {object} event.config Config object used to reconfigure the time axis.
     * @param {Date} event.config.startDate New start date (if supplied)
     * @param {Date} event.config.endDate New end date (if supplied)
     */
    onTimeAxisChange? : ((event: { source: Scheduler, config: { startDate: Date, endDate: Date } }) => void)|string
    /**
     * Fires after a click on a time axis cell
     * @param {object} event Event object
     * @param {Scheduler.column.SchedulerTimeAxisColumn,Scheduler.column.VerticalTimeAxisColumn} event.source The column object
     * @param {Date} event.startDate The start date of the header cell
     * @param {Date} event.endDate The end date of the header cell
     * @param {Event} event.event The event object
     */
    onTimeAxisHeaderClick? : ((event: { source: SchedulerTimeAxisColumn|VerticalTimeAxisColumn, startDate: Date, endDate: Date, event: Event }) => void)|string
    /**
     * Fires after a right click on a time axis cell
     * @param {object} event Event object
     * @param {Scheduler.column.SchedulerTimeAxisColumn,Scheduler.column.VerticalTimeAxisColumn} event.source The column object
     * @param {Date} event.startDate The start date of the header cell
     * @param {Date} event.endDate The end date of the header cell
     * @param {Event} event.event The event object
     */
    onTimeAxisHeaderContextMenu? : ((event: { source: SchedulerTimeAxisColumn|VerticalTimeAxisColumn, startDate: Date, endDate: Date, event: Event }) => void)|string
    /**
     * Fires after a double click on a time axis cell
     * @param {object} event Event object
     * @param {Scheduler.column.SchedulerTimeAxisColumn,Scheduler.column.VerticalTimeAxisColumn} event.source The column object
     * @param {Date} event.startDate The start date of the header cell
     * @param {Date} event.endDate The end date of the header cell
     * @param {Event} event.event The event object
     */
    onTimeAxisHeaderDblClick? : ((event: { source: SchedulerTimeAxisColumn|VerticalTimeAxisColumn, startDate: Date, endDate: Date, event: Event }) => void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget before the context menu is shown for the time axis header.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeAxisHeaderMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-timeAxisHeaderMenuBeforeShow)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Time axis column
     */
    onTimeAxisHeaderMenuBeforeShow? : ((event: { source: Scheduler, menu: Menu, items: Record<string, MenuItemConfig>, column: Column }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget when an item is selected in the header context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Grid.column.Column} event.column Time axis column
     */
    onTimeAxisHeaderMenuItem? : ((event: { source: Scheduler, menu: Menu, item: MenuItem, column: Column }) => void)|string
    /**
     * This event fires on the owning Scheduler or Gantt widget after the context menu is shown for a header
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Time axis column
     */
    onTimeAxisHeaderMenuShow? : ((event: { source: Scheduler, menu: Menu, items: Record<string, MenuItemConfig>, column: Column }) => void)|string
    /**
     * Fired when the pointer-activated [timelineContext](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineDomEvents#property-timelineContext) has changed.
     * @param {object} event Event object
     * @param {Scheduler.util.TimelineContext} event.oldContext The tick/resource context being deactivated.
     * @param {Scheduler.util.TimelineContext} event.context The tick/resource context being activated.
     */
    onTimelineContextChange? : ((event: { oldContext: TimelineContext, context: TimelineContext }) => void)|string
    /**
     * Fired when the *scheduler* viewport (not the overall Scheduler element) changes size.
     * This happens when the grid changes height, or when the subgrid which encapsulates the
     * scheduler column changes width.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Scheduler
     * @param {number} event.width The new width
     * @param {number} event.height The new height
     * @param {number} event.oldWidth The old width
     * @param {number} event.oldHeight The old height
     */
    onTimelineViewportResize? : ((event: { source: Widget, width: number, height: number, oldWidth: number, oldHeight: number }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when a click happens on a time range header element
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.TimeSpan} event.timeRangeRecord The record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTimeRangeHeaderClick? : ((event: { source: Scheduler, timeRangeRecord: TimeSpan, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when a right click happens on a time range header element
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.TimeSpan} event.timeRangeRecord The record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTimeRangeHeaderContextMenu? : ((event: { source: Scheduler, timeRangeRecord: TimeSpan, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler or Gantt widget when a double click happens on a time range header element
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.TimeSpan} event.timeRangeRecord The record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTimeRangeHeaderDblClick? : ((event: { source: Scheduler, timeRangeRecord: TimeSpan, domEvent: MouseEvent }) => void)|string
    /**
     * Fired when one or more groups are expanded or collapsed
     * @param {object} event Event object
     * @param {Core.data.Model} event.groupRecord [DEPRECATED] Use `groupRecords` param instead
     * @param {Core.data.Model[]} event.groupRecords The group records being toggled
     * @param {boolean} event.collapse Collapsed (true) or expanded (false)
     * @param {boolean} event.allRecords True if this event is part of toggling all groups
     */
    onToggleGroup? : ((event: { groupRecord: Model, groupRecords: Model[], collapse: boolean, allRecords?: boolean }) => void)|string
    /**
     * Fired after a parent node record toggles its collapsed state.
     * @param {object} event Event object
     * @param {Core.data.Model} event.record The record being toggled.
     * @param {boolean} event.collapse `true` if the node is being collapsed.
     */
    onToggleNode? : ((event: { record: Model, collapse: boolean }) => void)|string
    /**
     * A header [tool](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-tools) has been clicked.
     * @param {object} event Event object
     * @param {Core.widget.Tool} event.source This Panel.
     * @param {Core.widget.Tool} event.tool The tool which is being clicked.
     */
    onToolClick? : ((event: { source: Tool, tool: Tool }) => void)|string
    /**
     * <strong>Note that this event fires on the owning [SchedulerPro](https://bryntum.com/products/gantt/docs/api/SchedulerPro/view/SchedulerPro).</strong>
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-transactionChange)
     * @param {object} event Event object
     * @param {boolean} event.hasChanges Whether any changes are recorded that are not yet attached to a version.
     */
    onTransactionChange? : ((event: { hasChanges: boolean }) => void)|string
    /**
     * Fires when row locking is disabled.
     * @param {object} event Event object
     * @param {Grid.view.GridBase} event.clone The locked clone that will be destroyed
     */
    onUnlockRows? : ((event: { clone: GridBase }) => void)|string
    /**
     * Fires when un-splitting the Grid.
     */
    onUnsplit? : (() => void)|string
    /**
     * Fired when the range of dates visible within the viewport changes. This will be when
     * scrolling along a time axis.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#event-visibleDateRangeChange)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler instance.
     * @param {object} event.old The old date range
     * @param {Date} event.old.startDate the old start date.
     * @param {Date} event.old.endDate the old end date.
     * @param {object} event.new The new date range
     * @param {Date} event.new.startDate the new start date.
     * @param {Date} event.new.endDate the new end date.
     */
    onVisibleDateRangeChange? : ((event: { source: Scheduler, old: { startDate: Date, endDate: Date }, new: { startDate: Date, endDate: Date } }) => void)|string

    // Features
    /**
     * AI-powered filter feature for Grid. Allows users to type natural language queries to filter grid data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ai/AIFilter)
     */
    aiFilterFeature? : object|boolean|string|AIFilter|AIFilterConfig
    /**
     * Displays a [task](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel)'s [baselines](#Gantt/model/TaskModel#field-baselines) below the tasks in the
     * timeline.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Baselines)
     */
    baselinesFeature? : object|boolean|string|Baselines|BaselinesConfig
    /**
     * Allows using `[Ctrl/CMD + C]`, `[Ctrl/CMD + X]` and `[Ctrl/CMD + V]` to cut, copy and paste cell or cell ranges. Also
     * makes cut, copy and paste actions available via the cell context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellCopyPaste)
     */
    cellCopyPasteFeature? : object|boolean|string|CellCopyPaste|CellCopyPasteConfig
    /**
     * Extends the [CellEdit](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellEdit) to encapsulate Gantt functionality. This feature is enabled by <b>default</b>
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/CellEdit)
     */
    cellEditFeature? : object|boolean|string|CellEdit|CellEditConfig
    /**
     * Right click to display context menu for cells. To invoke the cell menu in a keyboard-accessible manner, use the
     * `SPACE` key when the cell is focused.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellMenu)
     */
    cellMenuFeature? : object|boolean|string|CellMenu|CellMenuConfig
    /**
     * Displays a tooltip when hovering cells.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellTooltip)
     */
    cellTooltipFeature? : object|boolean|string|CellTooltip|CellTooltipConfig
    /**
     * Adds interactive charting to a Grid. [Charts](https://bryntum.com/products/gantt/docs/api/Chart/widget/Chart) can be created from a selection of Grid data
     * and updated in realtime as data changes. Supports many common chart types with extensive styling and customization
     * options.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Charts)
     */
    chartsFeature? : object|boolean|string|Charts|ChartsConfig
    /**
     * Enables the [autoWidth](https://bryntum.com/products/gantt/docs/api/Grid/column/Column#config-autoWidth) config for a grid's columns.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnAutoWidth)
     */
    columnAutoWidthFeature? : object|boolean|string|ColumnAutoWidth|ColumnAutoWidthConfig
    /**
     * Displays a toolbar while dragging column headers. Drop on a button in the toolbar to activate a certain function,
     * for example to group by that column. This feature simplifies certain operations on touch devices.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnDragToolbar)
     */
    columnDragToolbarFeature? : object|boolean|string|ColumnDragToolbar|ColumnDragToolbarConfig
    /**
     * Displays column lines for ticks, with a different styling for major ticks (by default they are darker). If this
     * feature is disabled, no lines are shown. If it's enabled, line are shown for the tick level which is set in current
     * ViewPreset. Please see [columnLinesFor](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/ViewPreset#field-columnLinesFor) config for details.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ColumnLines)
     */
    columnLinesFeature? : object|boolean|string|ColumnLines|ColumnLinesConfig
    /**
     * Displays a column picker (to show/hide columns) in the header context menu. Columns can be displayed in sub menus
     * by region or tag. Grouped headers are displayed as menu hierarchies.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnPicker)
     */
    columnPickerFeature? : object|boolean|string|ColumnPicker|ColumnPickerConfig
    /**
     * Allows user to rename columns by either right-clicking column header or using keyboard shortcuts when column header
     * is focused.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnRename)
     */
    columnRenameFeature? : object|boolean|string|ColumnRename|ColumnRenameConfig
    /**
     * Allows user to reorder columns by dragging headers. To get notified about column reorder listen to `change` event
     * on [columns](https://bryntum.com/products/gantt/docs/api/Grid/data/ColumnStore) store.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnReorder)
     */
    columnReorderFeature? : object|boolean|string|ColumnReorder|ColumnReorderConfig
    /**
     * Enables user to resize columns by dragging a handle on the right hand side of the header. To get notified about column
     * resize listen to `change` event on [columns](https://bryntum.com/products/gantt/docs/api/Grid/data/ColumnStore) store.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/ColumnResize)
     */
    columnResizeFeature? : object|boolean|string|ColumnResize|ColumnResizeConfig
    /**
     * This feature highlights the project *critical paths*.
     * Every task is important, but only some of them are critical.
     * The critical path is a chain of linked tasks that directly affects the project finish date.
     * If any task on the critical path is late, the whole project is late.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/CriticalPaths)
     */
    criticalPathsFeature? : object|boolean|string|CriticalPaths|CriticalPathsConfig
    /**
     * This feature draws dependencies between tasks. Uses a dependency
     * [store](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-dependencyStore) to determine which dependencies to draw.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Dependencies)
     */
    dependenciesFeature? : object|boolean|string|Dependencies|DependenciesConfig
    /**
     * Feature that displays a popup containing fields for editing dependency data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/DependencyEdit)
     */
    dependencyEditFeature? : object|boolean|string|DependencyEdit|DependencyEditConfig
    /**
     * Adds event filter menu items to the timeline header context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventFilter)
     */
    eventFilterFeature? : object|boolean|string|EventFilter|EventFilterConfig
    /**
     * This feature provides segmented events support. It implements rendering of such events and also adds a entries to the
     * event context menu allowing to split the selected event and rename segments.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/EventSegments)
     */
    eventSegmentsFeature? : object|boolean|string|EventSegments|EventSegmentsConfig
    /**
     * A feature that allows exporting Grid data to Excel or CSV without involving the server. It uses
     * [TableExporter](https://bryntum.com/products/gantt/docs/api/Grid/util/TableExporter) class as data provider, 3rd party provider to generate XLS files, and
     * [Microsoft XML specification](https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.aspx).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/experimental/ExcelExporter)
     */
    excelExporterFeature? : object|boolean|string|GridExcelExporter|GridExcelExporterConfig
    /**
     * An experimental feature that lets users drop files on a Widget. The widget fires an event when a file is dropped onto it.
     * In the event, you get access to the raw files as strings, that were parsed by calling `readAsBinaryString`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/experimental/FileDrop)
     */
    fileDropFeature? : object|boolean|string|FileDrop|FileDropConfig
    /**
     * This feature adds a fill handle to a Grid range selection, which when dragged, fills the cells being dragged over
     * with values based on the values in the original selected range. This is similar to functionality normally seen in
     * various spreadsheet applications.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/FillHandle)
     */
    fillHandleFeature? : object|boolean|string|FillHandle|FillHandleConfig
    /**
     * Feature that allows filtering of the grid by settings filters on columns. The actual filtering is done by the store.
     * For info on programmatically handling filters, see [StoreFilter](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/StoreFilter).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Filter)
     */
    filterFeature? : object|boolean|string|Filter|FilterConfig
    /**
     * Feature that allows filtering of the grid by entering filters on column headers.
     * The actual filtering is done by the store.
     * For info on programmatically handling filters, see [StoreFilter](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/StoreFilter).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/FilterBar)
     */
    filterBarFeature? : object|boolean|string|FilterBar|FilterBarConfig
    /**
     * Enables rendering and handling of row groups. The actual grouping is done in the store, but triggered by
     * <kbd>shift</kbd> + clicking headers, or by using the context menu, or by using two finger tap (one on header,
     * one anywhere on grid). Use <kbd>shift</kbd> + <kbd>alt</kbd> + click, or the context menu, to remove a column
     * grouper.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Group)
     */
    groupFeature? : object|boolean|string|Group|GroupConfig
    /**
     * Displays a summary row as a group footer in a grouped grid. Uses the same configuration options on columns as
     * [Summary](https://bryntum.com/products/gantt/docs/api/Grid/feature/Summary).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/GroupSummary)
     */
    groupSummaryFeature? : object|boolean|string|GridGroupSummary|GridGroupSummaryConfig
    /**
     * Right click column header or focus it and press SPACE key to show the context menu for headers.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/HeaderMenu)
     */
    headerMenuFeature? : object|boolean|string|HeaderMenu|HeaderMenuConfig
    /**
     * Enables users to click and drag to zoom to a date range in Scheduler's header time axis. Only supported in horizontal
     * mode.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/HeaderZoom)
     */
    headerZoomFeature? : object|boolean|string|HeaderZoom|HeaderZoomConfig
    /**
     * The Indicators feature displays indicators (icons) for different dates related to a task in its row. Hovering an
     * indicator will show a tooltip with its name and date(s). The owning task `id` is embedded in the indicator element
     * dataset as `taskRecordId` which can be useful if you want to have custom actions when clicking (showing a menu for example).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Indicators)
     */
    indicatorsFeature? : object|boolean|string|Indicators|IndicatorsConfig
    /**
     * A feature that lets you display a label on each side of a Gantt task bar. See
     * [Labels](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Labels) for more information.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Labels)
     */
    labelsFeature? : object|boolean|string|Labels|LabelsConfig
    /**
     * This feature allows records which satisfy a certain condition to be locked at the top of the grid.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/LockRows)
     */
    lockRowsFeature? : object|boolean|string|GridLockRows|GridLockRowsConfig
    /**
     * This feature merges cells that have the same value in sorted (or [optionally](https://bryntum.com/products/gantt/docs/api/Grid/feature/MergeCells#config-sortedOnly) any) columns
     * configured to [mergeCells](https://bryntum.com/products/gantt/docs/api/Grid/column/Column#config-mergeCells).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/MergeCells)
     */
    mergeCellsFeature? : object|boolean|string|MergeCells|MergeCellsConfig
    /**
     * A feature that allows exporting Gantt to Microsoft Project without involving a server.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/export/MspExport)
     */
    mspExportFeature? : object|boolean|string|MspExport|MspExportConfig
    /**
     * Feature that allows styling of weekends (and other non-working time) by adding timeRanges for those days.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/NonWorkingTime)
     */
    nonWorkingTimeFeature? : object|boolean|string|NonWorkingTime|NonWorkingTimeConfig
    /**
     * Makes the scheduler's timeline pannable by dragging with the mouse. Try it out in the demo below.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Pan)
     */
    panFeature? : object|boolean|string|Pan|PanConfig
    /**
     * Highlights the area encapsulating all child tasks of a parent task in a semi-transparent layer. You can style
     * these layer elements using the `b-parent-area` CSS class.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ParentArea)
     */
    parentAreaFeature? : object|boolean|string|ParentArea|ParentAreaConfig
    /**
     * Generates PDF/PNG files from the Gantt component.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/export/PdfExport)
     */
    pdfExportFeature? : object|boolean|string|PdfExport|PdfExportConfig
    /**
     * This feature visualizes the [percentDone](https://bryntum.com/products/gantt/docs/api/SchedulerPro/model/mixin/PercentDoneMixin#field-percentDone) field as a
     * progress bar on the event elements. Each progress bar also optionally has a drag handle which users can drag can
     * change the value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/PercentBar)
     */
    percentBarFeature? : object|boolean|string|PercentBar|PercentBarConfig
    /**
     * Allows pinning columns to the start or end region of the grid without any additional subGrid configurations.
     * When pinning to a region that does not yet exist, the feature creates the required subGrid on the fly.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/PinColumns)
     */
    pinColumnsFeature? : object|boolean|string|PinColumns|PinColumnsConfig
    /**
     * Allows printing Gantt contents using browser print dialog.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/export/Print)
     */
    printFeature? : object|boolean|string|Print|PrintConfig
    /**
     * This feature draws project progress line with SVG lines. Requires [PercentBar](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/PercentBar) to be enabled (which
     * by default, it is)
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ProgressLine)
     */
    progressLineFeature? : object|boolean|string|ProgressLine|ProgressLineConfig
    /**
     * Feature that displays the [project editor](https://bryntum.com/products/gantt/docs/api/Gantt/widget/ProjectEditor) allowing users to edit
     * the project settings.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ProjectEdit)
     */
    projectEditFeature? : object|boolean|string|ProjectEdit|ProjectEditConfig
    /**
     * This feature draws the vertical lines in the schedule area, indicating project start/end dates
     * and also its [status date](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#field-statusDate). The latter can be disabled
     * with the [showStatusDate](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ProjectLines#config-showStatusDate) config.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ProjectLines)
     */
    projectLinesFeature? : object|boolean|string|ProjectLines|ProjectLinesConfig
    /**
     * Feature that allows the user to search in a column by focusing a cell and typing. Navigate between hits using the
     * keyboard, [f3] or [ctrl]/[cmd] + [g] moves to next, also pressing [shift] moves to previous.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/QuickFind)
     */
    quickFindFeature? : object|boolean|string|QuickFind|QuickFindConfig
    /**
     * Makes the splitter between grid [sections](https://bryntum.com/products/gantt/docs/api/Grid/view/SubGrid) draggable, to let users resize, and
     * collapse/expand the sections.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RegionResize)
     */
    regionResizeFeature? : object|boolean|string|RegionResize|RegionResizeConfig
    /**
     * If the task's [rollup](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-rollup) data field is set to `true`, it displays a small bar or diamond below its summary task in the timeline.
     * Each of the rollup elements show a tooltip when hovering it with details of the task.
     * The tooltip content is customizable, see [template](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Rollups#config-template) config for details.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Rollups)
     */
    rollupsFeature? : object|boolean|string|Rollups|RollupsConfig
    /**
     * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut-and-paste rows. Also makes cut, copy and paste actions
     * available via the cell context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowCopyPaste)
     */
    rowCopyPasteFeature? : object|boolean|string|RowCopyPaste|RowCopyPasteConfig
    /**
     * This feature allows editing of entire rows in a grid in a docked panel which by default slides out from the right.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowEdit)
     */
    rowEditFeature? : object|boolean|string|RowEdit|RowEditConfig
    /**
     * Enables expanding of Grid rows by either row click or double click, or by adding a separate Grid column which renders
     * a button that expands or collapses the row.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowExpander)
     */
    rowExpanderFeature? : object|boolean|string|RowExpander|RowExpanderConfig
    /**
     * This feature implements support for project transactions and used by default in Gantt. For general RowReorder feature
     * documentation see [RowReorder](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowReorder).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/RowReorder)
     */
    rowReorderFeature? : object|boolean|string|RowReorder|RowReorderConfig
    /**
     * Enables user to change row height by dragging the bottom row border. After a resize operation, the [rowHeight](https://bryntum.com/products/gantt/docs/api/Grid/data/GridRowModel#field-rowHeight)
     * field of the record is updated (when [applyToAllRows](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowResize#config-applyToAllRows) is `false`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowResize)
     */
    rowResizeFeature? : object|boolean|string|GridRowResize|GridRowResizeConfig
    /**
     * Displays a context menu for empty parts of the schedule. Items are populated in the first place
     * by configurations of this Feature, then by other features and/or application code.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleMenu)
     */
    scheduleMenuFeature? : object|boolean|string|ScheduleMenu|ScheduleMenuConfig
    /**
     * Feature that displays a tooltip containing the time at the mouse position when hovering empty parts of the schedule.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleTooltip)
     */
    scheduleTooltipFeature? : object|boolean|string|ScheduleTooltip|ScheduleTooltipConfig
    /**
     * This feature injects buttons in each row that scrolls the task bar into view. It can optionally show a label along
     * with the button, using the [labelRenderer](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ScrollButtons#config-labelRenderer).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ScrollButtons)
     */
    scrollButtonsFeature? : object|boolean|string|ScrollButtons|ScrollButtonsConfig
    /**
     * <div class="external-example vertical" data-file="Grid/feature/Search.js"></div>
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Search)
     */
    searchFeature? : object|boolean|string|Search|SearchConfig
    /**
     * Allows sorting of grid by clicking (or tapping) headers, also displays which columns grid is sorted by (numbered if
     * using multisort). Use modifier keys for multisorting: [Ctrl/CMD + click] to add sorter, [Ctrl/CMD + Alt + click] to remove sorter.
     * The actual sorting is done by the store, see [Store.sort()](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/StoreSort#function-sort).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Sort)
     */
    sortFeature? : object|boolean|string|Sort|SortConfig
    /**
     * This feature allows splitting the Grid into multiple views, either by using the cell context menu, or
     * programmatically by calling [split()](https://bryntum.com/products/gantt/docs/api/Grid/feature/Split#function-split).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Split)
     */
    splitFeature? : object|boolean|string|GridSplit|GridSplitConfig
    /**
     * A feature which pins configurable content from a grid row to the top of the grid
     * while the row scrolls off the top but is still visible.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/StickyCells)
     */
    stickyCellsFeature? : object|boolean|string|StickyCells|StickyCellsConfig
    /**
     * Stripes rows by adding alternating CSS classes to all row elements (`b-even` and `b-odd`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Stripe)
     */
    stripeFeature? : object|boolean|string|Stripe|StripeConfig
    /**
     * A feature displaying a summary bar in the grid footer.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Summary)
     */
    summaryFeature? : object|boolean|string|Summary|SummaryConfig
    /**
     * Allow using <kbd>Ctrl</kbd>/<kbd>CMD</kbd> + <kbd>C</kbd>/<kbd>X</kbd> and <kbd>Ctrl</kbd>/<kbd>CMD</kbd> +
     * <kbd>V</kbd> to copy/cut and paste tasks. You can configure how a newly pasted record is named using
     * [generateNewName](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskCopyPaste#config-generateNewName)
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskCopyPaste)
     */
    taskCopyPasteFeature? : object|boolean|string|TaskCopyPaste|TaskCopyPasteConfig
    /**
     * Allows user to drag and drop tasks within Gantt, to change their start date.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskDrag)
     */
    taskDragFeature? : object|boolean|string|TaskDrag|TaskDragConfig
    /**
     * A feature that allows the user to schedule tasks by dragging in the empty parts of the gantt timeline row. Note, this feature is only applicable for unscheduled tasks.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskDragCreate)
     */
    taskDragCreateFeature? : object|boolean|string|TaskDragCreate|TaskDragCreateConfig
    /**
     * Feature that allows editing tasks using a [TaskEditor](https://bryntum.com/products/gantt/docs/api/Gantt/widget/TaskEditor), a popup with fields for editing task data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskEdit)
     */
    taskEditFeature? : object|boolean|string|TaskEdit|TaskEditConfig
    /**
     * Displays a context menu for tasks. Items are populated by other features and/or application code.
     * Configure it with `false` to disable it completely. If enabled, [CellMenu](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellMenu) feature
     * is not available. Cell context menu items are handled by this feature.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskMenu)
     */
    taskMenuFeature? : object|boolean|string|TaskMenu|TaskMenuConfig
    /**
     * Feature highlighting the non-working time intervals for tasks, based on their [calendar](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-calendar).
     * If a task has no calendar defined, the project's calendar will be used. The non-working time interval can also be
     * recurring. You can find a live example showing how to achieve this in the [Task Calendars Demo](../examples/calendars/).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskNonWorkingTime)
     */
    taskNonWorkingTimeFeature? : object|boolean|string|TaskNonWorkingTime|TaskNonWorkingTimeConfig
    /**
     * Feature that allows resizing a task by dragging its end date. Resizing a task by dragging its start date is not allowed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskResize)
     */
    taskResizeFeature? : object|boolean|string|TaskResize|TaskResizeConfig
    /**
     * Allows user to drag and drop task segments, to change their start date.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskSegmentDrag)
     */
    taskSegmentDragFeature? : object|boolean|string|TaskSegmentDrag|TaskSegmentDragConfig
    /**
     * Feature that allows resizing a task segment by dragging its end.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskSegmentResize)
     */
    taskSegmentResizeFeature? : object|boolean|string|TaskSegmentResize|TaskSegmentResizeConfig
    /**
     * This feature displays a task tooltip on mouse hover. The template of the tooltip is customizable
     * with the [template](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskTooltip#config-template) function.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TaskTooltip)
     */
    taskTooltipFeature? : object|boolean|string|TaskTooltip|TaskTooltipConfig
    /**
     * Adds scheduler specific menu items to the timeline header context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeAxisHeaderMenu)
     */
    timeAxisHeaderMenuFeature? : object|boolean|string|TimeAxisHeaderMenu|TimeAxisHeaderMenuConfig
    /**
     * This feature allows drawing line charts on top of the timeline area. Feature consists of two parts: chart and
     * data providers. Chart provider is responsible for rendering the chart, while data provider is responsible
     * for providing data for the chart. Feature itself manages the interaction between them, and tracks lifecycle events
     * of the Gantt chart.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TimelineChart)
     */
    timelineChartFeature? : object|boolean|string|TimelineChart|TimelineChartConfig
    /**
     * Feature that renders global ranges of time in the timeline. Use this feature to visualize a `range` like a 1 hr lunch
     * or some important point in time (a `line`, i.e. a range with 0 duration). This feature can also show a current time
     * indicator if you set [showCurrentTimeLine](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges#config-showCurrentTimeLine) to true. To style the rendered elements, use the
     * [cls](https://bryntum.com/products/gantt/docs/api/Scheduler/model/TimeSpan#field-cls) field of the `TimeSpan` class.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges)
     */
    timeRangesFeature? : object|boolean|string|TimeRanges|TimeRangesConfig
    /**
     * This feature exposes methods on the owning Scheduler or Gantt widget which you can use to highlight one or multiple time spans
     * in the schedule. Please see [highlightTimeSpan](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/TimeSpanHighlight#function-highlightTimeSpan) and [highlightTimeSpans](#SchedulerPro/feature/TimeSpanHighlight#function-highlightTimeSpans) to learn
     * more or try the demo below:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/feature/TimeSpanHighlight)
     */
    timeSpanHighlightFeature? : object|boolean|string|TimeSpanHighlight|TimeSpanHighlightConfig
    /**
     * Feature that makes the grid work more like a tree. Included by default in [TreeGrid](https://bryntum.com/products/gantt/docs/api/Grid/view/TreeGrid). Requires
     * exactly one [TreeColumn](https://bryntum.com/products/gantt/docs/api/Grid/column/TreeColumn) among grids columns. That column will have its renderer replaced with a
     * tree renderer that adds padding and icon to give the appearance of a tree. The original renderer is preserved and
     * also called.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Tree)
     */
    treeFeature? : object|boolean|string|Tree|TreeConfig
    /**
     * Extends Grid's [TreeGroup](https://bryntum.com/products/gantt/docs/api/Grid/feature/TreeGroup) (follow the link for more info) feature to enable using it with Gantt.
     * Allows generating a new task tree where parents are determined by the values of specified task fields/functions:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/TreeGroup)
     */
    treeGroupFeature? : object|boolean|string|TreeGroup|TreeGroupConfig
    /**
     * Captures versions (snapshots) of the active project, including a detailed log of the changes new in each version.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/feature/Versions)
     */
    versionsFeature? : object|boolean|string|Versions|VersionsConfig

}

export class BryntumGanttBase extends React.Component<BryntumGanttBaseProps> {

    static instanceClass = GanttBase;

    static instanceName = 'GanttBase';

    processWidgetContent = processWidgetContent;

    // Component is View class
    static isView = true;

    // Hidden div to host unused portals DOM
    portalsCache? : HTMLElement;

    // CSS class used for individual portal containers
    portalContainerClass = 'b-react-portal-container';

    state = {
        // Holds React portals
        portals : new Map(),

        // Needed to trigger refresh when portals change
        generation : 0
    };

    static featureNames = [
        'aiFilterFeature',
        'baselinesFeature',
        'cellCopyPasteFeature',
        'cellEditFeature',
        'cellMenuFeature',
        'cellTooltipFeature',
        'chartsFeature',
        'columnAutoWidthFeature',
        'columnDragToolbarFeature',
        'columnLinesFeature',
        'columnPickerFeature',
        'columnRenameFeature',
        'columnReorderFeature',
        'columnResizeFeature',
        'criticalPathsFeature',
        'dependenciesFeature',
        'dependencyEditFeature',
        'eventFilterFeature',
        'eventSegmentsFeature',
        'excelExporterFeature',
        'fileDropFeature',
        'fillHandleFeature',
        'filterFeature',
        'filterBarFeature',
        'groupFeature',
        'groupSummaryFeature',
        'headerMenuFeature',
        'headerZoomFeature',
        'indicatorsFeature',
        'labelsFeature',
        'lockRowsFeature',
        'mergeCellsFeature',
        'mspExportFeature',
        'nonWorkingTimeFeature',
        'panFeature',
        'parentAreaFeature',
        'pdfExportFeature',
        'percentBarFeature',
        'pinColumnsFeature',
        'printFeature',
        'progressLineFeature',
        'projectEditFeature',
        'projectLinesFeature',
        'quickFindFeature',
        'regionResizeFeature',
        'rollupsFeature',
        'rowCopyPasteFeature',
        'rowEditFeature',
        'rowExpanderFeature',
        'rowReorderFeature',
        'rowResizeFeature',
        'scheduleMenuFeature',
        'scheduleTooltipFeature',
        'scrollButtonsFeature',
        'searchFeature',
        'sortFeature',
        'splitFeature',
        'stickyCellsFeature',
        'stripeFeature',
        'summaryFeature',
        'taskCopyPasteFeature',
        'taskDragFeature',
        'taskDragCreateFeature',
        'taskEditFeature',
        'taskMenuFeature',
        'taskNonWorkingTimeFeature',
        'taskResizeFeature',
        'taskSegmentDragFeature',
        'taskSegmentResizeFeature',
        'taskTooltipFeature',
        'timeAxisHeaderMenuFeature',
        'timelineChartFeature',
        'timeRangesFeature',
        'timeSpanHighlightFeature',
        'treeFeature',
        'treeGroupFeature',
        'versionsFeature'
    ];

    projectStores = true;

    dataStores = {
        'assignmentStore': 'assignments',
        'calendarManagerStore': 'calendars',
        'dependencyStore': 'dependencies',
        'eventStore': 'events',
        'resourceStore': 'resources',
        'taskStore': 'tasks',
        'timeRangeStore': 'timeRanges'
    };

    static configNames = [
        'adopt',
        'allowCreate',
        'allowCreateOnlyParent',
        'animateFilterRemovals',
        'animateRemovingRows',
        'ariaDescription',
        'ariaLabel',
        'autoAdjustTimeAxis',
        'autoHeight',
        'bbar',
        'bodyCls',
        'bubbleEvents',
        'bufferCoef',
        'bufferThreshold',
        'collapsible',
        'color',
        'config',
        'contentElementCls',
        'contextMenuTriggerEvent',
        'creationTooltip',
        'cycleResolutionPopupClass',
        'dataField',
        'defaultRegion',
        'defaultResourceImageName',
        'dependencyIdField',
        'destroyStore',
        'detectCSSCompatibilityIssues',
        'disableGridColumnIdWarning',
        'disableGridRowModelWarning',
        'displaySchedulingIssueResolutionPopup',
        'dock',
        'drawer',
        'durationDisplayPrecision',
        'elementAttributes',
        'enableDeleteKey',
        'enableRecurringEvents',
        'enableSticky',
        'enableTextSelection',
        'enableTransactionalFeatures',
        'fillLastColumn',
        'fixedRowHeight',
        'footer',
        'formulaProviders',
        'fullRowRefresh',
        'getDateConstraints',
        'getRowHeight',
        'header',
        'hideHorizontalScrollbar',
        'hoverCls',
        'icon',
        'ignoreDomEventsWhileScrolling',
        'ignoreParentReadOnly',
        'listeners',
        'loadMask',
        'loadMaskDefaults',
        'loadMaskError',
        'localizable',
        'managedEventSizing',
        'maskDefaults',
        'masked',
        'maxDate',
        'maxTimeAxisUnit',
        'minDate',
        'monitorResize',
        'newTaskDefaults',
        'owner',
        'partner',
        'plugins',
        'preserveFocusOnDatasetChange',
        'preserveScrollOnDatasetChange',
        'preventTooltipOnTouch',
        'projectProgressReporting',
        'relayStoreEvents',
        'resizable',
        'resizeToFitIncludesHeader',
        'resourceImageFolderPath',
        'resourceImagePath',
        'responsiveLevels',
        'ripple',
        'rootElement',
        'schedulingIssueResolutionPopupClass',
        'scrollerClass',
        'scrollManager',
        'showCostControls',
        'showCreationTooltip',
        'showDirty',
        'showLagInTooltip',
        'showRecurringUI',
        'showTaskColorPickers',
        'snapRelativeToEventStartDate',
        'stateful',
        'statefulEvents',
        'stateId',
        'stateProvider',
        'stickyHeaders',
        'strips',
        'subGridConfigs',
        'syncMask',
        'tab',
        'tabBarItems',
        'taskRenderer',
        'tbar',
        'terminalCls',
        'terminalSides',
        'timeAxis',
        'ui',
        'visibleZoomFactor',
        'weekStartDay',
        'weight',
        'zoomKeepsOriginalTimespan',
        'zoomOnMouseWheel',
        'zoomOnTimeAxisDoubleClick'
    ];

    static propertyConfigNames = [
        'alignSelf',
        'allowDropOnEventBar',
        'animateTreeNodeToggle',
        'appendTo',
        'assignments',
        'barMargin',
        'calendars',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'cellEllipsis',
        'cls',
        'collapsed',
        'column',
        'columnLines',
        'columns',
        'creationTooltipTemplate',
        'data',
        'dataset',
        'dependencies',
        'disabled',
        'displayDateFormat',
        'emptyText',
        'enableEventAnimations',
        'enableUndoRedoKeys',
        'endDate',
        'eventColor',
        'eventStyle',
        'extraData',
        'fillTicks',
        'flex',
        'forceFit',
        'height',
        'hidden',
        'hideFooters',
        'hideHeaders',
        'hideRowHover',
        'id',
        'infiniteScroll',
        'inputFieldAlign',
        'insertBefore',
        'insertFirst',
        'keyMap',
        'labelPosition',
        'longPressTime',
        'margin',
        'maxHeight',
        'maxWidth',
        'maxZoomLevel',
        'minHeight',
        'minWidth',
        'minZoomLevel',
        'onAfterDependencyCreateDrop',
        'onAfterDependencySave',
        'onAfterDragCreate',
        'onAfterEventEdit',
        'onAfterEventSave',
        'onAfterProjectEdit',
        'onAfterProjectSave',
        'onAfterTaskDrop',
        'onAfterTaskEdit',
        'onAfterTaskSave',
        'onAfterTaskSegmentDrop',
        'onBeforeAssignmentDelete',
        'onBeforeCancelCellEdit',
        'onBeforeCancelRowEdit',
        'onBeforeCellEditStart',
        'onBeforeCellRangeDelete',
        'onBeforeCellRangeEdit',
        'onBeforeColumnDragStart',
        'onBeforeColumnDropFinalize',
        'onBeforeColumnResize',
        'onBeforeCopy',
        'onBeforeCSVExport',
        'onBeforeDependencyAdd',
        'onBeforeDependencyCreateDrag',
        'onBeforeDependencyCreateFinalize',
        'onBeforeDependencyDelete',
        'onBeforeDependencyEdit',
        'onBeforeDependencyEditShow',
        'onBeforeDependencySave',
        'onBeforeDestroy',
        'onBeforeDragCreate',
        'onBeforeDragCreateFinalize',
        'onBeforeEventDelete',
        'onBeforeEventEdit',
        'onBeforeEventEditShow',
        'onBeforeEventResize',
        'onBeforeEventResizeFinalize',
        'onBeforeEventSave',
        'onBeforeEventSegmentResize',
        'onBeforeEventSegmentResizeFinalize',
        'onBeforeExcelExport',
        'onBeforeFillHandleDragStart',
        'onBeforeFinishCellEdit',
        'onBeforeFinishRowEdit',
        'onBeforeHide',
        'onBeforeMspExport',
        'onBeforePan',
        'onBeforePaste',
        'onBeforePdfExport',
        'onBeforePresetChange',
        'onBeforeProjectEdit',
        'onBeforeProjectEditShow',
        'onBeforeProjectSave',
        'onBeforeRenderRow',
        'onBeforeRenderRows',
        'onBeforeRowCollapse',
        'onBeforeRowExpand',
        'onBeforeSelectionChange',
        'onBeforeSetRecord',
        'onBeforeShow',
        'onBeforeShowTerminals',
        'onBeforeStartRowEdit',
        'onBeforeStateApply',
        'onBeforeStateSave',
        'onBeforeTaskAdd',
        'onBeforeTaskDelete',
        'onBeforeTaskDrag',
        'onBeforeTaskDropFinalize',
        'onBeforeTaskEdit',
        'onBeforeTaskEditShow',
        'onBeforeTaskResize',
        'onBeforeTaskResizeFinalize',
        'onBeforeTaskSave',
        'onBeforeTaskSegmentDrag',
        'onBeforeTaskSegmentDropFinalize',
        'onBeforeTaskSegmentResize',
        'onBeforeTaskSegmentResizeFinalize',
        'onBeforeToggleGroup',
        'onBeforeToggleNode',
        'onCancelCellEdit',
        'onCatchAll',
        'onCellClick',
        'onCellContextMenu',
        'onCellDblClick',
        'onCellMenuBeforeShow',
        'onCellMenuItem',
        'onCellMenuShow',
        'onCellMenuToggleItem',
        'onCellMouseEnter',
        'onCellMouseLeave',
        'onCellMouseOut',
        'onCellMouseOver',
        'onCollapse',
        'onCollapseNode',
        'onColumnDrag',
        'onColumnDragStart',
        'onColumnDrop',
        'onColumnResize',
        'onColumnResizeStart',
        'onContextMenuItem',
        'onContextMenuToggleItem',
        'onCopy',
        'onCriticalPathsHighlighted',
        'onCriticalPathsUnhighlighted',
        'onCurrentTimelineUpdate',
        'onDataChange',
        'onDateRangeChange',
        'onDependenciesDrawn',
        'onDependencyClick',
        'onDependencyContextMenu',
        'onDependencyCreateDragStart',
        'onDependencyCreateDrop',
        'onDependencyDblClick',
        'onDependencyMouseOut',
        'onDependencyMouseOver',
        'onDependencyValidationComplete',
        'onDependencyValidationStart',
        'onDestroy',
        'onDirtyStateChange',
        'onDragCreateEnd',
        'onDragCreateStart',
        'onDragSelecting',
        'onElementCreated',
        'onEventEditBeforeSetRecord',
        'onEventMenuBeforeShow',
        'onEventMenuItem',
        'onEventMenuShow',
        'onEventPartialResize',
        'onEventResizeEnd',
        'onEventResizeStart',
        'onEventSegmentPartialResize',
        'onEventSegmentResizeEnd',
        'onEventSegmentResizeStart',
        'onExpand',
        'onExpandNode',
        'onFileDrop',
        'onFillHandleBeforeDragFinalize',
        'onFillHandleDrag',
        'onFillHandleDragAbort',
        'onFillHandleDragEnd',
        'onFillHandleDragStart',
        'onFinishCellEdit',
        'onFinishRowEdit',
        'onFocusIn',
        'onFocusOut',
        'onGridRowBeforeDragStart',
        'onGridRowBeforeDropFinalize',
        'onGridRowDrag',
        'onGridRowDragAbort',
        'onGridRowDragStart',
        'onGridRowDrop',
        'onHeaderClick',
        'onHeaderMenuBeforeShow',
        'onHeaderMenuItem',
        'onHeaderMenuShow',
        'onHeaderMenuToggleItem',
        'onHide',
        'onLockRows',
        'onMouseOut',
        'onMouseOver',
        'onMspExport',
        'onNavigate',
        'onNoZoomChange',
        'onPaint',
        'onPaste',
        'onPdfExport',
        'onPercentBarDrag',
        'onPercentBarDragAbort',
        'onPercentBarDragStart',
        'onPercentBarDrop',
        'onPresetChange',
        'onProjectEditCanceled',
        'onReadOnly',
        'onRecompose',
        'onReleaseTask',
        'onRenderRow',
        'onRenderRows',
        'onRenderTask',
        'onResize',
        'onResourceAssignmentClick',
        'onResponsive',
        'onRowCollapse',
        'onRowExpand',
        'onRowMouseEnter',
        'onRowMouseLeave',
        'onScheduleMenuBeforeShow',
        'onScheduleMenuItem',
        'onScheduleMenuShow',
        'onScroll',
        'onScrollButtonClick',
        'onSelectionChange',
        'onSelectionModeChange',
        'onShow',
        'onSplit',
        'onSplitterCollapseClick',
        'onSplitterDragEnd',
        'onSplitterDragStart',
        'onSplitterExpandClick',
        'onStartCellEdit',
        'onStartRowEdit',
        'onSubGridCollapse',
        'onSubGridExpand',
        'onTaskClick',
        'onTaskContextMenu',
        'onTaskDblClick',
        'onTaskDrag',
        'onTaskDragStart',
        'onTaskDrop',
        'onTaskEditCanceled',
        'onTaskKeyDown',
        'onTaskKeyUp',
        'onTaskMenuBeforeShow',
        'onTaskMenuItem',
        'onTaskMenuShow',
        'onTaskMouseDown',
        'onTaskMouseOut',
        'onTaskMouseOver',
        'onTaskMouseUp',
        'onTaskNonWorkingTimeClick',
        'onTaskNonWorkingTimeContextMenu',
        'onTaskNonWorkingTimeDblClick',
        'onTaskPartialResize',
        'onTaskResizeEnd',
        'onTaskResizeStart',
        'onTaskSegmentDrag',
        'onTaskSegmentDragStart',
        'onTaskSegmentDrop',
        'onTaskSegmentPartialResize',
        'onTaskSegmentResizeEnd',
        'onTaskSegmentResizeStart',
        'onTickSizeChange',
        'onTimeAxisChange',
        'onTimeAxisHeaderClick',
        'onTimeAxisHeaderContextMenu',
        'onTimeAxisHeaderDblClick',
        'onTimeAxisHeaderMenuBeforeShow',
        'onTimeAxisHeaderMenuItem',
        'onTimeAxisHeaderMenuShow',
        'onTimelineContextChange',
        'onTimelineViewportResize',
        'onTimeRangeHeaderClick',
        'onTimeRangeHeaderContextMenu',
        'onTimeRangeHeaderDblClick',
        'onToggleGroup',
        'onToggleNode',
        'onToolClick',
        'onTransactionChange',
        'onUnlockRows',
        'onUnsplit',
        'onVisibleDateRangeChange',
        'preserveScroll',
        'presets',
        'project',
        'readOnly',
        'recurrenceConfirmationPopup',
        'rendition',
        'resources',
        'rowHeight',
        'rowLines',
        'rtl',
        'scrollable',
        'scrollTaskIntoViewOnCellClick',
        'selectionMode',
        'showTooltip',
        'showUnscheduledTasks',
        'snap',
        'span',
        'startDate',
        'stateSettings',
        'store',
        'suppressFit',
        'tasks',
        'taskStore',
        'terminalHideDelay',
        'terminalOffset',
        'terminalShowDelay',
        'terminalSize',
        'tickSize',
        'timeRanges',
        'timeResolution',
        'timeZone',
        'title',
        'toggleParentTasksOnClick',
        'tools',
        'tooltipTemplate',
        'transition',
        'transitionDuration',
        'useContextualRecurrenceRules',
        'viewPreset',
        'visibleDate',
        'width',
        'workingTime'
    ];

    static propertyNames = [
        'calendarManagerStore',
        'focusVisible',
        'hasChanges',
        'originalStore',
        'parent',
        'scrollLeft',
        'scrollTop',
        'scrollX',
        'selectedCell',
        'selectedCells',
        'selectedRecord',
        'selectedRecords',
        'selectedRows',
        'state',
        'tooltip',
        'zoomLevel'
    ];

    // Component instance
    instance!: GanttBase;

    // Component element
    element! : HTMLElement;

    componentDidMount(): void {
        this.instance = createWidget(this);
    }

    componentWillUnmount(): void {
        // @ts-ignore
        this.instance?.destroy?.();
    }

    /**
     * Component about to be updated, from changing a prop using state.
     * React to it depending on what changed and prevent react from re-rendering our component.
     * @param nextProps
     * @param nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps: Readonly<BryntumGanttBaseProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-gantt-base-container`;
        return (
            <React.Fragment>
                <div className={className} ref={(element) => (this.element = element!)}>
                    {Array.from(this.state.portals).map((item) => item[1])}
                </div>
                <div ref={el => (this.portalsCache = el!)} className="b-react-portals-cache" style={{ display : 'none' }}></div>
            </React.Fragment>
        );

    }
}
