/**
 * React wrapper for Bryntum Timeline
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, Base, CellCopyPaste, CellCopyPasteConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnLines, ColumnLinesConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, CrudManager, CrudManagerConfig, DateConstraint, DependencyBaseModel, DependencyMenu, DependencyMenuConfig, DependencyStoreConfig, DomClassList, DomConfig, DropData, DurationConfig, DurationUnit, EmptyTextDomConfig, EventColor, EventCopyPaste, EventCopyPasteConfig, EventDrag, EventDragConfig, EventDragCreate, EventDragCreateConfig, EventDragSelect, EventDragSelectConfig, EventEdit, EventEditConfig, EventFilter, EventFilterConfig, EventMenu, EventMenuConfig, EventNonWorkingTime, EventNonWorkingTimeConfig, EventResizeData, EventTooltip, EventTooltipConfig, ExcelExporter, ExcelExporterConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Grid, GridBase, GridCellEdit, GridCellEditConfig, GridColumnConfig, GridLocation, GridLocationConfig, GridSelectionMode, GridTreeGroup, GridTreeGroupConfig, Group, GroupConfig, GroupSummary, GroupSummaryConfig, HeaderMenu, HeaderMenuConfig, HeaderZoom, HeaderZoomConfig, KeyMapConfig, LockRows, LockRowsConfig, Mask, MaskConfig, Menu, MenuConfig, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, NonWorkingTime, NonWorkingTimeConfig, PagingToolbarConfig, Pan, PanConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PinColumns, PinColumnsConfig, Popup, PreserveScrollOptions, PresetStore, ProjectModel, ProjectModelConfig, QuickFind, QuickFindConfig, RecordPositionContext, Rectangle, RecurrenceConfirmationPopup, RecurrenceConfirmationPopupConfig, RegionResize, RegionResizeConfig, ResourceHeaderConfig, ResourceMarginConfig, ResourceMenu, ResourceMenuConfig, ResourceTimeRangeModel, ResourceTimeRangeModelConfig, ResourceTimeRangeStore, ResourceTimeRangeStoreConfig, ResourceTimeRanges, ResourceTimeRangesConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, RowReorder, RowReorderConfig, RowResize, RowResizeConfig, ScheduleContext, ScheduleContextConfig, ScheduleMenu, ScheduleMenuConfig, ScheduleTooltip, ScheduleTooltipConfig, Scheduler, SchedulerAssignmentModel, SchedulerAssignmentModelConfig, SchedulerAssignmentStore, SchedulerAssignmentStoreConfig, SchedulerBase, SchedulerDependencies, SchedulerDependenciesConfig, SchedulerDependencyEdit, SchedulerDependencyEditConfig, SchedulerDependencyModel, SchedulerDependencyModelConfig, SchedulerDependencyStore, SchedulerEventModel, SchedulerEventModelConfig, SchedulerEventResize, SchedulerEventResizeConfig, SchedulerEventStore, SchedulerEventStoreConfig, SchedulerLabels, SchedulerLabelsConfig, SchedulerPdfExport, SchedulerPdfExportConfig, SchedulerPrint, SchedulerPrintConfig, SchedulerProProjectModel, SchedulerResourceModel, SchedulerResourceModelConfig, SchedulerResourceStore, SchedulerResourceStoreConfig, SchedulerScrollButtons, SchedulerScrollButtonsConfig, SchedulerStateInfo, SchedulerSummary, SchedulerSummaryConfig, SchedulerTimeAxisColumn, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, SimpleEventEdit, SimpleEventEditConfig, Sort, SortConfig, Split, SplitConfig, StateProvider, StickyCells, StickyCellsConfig, StickyEvents, StickyEventsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, TabConfig, TimeAxis, TimeAxisConfig, TimeAxisHeaderMenu, TimeAxisHeaderMenuConfig, TimeRanges, TimeRangesConfig, TimeSelection, TimeSelectionConfig, TimeSpan, TimeSpanConfig, Timeline, TimelineBase, TimelineContext, TimelineListeners, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, Tree, TreeConfig, TreeSummary, TreeSummaryConfig, VerticalTimeAxisColumn, VerticalTimeAxisColumnConfig, ViewPreset, ViewPresetConfig, VisibleDate, Widget, XLSColumn } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumTimelineProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-adopt)
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
     * Set to `false` if you don't want to allow events overlapping times for any one resource (defaults to `true`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-allowOverlap)
     */
    allowOverlap? : boolean
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Inline assignments, will be loaded into an internally created AssignmentStore.
     */
    assignments? : SchedulerAssignmentModel[]|object[]|SchedulerAssignmentModelConfig[]
    /**
     * The optional [AssignmentStore](https://bryntum.com/products/gantt/docs/api/Scheduler/data/AssignmentStore), holding assignments between resources and events.
     * Required for multi assignments.
     */
    assignmentStore? : SchedulerAssignmentStore|SchedulerAssignmentStoreConfig
    /**
     * You can set this option to `false` to make the timeline panel start and end on the exact provided
     * [startDate](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-startDate)/[endDate](#Scheduler/view/TimelineBase#config-endDate) w/o adjusting them.
     */
    autoAdjustTimeAxis? : boolean
    /**
     * If this config is set, then its `gesture` property (which defaults to `dblclick`) creates a
     * new event at the mouse or touch event's time point.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-autoCreate)
     * @param {'click','dblclick'} autoCreate.gesture The gesture to trigger auto creation of an event. Defaults to `dblclick`.
     * @param {boolean} autoCreate.useEventModelDefaults Set to `true` to set default duration based on the defaults specified by the [duration](https://bryntum.com/products/gantt/docs/api/Scheduler/model/EventModel#field-duration) and [durationUnit](https://bryntum.com/products/gantt/docs/api/Scheduler/model/EventModel#field-durationUnit) fields.
     * @param {'round','ceil','floor'} autoCreate.snapType The type of snapping to apply to the event start date. If omitted, the date will be floored to the time axis resolution.
     * @param {DurationConfig,string} autoCreate.step The increment to snap the event start date to.
     * @param {DurationConfig,string} autoCreate.duration The duration of the event to create. Defaults to 1 time axis tick.
     * @param {string} autoCreate.name The name of the event to create. Defaults to the `Object.newEvent` property from the locale.
     */
    autoCreate? : boolean|string|{autoCreate: { gesture?: 'click'|'dblclick', useEventModelDefaults?: boolean, snapType?: 'round'|'ceil'|'floor', step?: DurationConfig|string, duration?: DurationConfig|string, name?: string }}
    /**
     * Automatically set grids height to fit all rows (no scrolling in the grid). In general you should avoid
     * using `autoHeight: true`, since it will bypass Grids virtual rendering and render all rows at once, which
     * in a larger grid is really bad for performance.
     */
    autoHeight? : boolean
    /**
     * Controls how much space to leave between stacked event bars in px.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-barMargin)
     */
    barMargin? : number
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar. Another way to add a bbar is to use [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-bbar)
     */
    bbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * Custom CSS classes to add to the panel's body element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-bodyCls)
     */
    bodyCls? : string|object
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * This config defines the size of the start and end invisible parts of the timespan when [infiniteScroll](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineScroll#config-infiniteScroll) set to `true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-bufferCoef)
     */
    bufferCoef? : number
    /**
     * This config defines the scroll limit, which, when exceeded will cause a timespan shift.
     * The limit is calculated as the `panelWidth * [bufferCoef](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineScroll#config-bufferCoef) * bufferThreshold`. During scrolling, if the left or right side
     * has less than that of the rendered content - a shift is triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-bufferThreshold)
     */
    bufferThreshold? : number
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-catchEventHandlerExceptions)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-cls)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-collapsible)
     */
    collapsible? : boolean|PanelCollapserConfig|PanelCollapserOverlayConfig
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-color)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-columns)
     */
    columns? : ColumnStore|GridColumnConfig[]|ColumnStoreConfig
    config? : object
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-contentElementCls)
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
     * Supply a [CrudManager](https://bryntum.com/products/gantt/docs/api/Scheduler/data/CrudManager) instance or a config object if you want to use
     * CrudManager for handling data.
     */
    crudManager? : CrudManagerConfig|CrudManager
    /**
     * Class that should be used to instantiate a CrudManager in case it's provided as a simple object to
     * [crudManager](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerStores#config-crudManager) config.
     */
    crudManagerClass? : typeof CrudManager
    /**
     * Convenient shortcut to set data in grids store both during initialization and at runtime. Can also be
     * used to retrieve data at runtime, although we do recommend interacting with Grids store instead using
     * the [store](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#property-store) property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-data)
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
     * The date to display when used as a component of a Calendar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-date)
     */
    date? : Date
    /**
     * A [DateHelper](https://bryntum.com/products/gantt/docs/api/Core/helper/DateHelper) format string/function to use to create date output for view descriptions.
     * @param {Date} date The date to format.
     * @returns {string} The formatted date.
     */
    dateFormat? : string|((date: Date) => string)
    /**
     * A string used to separate start and end dates in the [descriptionFormat](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/Describable#config-descriptionFormat).
     */
    dateSeparator? : string
    /**
     * Region to which columns are added when they have none specified
     */
    defaultRegion? : string
    /**
     * Generic resource image, used when provided `imageUrl` or `image` fields or path calculated from resource
     * name are all invalid. If left blank, resource name initials will be shown when no image can be loaded.
     */
    defaultResourceImageName? : string
    /**
     * Inline dependencies, will be loaded into an internally created DependencyStore.
     */
    dependencies? : SchedulerDependencyModel[]|SchedulerDependencyModelConfig[]
    /**
     * The optional [DependencyStore](https://bryntum.com/products/gantt/docs/api/Scheduler/data/DependencyStore).
     */
    dependencyStore? : SchedulerDependencyStore|DependencyStoreConfig
    /**
     * The date format used by the default [descriptionRenderer](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/Describable#config-descriptionRenderer) for rendering the view's description.
     * If this value is `null`, the [dateFormat](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/Describable#config-dateFormat) (and potentially [dateSeparator](#Scheduler/view/mixin/Describable#config-dateSeparator)) will
     * be used.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-descriptionFormat)
     * @param {Date} date The date to format.
     * @returns {string} The formatted date.
     */
    descriptionFormat? : string|string[]|boolean[]|((date: Date) => string)|Function[]
    /**
     * A function that provides the textual description for this view. If provided, this function overrides the
     * [descriptionFormat](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/Describable#config-descriptionFormat).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-descriptionRenderer)
     * @param {Core.widget.Widget} view The active view in case the function is in another scope.
     * @returns {string} Description string
     */
    descriptionRenderer? : (view: Widget) => string
    /**
     * Configure as `false` to preserve selection when clicking the empty schedule area.
     */
    deselectAllOnScheduleClick? : boolean
    /**
     * Configure as `true` to deselect a selected event upon click.
     */
    deselectOnClick? : boolean
    /**
     * Set to `true` to destroy the store when the grid is destroyed.
     */
    destroyStore? : boolean
    /**
     * Configure as `true` to destroy the Project and stores when `this` is destroyed.
     */
    destroyStores? : boolean
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-disabled)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-displayDateFormat)
     */
    displayDateFormat? : string
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * Make this Panel a docked drawer which slides out from one side of the browser viewport by default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-drawer)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-elementAttributes)
     */
    elementAttributes? : Record<string, string|null>
    /**
     * Text or HTML, or a [EmptyTextDomConfig](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#typedef-EmptyTextDomConfig) block to display when there is no data to display in the grid.
     * When using multiple Grid regions, provide the `region` property to decide where the text is shown.
     * By default, it is shown in the first region.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-emptyText)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-enableRecurringEvents)
     */
    enableRecurringEvents? : boolean|{
        defaultAction?: 'single'|'future'
    }
    /**
     * Configure this as `true` to allow elements within cells to be styled as `position: sticky`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-enableSticky)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-endDate)
     */
    endDate? : Date|string
    /**
     * The name of the end date parameter that will be passed to in every `eventStore` load request.
     */
    endParamName? : string
    /**
     * Field from EventModel displayed as text in the bar when rendering
     */
    eventBarTextField? : string
    /**
     * Event color used by default. Events and resources can specify their own color, with priority order being:
     * Event -&gt; Resource -&gt; Scheduler default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-eventColor)
     */
    eventColor? : EventColor
    /**
     * Defines how to handle overlapping events. Valid values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-eventLayout)
     */
    eventLayout? : 'stack'|'pack'|'mixed'|'none'|{
        type?: 'stack'|'pack'|'mixed'|'none'
    }
    /**
     * An advanced setting that controls the maximum number of released event bars to keep in the DOM.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-eventReleaseThreshold)
     */
    eventReleaseThreshold? : number
    /**
     * An empty function by default, but provided so that you can override it. This function is called each time
     * an event is rendered into the schedule to render the contents of the event. It's called with the event,
     * its resource and a `renderData` object which allows you to populate data placeholders inside the event
     * template.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-eventRenderer)
     * @param {object} detail An object containing the information needed to render an Event.
     * @param {Scheduler.model.SchedulerEventModel} detail.eventRecord The event record.
     * @param {Scheduler.model.SchedulerResourceModel} detail.resourceRecord The resource record.
     * @param {Scheduler.model.SchedulerAssignmentModel} detail.assignmentRecord The assignment record.
     * @param {Scheduler.view.Scheduler} detail.scheduler The Scheduler instance.
     * @param {object} detail.renderData An object containing details about the event rendering.
     * @param {Scheduler.model.SchedulerEventModel} detail.renderData.event The event record.
     * @param {Core.helper.util.DomClassList,string} detail.renderData.cls An object whose property names represent the CSS class names to be added to the event bar element. Set a property's value to truthy or falsy to add or remove the class name based on the property name. Using this technique, you do not have to know whether the class is already there, or deal with concatenation.
     * @param {Core.helper.util.DomClassList,string} detail.renderData.wrapperCls An object whose property names represent the CSS class names to be added to the event wrapper element. Set a property's value to truthy or falsy to add or remove the class name based on the property name. Using this technique, you do not have to know whether the class is already there, or deal with concatenation.
     * @param {Core.helper.util.DomClassList,string} detail.renderData.iconCls An object whose property names represent the CSS class names to be added to an event icon element. Note that an element carrying this icon class is injected into the event element *after* the renderer completes, *before* the renderer's created content. To disable this if the renderer takes full control and creates content using the iconCls, you can set `renderData.iconCls = null`.
     * @param {number} detail.renderData.left Vertical offset position (in pixels) on the time axis.
     * @param {number} detail.renderData.width Width in pixels of the event element.
     * @param {number} detail.renderData.height Height in pixels of the event element.
     * @param {string,Record<string, string>} detail.renderData.style Inline styles for the event bar DOM element. Use either 'border: 1px solid black' or `{ border: '1px solid black' }`
     * @param {string,Record<string, string>} detail.renderData.wrapperStyle Inline styles for wrapper of the event bar DOM element. Use either 'border: 1px solid green' or `{ border: '1px solid green' }`
     * @param {'tonal','filled','bordered','traced','outlined','indented','line','dashed','minimal','rounded','calendar','interday','gantt',null} detail.renderData.eventStyle The `eventStyle` of the event. Use this to apply custom styles to the event DOM element
     * @param {string} detail.renderData.eventColor The `eventColor` of the event. Use this to set a custom color for the rendered event
     * @param {string} detail.renderData.ariaLabel A description of the event details used for screen readers
     * @param {DomConfig[]} detail.renderData.children An array of DOM configs used as children to the `b-sch-event` element. Can be populated with additional DOM configs to have more control over contents.
     * @returns {string,DomConfig,DomConfig[]} A simple string, or a DomConfig (or array thereof)
     */
    eventRenderer? : (detail: { eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, scheduler: Scheduler, renderData: { event: SchedulerEventModel, cls: DomClassList|string, wrapperCls: DomClassList|string, iconCls: DomClassList|string, left: number, width: number, height: number, style: string|Record<string, string>, wrapperStyle: string|Record<string, string>, eventStyle: 'tonal'|'filled'|'bordered'|'traced'|'outlined'|'indented'|'line'|'dashed'|'minimal'|'rounded'|'calendar'|'interday'|'gantt'|null, eventColor: string, ariaLabel: string, children: DomConfig[] } }) => string|DomConfig|DomConfig[]
    /**
     * `this` reference for the [eventRenderer](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer) function
     */
    eventRendererThisObj? : object
    /**
     * Inline events, will be loaded into an internally created EventStore.
     */
    events? : SchedulerEventModel[]|SchedulerEventModelConfig[]
    /**
     * Configure as `true`, or set property to `true` to disable event selection.
     */
    eventSelectionDisabled? : boolean
    /**
     * The [EventStore](https://bryntum.com/products/gantt/docs/api/Scheduler/data/EventStore) holding the events to be rendered into the scheduler (required).
     */
    eventStore? : SchedulerEventStore|SchedulerEventStoreConfig
    /**
     * Event style used by default. Events and resources can specify their own style, with priority order being:
     * Event -&gt; Resource -&gt; Scheduler default. Determines the appearance of the event by assigning a CSS class
     * to it. Available styles are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-eventStyle)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-fillTicks)
     */
    fillTicks? : boolean
    /**
     * Use fixed row height. Setting this to `true` will configure the underlying RowManager to use fixed row
     * height, which sacrifices the ability to use rows with variable height to gain a fraction better
     * performance.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-fixedRowHeight)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-footer)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-formulaProviders)
     */
    formulaProviders? : Record<string, FormulaProviderConfig>
    /**
     * Refresh entire row when a record changes (`true`) or, if possible, only the cells affected (`false`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-fullRowRefresh)
     */
    fullRowRefresh? : boolean
    /**
     * A method allowing you to define date boundaries that will constrain resize, create and drag drop
     * operations. The method will be called with the Resource record, and the Event record.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-getDateConstraints)
     * @param {Scheduler.model.SchedulerResourceModel} resourceRecord The resource record
     * @param {Scheduler.model.SchedulerEventModel} eventRecord The event record
     * @returns {DateConstraint} Constraining `Object` containing `start` and `end` constraints. Omitting either will mean that end is not constrained. So you can prevent a resize or move from moving *before* a certain time while not constraining the end date.
     */
    getDateConstraints? : (resourceRecord?: SchedulerResourceModel, eventRecord?: SchedulerEventModel) => DateConstraint
    /**
     * Scheduler overrides Grid's default implementation of [getRowHeight](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-getRowHeight) to
     * pre-calculate row heights based on events in the rows.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-getRowHeight)
     * @param {Scheduler.model.SchedulerResourceModel} getRowHeight.record Resource record to determine row height for
     * @returns {number} Desired row height
     */
    getRowHeight? : (getRowHeight: { record: SchedulerResourceModel }) => number
    /**
     * A config [object](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#typedef-PanelHeader) for the panel's header or a string in place of a `title`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-header)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-hideRowHover)
     */
    hideRowHover? : boolean
    /**
     * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
     */
    highlightPredecessors? : boolean
    /**
     * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
     */
    highlightSuccessors? : boolean
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Set to `true` to automatically adjust the panel timespan during scrolling in the time dimension,
     * when the scroller comes close to the start/end edges.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-infiniteScroll)
     */
    infiniteScroll? : boolean
    /**
     * Maximum duration (in milliseconds) for the initial animation controlled by [useInitialAnimation](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-useInitialAnimation).
     */
    initialAnimationDuration? : number
    /**
     * Convenience setting to align input fields of child widgets. By default, the Field input element is
     * placed immediately following the `label`. If you prefer to have all input fields aligned to the
     * right, set this config to `'end'`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-inputFieldAlign)
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
     * A template method (empty by default) allowing you to control if an event can be selected or not.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-isEventSelectable)
     * @param {Scheduler.model.SchedulerEventModel} event The event record
     * @returns {boolean} true if event can be selected, otherwise false
     */
    isEventSelectable? : (event: SchedulerEventModel) => boolean
    /**
     * See [Keyboard shortcuts](https://bryntum.com/products/gantt/docs/api/Scheduler/view/Scheduler#keyboard-shortcuts) for details
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * Convenience setting to use same label placement on all child widgets.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|'align-before'|'auto'|null
    /**
     * By default, when the `EventStore` (and similar stores) is lazy loading, a loading indicator will be displayed
     * just below the timeline headers. Set this to `false` to prevent this indicator being shown.
     */
    lazyLoadingIndicator? : boolean
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-listeners)
     */
    listeners? : TimelineListeners
    /**
     * *This property is for use when the Scheduler is used as a Calendar view - a `mode`.*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-listRangeMenu)
     */
    listRangeMenu? : MenuConfig
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-loadMaskDefaults)
     */
    loadMaskDefaults? : MaskConfig
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object to adjust the [maskDefaults](#Core/widget/Widget#config-maskDefaults)
     * when an error occurs loading data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-loadMaskError)
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
     * This flag controls whether Scheduler should preserve its selection of events when loading a new dataset
     * (if selected event ids are included in the newly loaded dataset).
     */
    maintainSelectionOnDatasetChange? : boolean
    /**
     * When `true`, events are sized and positioned based on rowHeight, resourceMargin and barMargin settings.
     * Set this to `false` if you want to control height and vertical position using CSS instead.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-managedEventSizing)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-maxTimeAxisUnit)
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
     * How to align milestones in relation to their startDate. Only applies when using a `milestoneLayoutMode`
     * other than `default`. Valid values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-milestoneAlign)
     */
    milestoneAlign? : 'start'|'center'|'end'
    /**
     * Factor representing the average char width in pixels used to determine milestone width when configured
     * with `milestoneLayoutMode: 'estimate'`.
     */
    milestoneCharWidth? : number
    /**
     * How to handle milestones during event layout. How the milestones are displayed when part of the layout
     * are controlled using [milestoneTextPosition](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-milestoneTextPosition).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-milestoneLayoutMode)
     */
    milestoneLayoutMode? : 'default'|'estimate'|'data'|'measure'
    /**
     * Position of the milestone text:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-milestoneTextPosition)
     */
    milestoneTextPosition? : 'inside'|'outside'|'always-outside'
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-minHeight)
     */
    minHeight? : string|number
    /**
     * *Experimental* Minimum size that events should be allowed to shrink to when using `pack` layout. If
     * packing leads to any event being smaller than this value, the row will grow in height instead to maintain
     * this minimum size.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-minPackSize)
     */
    minPackSize? : number
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
     * Scheduler mode. Supported values: horizontal, vertical
     */
    mode? : 'horizontal'|'vertical'
    /**
     * Grid monitors window resize by default.
     */
    monitorResize? : boolean
    /**
     * Configure as `true` to allow `CTRL/CMD+click` to select multiple events in the scheduler.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-multiEventSelect)
     */
    multiEventSelect? : boolean|{
        ctrlKey?: boolean
        altKey?: boolean
        shiftKey?: boolean
    }
    /**
     * When an event bar has a width less than this value, it gets the CSS class `b-sch-event-narrow`
     * added. You may apply custom CSS rules using this class.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-narrowEventWidth)
     */
    narrowEventWidth? : number
    /**
     * Override this method to provide a custom sort function to sort any overlapping events. This only applies
     * to the horizontal mode, where the order the events are sorted in determines their vertical placement
     * within a resource.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-overlappingEventSorter)
     * @param {Scheduler.model.SchedulerEventModel} a First event
     * @param {Scheduler.model.SchedulerEventModel} b Second event
     * @returns {number} Return -1 to display `a` above `b`, 1 for `b` above `a`
     */
    overlappingEventSorter? : (a: SchedulerEventModel, b: SchedulerEventModel) => number
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-owner)
     */
    owner? : Widget|any
    /**
     * Partners this Timeline panel with another Timeline in order to sync their region sizes (sub-grids like locked, normal will get the same width),
     * start and end dates, view preset, zoom level and scrolling position. All these values will be synced with the timeline defined as the `partner`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-partner)
     */
    partner? : TimelineBase
    /**
     * Set to `true` to include `startDate` and `endDate` params indicating the currently viewed date range in
     * `EventStore` load requests (when loading using `AjaxStore` or `CrudManager` functionality).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-passStartEndParameters)
     */
    passStartEndParameters? : boolean
    /**
     * Specify plugins (an array of classes) in config
     */
    plugins? : Function[]
    /**
     * Maximum number of resources for which height is pre-calculated. If you have many events per
     * resource you might want to lower this number to gain some initial rendering performance.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-preCalculateHeightLimit)
     */
    preCalculateHeightLimit? : number
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-presets)
     */
    presets? : ViewPresetConfig[]
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * Project config object or a Project instance
     */
    project? : SchedulerProProjectModel|ProjectModelConfig|RefObject<any>
    /**
     * Range used to set the length of the time axis when used as a component of a Calendar. Suitable units are
     * `'month'`, `'week'` and `'day'`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-range)
     */
    range? : string|DurationConfig
    /**
     * Configure as `true` to make the scheduler read-only, by disabling any UIs for modifying data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-readOnly)
     */
    readOnly? : boolean
    /**
     * The confirmation dialog shown when a recurring event is edited.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-recurrenceConfirmationPopup)
     */
    recurrenceConfirmationPopup? : RecurrenceConfirmationPopupConfig|RecurrenceConfirmationPopup
    relayStoreEvents? : boolean
    /**
     * Either a default `rendition` to apply to all child widgets, or a map of renditions keyed by child widget
     * `type`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-rendition)
     */
    rendition? : string|Record<string, string>|null
    /**
     * Configure this property to allow the widget/component to be resized. Pressing <kbd>Shift</kbd> while resizing will
     * constrain the aspect ratio.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resizable)
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
     * A config object used to configure the resource columns in vertical mode.
     * See [ResourceHeader](https://bryntum.com/products/gantt/docs/api/Scheduler/view/ResourceHeader) for more details on available properties.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resourceColumns)
     */
    resourceColumns? : ResourceHeaderConfig
    /**
     * Resource image extension, used when creating image path from resource name.
     */
    resourceImageExtension? : string
    /**
     * Path to load resource images from. Used by the resource header in vertical mode and the
     * [ResourceInfoColumn](https://bryntum.com/products/gantt/docs/api/Scheduler/column/ResourceInfoColumn) in horizontal mode. Set this to display miniature
     * images for each resource using their `image` or `imageUrl` fields.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resourceImagePath)
     */
    resourceImagePath? : string
    /**
     * Convenience config to set both [resourceImagePath](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerResourceRendering#config-resourceImagePath) and [resourceImageExtension](#Scheduler/view/mixin/SchedulerResourceRendering#config-resourceImageExtension).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resourceImages)
     */
    resourceImages? : {
        path?: string
        extension?: string
    }
    /**
     * Control how much space to leave between the first event/last event and the resources edge (top/bottom
     * margin within the resource row in horizontal mode, left/right margin within the resource column in
     * vertical mode), in px. Defaults to the value of [barMargin](https://bryntum.com/products/gantt/docs/api/Scheduler/view/Scheduler#config-barMargin).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resourceMargin)
     */
    resourceMargin? : number|ResourceMarginConfig
    /**
     * Inline resources, will be loaded into an internally created ResourceStore.
     */
    resources? : SchedulerResourceModel[]|SchedulerResourceModelConfig[]
    /**
     * The [ResourceStore](https://bryntum.com/products/gantt/docs/api/Scheduler/data/ResourceStore) holding the resources to be rendered into the scheduler (required).
     */
    resourceStore? : SchedulerResourceStore|SchedulerResourceStoreConfig
    /**
     * An empty function by default, but provided so that you can override it. This function is called each time
     * a resource time range is rendered into the schedule. It's called with `resourceTimeRangeRecord`, `resourceRecord`,
     * and `renderData` params.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-resourceTimeRangeRenderer)
     * @param {object} detail An object containing the information needed to render a ResourceTimeRangeModel.
     * @param {Scheduler.model.ResourceTimeRangeModel} detail.resourceTimeRangeRecord The resource time range record.
     * @param {Scheduler.model.SchedulerResourceModel} detail.resourceRecord The resource record.
     * @param {object} detail.renderData An object containing details about the event rendering.
     * @returns {string,DomConfig,DomConfig[]} A simple string, or a DomConfig object describing the markup
     */
    resourceTimeRangeRenderer? : (detail: { resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, renderData: object }) => string|DomConfig|DomConfig[]
    /**
     * Inline resource time ranges, will be loaded into an internally created store if
     * [ResourceTimeRanges](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ResourceTimeRanges) is enabled.
     */
    resourceTimeRanges? : ResourceTimeRangeModel[]|ResourceTimeRangeModelConfig[]
    /**
     * Resource time ranges store instance or config object for [ResourceTimeRanges](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ResourceTimeRanges) feature.
     */
    resourceTimeRangeStore? : ResourceTimeRangeStore|ResourceTimeRangeStoreConfig
    /**
     * "Break points" for which responsive config to use for columns and css.
     */
    responsiveLevels? : Record<string, number|string>
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-ripple)
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
     * The height in pixels of Scheduler rows.
     */
    rowHeight? : number
    /**
     * Set to `false` to not show row lines. End result might be overruled by/differ between themes.
     */
    rowLines? : boolean
    /**
     * This may be configured as `true` to make the widget's element use the `direction:rtl` style.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-rtl)
     */
    rtl? : boolean
    /**
     * Configures whether the grid is scrollable in the `Y` axis. This is used to configure a [Scroller](https://bryntum.com/products/gantt/docs/api/Core/helper/util/Scroller).
     * See the [scrollerClass](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-scrollerClass) config option.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-scrollable)
     */
    scrollable? : boolean|ScrollerConfig|Scroller
    /**
     * The class to instantiate to use as the [scrollable](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-scrollable). Defaults to [Scroller](#Core/helper/util/Scroller).
     */
    scrollerClass? : typeof Scroller
    /**
     * Specifies the maximum duration for extending the current [TimeSpan](https://bryntum.com/products/gantt/docs/api/Scheduler/model/TimeSpan) to allow for smooth
     * scrolling to an event.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-scrollExtensionThreshold)
     */
    scrollExtensionThreshold? : string|DurationConfig
    /**
     * Configuration values for the [ScrollManager](https://bryntum.com/products/gantt/docs/api/Core/util/ScrollManager) class on initialization. Returns the
     * [ScrollManager](https://bryntum.com/products/gantt/docs/api/Core/util/ScrollManager) at runtime.
     */
    scrollManager? : ScrollManagerConfig|ScrollManager
    /**
     * Selection configuration settings, change these properties to control how selection works and what can be
     * selected.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-selectionMode)
     */
    selectionMode? : GridSelectionMode
    /**
     * Set to `false` to not select the resource of the event when clicking an event bar.
     */
    selectResourceOnEventNavigate? : boolean
    /**
     * Set to `false` to not select the row/resource when clicking the empty area in a time axis cell.
     */
    selectResourceOnScheduleClick? : boolean
    /**
     * <div class="note">This property is for use when the Scheduler is used as a Calendar view - a `mode`.
     * it will have no effect on a Scheduler which is not inside a Calendar.</div>
     * The time range to move by when [next](https://bryntum.com/products/gantt/docs/api/Scheduler/view/SchedulerBase#function-next) or [previous](#Scheduler/view/SchedulerBase#function-previous) is called.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-shiftIncrement)
     */
    shiftIncrement? : string|DurationConfig
    /**
     * `false` to not show a tooltip while creating a dependency
     */
    showCreationTooltip? : boolean
    /**
     * Configure as `true` to have the grid show a red "changed" tag in cells whose
     * field value has changed and not yet been committed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-showDirty)
     */
    showDirty? : boolean|{
        duringEdit?: boolean
        newRecord?: boolean
    }
    /**
     * If set to `true` this will show a color field in the [EventEdit](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventEdit) editor and also a
     * picker in the [EventMenu](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventMenu). Both enables the user to choose a color which will be
     * applied to the event bar's background. See EventModel's
     * [eventColor](https://bryntum.com/products/gantt/docs/api/Scheduler/model/mixin/EventModelMixin#field-eventColor) config.
     * config.
     */
    showEventColorPickers? : boolean
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
     * Set to `true` to show a tooltip when hovering a dependency line
     */
    showTooltip? : boolean
    /**
     * Set to `true` to snap to the current time resolution increment while interacting with scheduled events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-snap)
     */
    snap? : boolean
    /**
     * Affects drag drop and resizing of events when [snap](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/TimelineDateMapper#config-snap)
     * is enabled.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-snapRelativeToEventStartDate)
     */
    snapRelativeToEventStartDate? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * The start date of the timeline (if not configure with [infiniteScroll](https://bryntum.com/products/gantt/docs/api/Scheduler/view/TimelineBase#config-infiniteScroll)).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-startDate)
     */
    startDate? : Date|string
    /**
     * The name of the start date parameter that will be passed to in every `eventStore` load request.
     */
    startParamName? : string
    /**
     * This value can be one of the following:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-stateful)
     */
    stateful? : boolean|object|string[]
    /**
     * The events that, when fired by this component, should trigger it to save its state by calling
     * [saveState](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#function-saveState).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-statefulEvents)
     */
    statefulEvents? : object|string[]
    /**
     * The key to use when saving this object's state in the [stateProvider](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateProvider). If this config is
     * not assigned, and [stateful](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateful) is not set to `false`, the [id](#Core/widget/Widget#config-id)
     * (if explicitly specified) will be used as the `stateId`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-stateId)
     */
    stateId? : string
    /**
     * The `StateProvider` to use to save and restore this object's [state](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#property-state). By default, `state`
     * will be saved using the [default state provider](https://bryntum.com/products/gantt/docs/api/Core/state/StateProvider#property-instance-static).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-stateProvider)
     */
    stateProvider? : StateProvider
    /**
     * The properties of this settings object controls how grid is restored from state data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-stateSettings)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-store)
     */
    store? : Store|StoreConfig|AjaxStore|AjaxStoreConfig
    /**
     * An object containing widgets keyed by name. By default (when no `type` is given), strips are
     * [toolbars](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar). If you want to pass an array, you can use
     * the toolbar's [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-strips)
     */
    strips? : Record<string, ContainerItemConfig>
    /**
     * An object containing sub grid configuration objects keyed by a `region` property.
     * By default, grid has a 'locked' region (if configured with locked columns) and a 'normal' region.
     * The 'normal' region defaults to use `flex: 1`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-subGridConfigs)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-syncMask)
     */
    syncMask? : string|MaskConfig|null
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * When this container is used as a tab in a TabPanel, these items are added to the
     * [TabBar](https://bryntum.com/products/gantt/docs/api/Core/widget/TabBar) when this container is the active tab.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-tabBarItems)
     */
    tabBarItems? : ToolbarItems[]|Widget[]
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar.
     * This creates a toolbar docked to the top of the panel immediately below the header.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-tbar)
     */
    tbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * CSS class used for terminals
     */
    terminalCls? : string
    /**
     * Delay in ms before hiding the terminals when the mouse leaves an event bar or terminal.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-terminalHideDelay)
     */
    terminalHideDelay? : number
    /**
     * Terminal offset from their initial position, in px. Positive values move terminals further away from the
     * event bar, negative values inside the event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-terminalOffset)
     */
    terminalOffset? : number
    /**
     * Delay in ms before showing the terminals when hovering over an event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-terminalShowDelay)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-terminalSize)
     */
    terminalSize? : number|string
    /**
     * The width/height (depending on vertical / horizontal mode) of all the time columns.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-tickSize)
     */
    tickSize? : number
    /**
     * A [TimeAxis](https://bryntum.com/products/gantt/docs/api/Scheduler/data/TimeAxis) config object or instance, used to create a backing data store of
     * 'ticks' providing the input date data for the time axis of timeline panel. Created automatically if none
     * supplied.
     */
    timeAxis? : TimeAxisConfig|TimeAxis
    /**
     * Inline time ranges, will be loaded into an internally created store if [TimeRanges](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges)
     * is enabled.
     */
    timeRanges? : TimeSpan[]|TimeSpanConfig[]
    /**
     * The time ranges store instance for [TimeRanges](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges) feature.
     */
    timeRangeStore? : Store|StoreConfig
    /**
     * Gets/sets the current time resolution object, which contains a unit identifier and an increment count
     * `{ unit, increment }`. This value means minimal task duration you can create using UI.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-timeResolution)
     */
    timeResolution? : {
        increment?: number
        unit?: DurationUnit
    }|number
    /**
     * A title to display in the header or owning TabPanel. Causes creation and docking of a header
     * to the top if no header is configured.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-title)
     */
    title? : string
    /**
     * The [tools](https://bryntum.com/products/gantt/docs/api/Core/widget/Tool) to add either before or after the `title` in the Panel header. Each
     * property name is the reference by which an instantiated tool may be retrieved from the live
     * `[tools](https://bryntum.com/products/gantt/docs/api/Core/widget/mixin/Toolable#property-tools)` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-tools)
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
     * Configure as `true` to trigger `selectionChange` when removing a selected event/assignment.
     */
    triggerSelectionChangeOnRemove? : boolean
    type? : 'timeline'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-ui)
     */
    ui? : 'plain'|'toolbar'|string|object
    /**
     * By default, scrolling the schedule will update the [timelineContext](https://bryntum.com/products/gantt/docs/api/Scheduler/view/SchedulerBase#property-timelineContext) to reflect the new
     * currently hovered context. When displaying a large number of events on screen at the same time, this will
     * have a slight impact on scrolling performance. In such scenarios, opt out of this behavior by setting
     * this config to `false`.
     */
    updateTimelineContextOnScroll? : boolean
    /**
     * By default, the day of week and week of month of the event's start date are used to create
     * helpful contextual recurrence types when editing a non-recurring event record and choosing
     * an initial recurrence type.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-useContextualRecurrenceRules)
     */
    useContextualRecurrenceRules? : boolean
    /**
     * By default, scheduler fade events in on load. Specify `false` to prevent this animation or specify one
     * of the available animation types to use it (`true` equals `'fade-in'`):
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-useInitialAnimation)
     */
    useInitialAnimation? : boolean|'fade-in'|'slide-from-left'|'slide-from-top'|string
    /**
     * The time axis column config for vertical [mode](https://bryntum.com/products/gantt/docs/api/Scheduler/view/SchedulerBase#config-mode).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-verticalTimeAxisColumn)
     */
    verticalTimeAxisColumn? : VerticalTimeAxisColumnConfig
    /**
     * A string key used to lookup a predefined [ViewPreset](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/ViewPreset) (e.g. 'weekAndDay', 'hourAndDay'),
     * managed by [PresetManager](https://bryntum.com/products/gantt/docs/api/Scheduler/preset/PresetManager). See [PresetManager](#Scheduler/preset/PresetManager) for more information.
     * Or a config object for a viewPreset.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-viewPreset)
     */
    viewPreset? : string|ViewPresetConfig
    /**
     * A date to bring into view initially on the scrollable timeline.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-visibleDate)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#config-workingTime)
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
     * Fires on the owning Scheduler at the end of the drag create gesture whether or not
     * a new event was created by the gesture.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The event record being created
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {HTMLElement} event.eventElement The element representing the created event record
     */
    onAfterDragCreate? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement }) => void)|string
    /**
     * Fires on the owning Scheduler after the selection is finished.
     * @param {object} event Event object
     * @param {Scheduler.view.SchedulerBase} event.source The Scheduler instance
     */
    onAfterEventDragSelect? : ((event: { source: SchedulerBase }) => void)|string
    /**
     * Fired on the owning Scheduler after event drop
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords
     * @param {boolean} event.valid
     * @param {object} event.context
     * @param {MouseEvent} event.domEvent Browser event
     */
    onAfterEventDrop? : ((event: { source: Scheduler, assignmentRecords: SchedulerAssignmentModel[], eventRecords: SchedulerEventModel[], valid: boolean, context: object, domEvent: MouseEvent }) => void)|string
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
     * Fires on the owning Scheduler after an event is successfully saved
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record about to be saved
     */
    onAfterEventSave? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel }) => void)|string
    /**
     * Fired any time there is a change to the assignments selected in the Scheduler.
     * @param {object} event Event object
     * @param {'select','deselect','update','clear'} event.action One of the actions 'select', 'deselect', 'update', 'clear'
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.selected An array of the Assignments added to the selection.
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.deselected An array of the Assignments removed from the selection.
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.selection The new selection.
     */
    onAssignmentSelectionChange? : ((event: { action: 'select'|'deselect'|'update'|'clear', selected: SchedulerAssignmentModel[], deselected: SchedulerAssignmentModel[], selection: SchedulerAssignmentModel[] }) => void)|string
    /**
     * Fires before an assignment is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or
     * by the event editor. Can for example be used to display a custom dialog to confirm deletion, in which
     * case records should be "manually" removed after confirmation:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeAssignmentDelete)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The Scheduler instance
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The assignment records about to be deleted
     * @param {object} event.context Additional removal context:
     * @param {Function} event.context.finalize Function to call to finalize the removal. Used to asynchronously decide to remove the records or not. Provide `false` to the function to prevent the removal.
     * @param {boolean} event.context.finalize.removeRecords Provide `false` to the function to prevent the removal.
     */
    onBeforeAssignmentDelete? : ((event: { source: Scheduler, assignmentRecords: SchedulerAssignmentModel[], context: { finalize: { removeRecords?: boolean } } }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired any time there is going to be a change to the assignments selected in the Scheduler.
     * Returning `false` prevents the change
     * @param {object} event Event object
     * @param {string} event.action One of the actions 'select', 'deselect', 'update', 'clear'
     * @param {Scheduler.model.SchedulerEventModel[]} event.selected An array of assignments that will be added to the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.deselected An array of assignments that will be removed from the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.selection The currently selected assignments, before applying `selected` and `deselected`.
     */
    onBeforeAssignmentSelectionChange? : ((event: { action: string, selected: SchedulerEventModel[], deselected: SchedulerEventModel[], selection: SchedulerEventModel[] }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires whenever the [autoCreate gesture](https://bryntum.com/products/gantt/docs/api/Scheduler/view/SchedulerBase#config-autoCreate) is detected.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeAutoCreate)
     * @param {object} event Event object
     * @param {Event} event.domEvent The DOM event which initiated the creation.
     * @param {Date} event.date The starting time of the event to be created.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource if the UI includes a resource.
     */
    onBeforeAutoCreate? : ((event: { domEvent: Event, date: Date, resourceRecord: SchedulerResourceModel }) => Promise<boolean>|boolean|void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeCancelRowEdit)
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
     * This event is fired on the owning Scheduler when the context [element](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleContext#property-element) or
     * [widget](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleContext#property-widget) is about to be shown.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeContextShow)
     * @param {object} event Event object
     * @param {Scheduler.feature.ScheduleContext} event.source The ScheduleContext feature instance
     * @param {Scheduler.util.TimelineContext} event.context The context object containing information about the clicked cell
     * @param {HTMLElement} event.element The context highlight element
     * @param {object} event.position The position and size of the context element. May be mutated by a handler.
     * @param {number} event.position.width The width of the context element
     * @param {number} event.position.height The height of the context element
     * @param {number} event.position.x The x coordinate of the context element
     * @param {number} event.position.y The y coordinate of the context element
     */
    onBeforeContextShow? : ((event: { source: ScheduleContext, context: TimelineContext, element: HTMLElement, position: { width: number, height: number, x: number, y: number } }) => Promise<boolean>|boolean|void)|string
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
     * Fires on the owning Scheduler at the beginning of the drag gesture. Returning `false` from a listener prevents
     * the drag create operation from starting.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeDragCreate)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord
     * @param {Date} event.date The datetime associated with the drag start point.
     */
    onBeforeDragCreate? : ((event: { source: Scheduler, resourceRecord: SchedulerResourceModel, date: Date }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler to allow implementer to prevent immediate finalization by setting
     * `data.context.async = true` in the listener, to show a confirmation popup etc.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeDragCreateFinalize)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The event record being created
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {HTMLElement} event.eventElement The element representing the new Event record
     * @param {object} event.context
     * @param {Date} event.context.startDate The start date of the event being created
     * @param {Date} event.context.endDate The end date of the event being created
     * @param {boolean} event.context.async Set true to handle drag create asynchronously (e.g. to wait for user confirmation)
     * @param {Function} event.context.finalize Call this method to finalize drag create. This method accepts one argument: pass true to update records, or false, to ignore changes
     */
    onBeforeDragCreateFinalize? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement, context: { startDate: Date, endDate: Date, async: boolean, finalize: Function } }) => void)|string
    /**
     * Fires before an event is added. Can be triggered by schedule double click or drag create action.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record about to be added
     * @param {Scheduler.model.SchedulerResourceModel[]} event.resourceRecords Resources that the record is assigned to
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The assignment records
     */
    onBeforeEventAdd? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecords: SchedulerResourceModel[], assignmentRecords: SchedulerAssignmentModel[] }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before an event is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or by the
     * event editor. Return `false` to immediately veto the removal (or a `Promise` yielding `true` or `false`
     * for async vetoing).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeEventDelete)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler,any} event.source The Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords The records about to be deleted
     * @param {object} event.context Additional removal context:
     * @param {Function} event.context.finalize Function to call to finalize the removal. Used to asynchronously decide to remove the records or not. Provide `false` to the function to prevent the removal.
     * @param {boolean} event.context.finalize.removeRecords Provide `false` to the function to prevent the removal.
     */
    onBeforeEventDelete? : ((event: { source: Scheduler|any, eventRecords: SchedulerEventModel[], context: { finalize: { removeRecords?: boolean } } }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired on the owning Scheduler before event dragging starts. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record the drag starts from
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the drag starts from
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords Event records being dragged
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords Assignment records being dragged
     * @param {MouseEvent} event.domEvent Browser event
     */
    onBeforeEventDrag? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], domEvent: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires on the owning Scheduler before drag selection starts. Return false to prevent the operation.
     * @param {object} event Event object
     * @param {Scheduler.view.SchedulerBase} event.source The Scheduler instance
     * @param {Event} event.event The native browser DOM event
     */
    onBeforeEventDragSelect? : ((event: { source: SchedulerBase, event: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired on the owning Scheduler after the event drag operation completes, but before changing any data.
     * It allows implementer to use asynchronous validation/finalization by setting `context.async = true`
     * in the listener, for example, to show a confirmation popup, make async data request etc.
     * In such case, implementer need to call the `context.finalize()` method manually:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeEventDropFinalize)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {object} event.context
     * @param {DropData} event.context.dropData Information about the drop points for dragged events/assignments.
     * @param {boolean} event.context.async Set to `true` to not finalize the drag-drop operation immediately (e.g. to wait for user confirmation)
     * @param {Scheduler.model.SchedulerEventModel[]} event.context.eventRecords Event records being dragged
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.context.assignmentRecords Assignment records being dragged
     * @param {Scheduler.model.SchedulerEventModel} event.context.targetEventRecord The event record (if any) where the drop happened
     * @param {Scheduler.model.SchedulerResourceModel} event.context.newResource Resource record for drop target
     * @param {boolean} event.context.valid Set this to `false` to abort the drop immediately.
     * @param {Function} event.context.finalize Call this method after an <strong>async</strong> finalization flow, to finalize the drag-drop operation. This method accepts one argument: pass `true` to update records, or `false` to ignore changes
     * @param {MouseEvent} event.domEvent Browser event
     */
    onBeforeEventDropFinalize? : ((event: { source: Scheduler, context: { dropData: DropData, async: boolean, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], targetEventRecord: SchedulerEventModel, newResource: SchedulerResourceModel, valid: boolean, finalize: Function }, domEvent: MouseEvent }) => void)|string
    /**
     * Fires on the owning Scheduler before an event is displayed in an editor.
     * This may be listened for to allow an application to take over event editing duties. Returning `false`
     * stops the default editing UI from being shown.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeEventEdit)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeEventResizeFinalize)
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
     * Fires on the owning Scheduler before an event is saved.
     * Return `false` to immediately prevent saving
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeEventSave)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler instance
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The record about to be saved
     * @param {Scheduler.model.SchedulerResourceModel[]} event.resourceRecords The resources to which the event is assigned
     * @param {object} event.values The new values
     * @param {object} event.context Extended save context:
     * @param {boolean} event.context.async Set this to `true` in a listener to indicate that the listener will asynchronously decide to prevent or not the event save.
     * @param {Function} event.context.finalize Function to call to finalize the save. Used when `async` is `true`. Provide `false` to the function to prevent the save.
     */
    onBeforeEventSave? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecords: SchedulerResourceModel[], values: object, context: { async?: boolean, finalize: Function } }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired any time there is going to be a change to the events selected in the Scheduler.
     * Returning `false` prevents the change
     * @param {object} event Event object
     * @param {string} event.action One of the actions 'select', 'deselect', 'update', 'clear'
     * @param {Scheduler.model.SchedulerEventModel[]} event.selected An array of events that will be added to the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.deselected An array of events that will be removed from the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.selection The currently selected events, before applying `selected` and `deselected`.
     */
    onBeforeEventSelectionChange? : ((event: { action: string, selected: SchedulerEventModel[], deselected: SchedulerEventModel[], selection: SchedulerEventModel[] }) => Promise<boolean>|boolean|void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeFinishRowEdit)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeRowCollapse)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onBeforeRowCollapse? : ((event: { record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires before row expand is started.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeRowExpand)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onBeforeRowExpand? : ((event: { record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * This event is fired on the owning Scheduler before the selected contexts are rendered.
     * The event is triggered only when [multiSelect](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleContext#config-multiSelect) is enabled
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-beforeSelectedContextsShow)
     * @param {object} event Event object
     * @param {Scheduler.feature.ScheduleContext} event.source The ScheduleContext feature instance
     * @param {Scheduler.util.TimelineContext[]} event.selectedContexts The context objects containing information about the selected cells
     * @param {DomConfig} event.domConfig A [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) config object which is used to render the selected cell elements.
     */
    onBeforeSelectedContextsShow? : ((event: { source: ScheduleContext, selectedContexts: TimelineContext[], domConfig: DomConfig }) => Promise<boolean>|boolean|void)|string
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
     * @param {SchedulerStateInfo} event.state State object config
     */
    onBeforeStateApply? : ((event: { state: SchedulerStateInfo }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before state is saved by the StateProvider. Allows editing the state object or preventing the operation.
     * @param {object} event Event object
     * @param {SchedulerStateInfo} event.state State object config
     */
    onBeforeStateSave? : ((event: { state: SchedulerStateInfo }) => Promise<boolean>|boolean|void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-catchAll)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-cellMenuBeforeShow)
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
     * Fires on the owning Scheduler/Gantt when the line indicating the current time is updated (see [currentTimeLineUpdateInterval](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges#config-currentTimeLineUpdateInterval)).
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Date} event.date The current date
     */
    onCurrentTimelineUpdate? : ((event: { source: Scheduler, date: Date }) => void)|string
    /**
     * Fired when data in the store changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-dataChange)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-dateRangeChange)
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
     * This event fires on the owning Scheduler before the context menu is shown for a dependency.
     * Allows manipulation of the items to show in the same way as in `processItems`. Returning `false` from a listener
     * prevents the menu from being shown.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord Dependency record for which the menu was triggered
     * @param {HTMLElement} event.element
     * @param {MouseEvent} event.event Pointer event which triggered the context menu (if any)
     */
    onDependencyMenuBeforeShow? : ((event: { source: Scheduler, items: Record<string, MenuItemConfig>, dependencyRecord: SchedulerDependencyModel, element: HTMLElement, event?: MouseEvent }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Scheduler when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord Dependency record for which the menu was triggered
     * @param {Core.widget.MenuItem} event.item The menu item
     * @param {HTMLElement} event.element The dependency element
     */
    onDependencyMenuItem? : ((event: { source: Scheduler, dependencyRecord: SchedulerDependencyModel, item: MenuItem, element: HTMLElement }) => void)|string
    /**
     * This event fires on the owning Scheduler after showing the context menu for an event
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Scheduler.model.SchedulerDependencyModel} event.dependencyRecord Dependency record for which the menu was triggered
     * @param {HTMLElement} event.element The dependency element
     */
    onDependencyMenuShow? : ((event: { source: Scheduler, menu: Menu, dependencyRecord: SchedulerDependencyModel, element: HTMLElement }) => void)|string
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
     * Fires on the owning Scheduler after the new event has been created.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The new `EventModel` record.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource for the row in which the event is being created.
     * @param {MouseEvent} event.event The ending mouseup event.
     * @param {HTMLElement} event.eventElement The DOM element representing the newly created event un the UI.
     */
    onDragCreateEnd? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, event: MouseEvent, eventElement: HTMLElement }) => void)|string
    /**
     * Fires on the owning Scheduler after the drag start has created a new Event record.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The event record being created
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {HTMLElement} event.eventElement The element representing the new event.
     */
    onDragCreateStart? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, eventElement: HTMLElement }) => void)|string
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
     * Fired when a double click or drag gesture has created a new event and added it to the event store.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler.
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The new event record.
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource assigned to the new event.
     */
    onEventAutoCreated? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel }) => void)|string
    /**
     * Triggered for click on an event.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventClick? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for right-click on an event.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventContextMenu? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for double-click on an event.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventDblClick? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler when event is dragged
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords Event records being dragged
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords Assignment records being dragged
     * @param {Date} event.startDate Start date for the current location
     * @param {Date} event.endDate End date for the current location
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the drag started from
     * @param {Scheduler.model.SchedulerResourceModel} event.newResource Resource at the current location
     * @param {object} event.context
     * @param {boolean} event.context.valid Set this to `false` to signal that the current drop position is invalid.
     * @param {MouseEvent} event.domEvent Browser event
     */
    onEventDrag? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, newResource: SchedulerResourceModel, context: { valid: boolean }, domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler after an event drag operation has been aborted
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords Event records being dragged
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords Assignment records being dragged
     * @param {MouseEvent} event.domEvent Browser event
     */
    onEventDragAbort? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], domEvent: MouseEvent }) => void)|string
    /**
     * Triggered when drag mode is changed, for example when copy key is
     * pressed or released while dragging.
     * @param {object} event Event object
     * @param {string} event.mode Drag mode, could be either 'move', 'copy', or 'auto'
     */
    onEventDragModeChange? : ((event: { mode: string }) => void)|string
    /**
     * Fired on the owning Scheduler after an event drag operation regardless of the operation being cancelled or not
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     */
    onEventDragReset? : ((event: { source: Scheduler }) => void)|string
    /**
     * Fires on the owning Scheduler when the selection area is updated.
     * @param {object} event Event object
     * @param {Scheduler.view.SchedulerBase} event.source The Scheduler instance
     * @param {Date} event.startDate The start date of the selection area
     * @param {Date} event.endDate The end date of the selection area
     * @param {Core.helper.util.Rectangle} event.rectangle The rectangle of the selection area
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.selectedAssignments The selected assignments
     * @param {Scheduler.model.SchedulerEventModel[]} event.selectedEvents The selected events
     */
    onEventDragSelect? : ((event: { source: SchedulerBase, startDate: Date, endDate: Date, rectangle: Rectangle, selectedAssignments: SchedulerAssignmentModel[], selectedEvents: SchedulerEventModel[] }) => void)|string
    /**
     * Fired on the owning Scheduler when event dragging starts
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Scheduler instance
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record the drag starts from
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords Event records being dragged
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords Assignment records being dragged
     * @param {MouseEvent} event.domEvent Browser event
     */
    onEventDragStart? : ((event: { source: Scheduler, resourceRecord: SchedulerResourceModel, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], domEvent: MouseEvent }) => void)|string
    /**
     * Fired on the owning Scheduler when an event is dropped
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords
     * @param {HTMLElement} event.externalDropTarget The HTML element dropped upon, if drop happened on a valid external drop target
     * @param {boolean} event.isCopy
     * @param {object} event.context
     * @param {Scheduler.model.SchedulerEventModel} event.context.targetEventRecord Event record for drop target
     * @param {Scheduler.model.SchedulerResourceModel} event.context.newResource Resource record for drop target
     * @param {MouseEvent} event.domEvent Browser event
     */
    onEventDrop? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], externalDropTarget: HTMLElement, isCopy: boolean, context: { targetEventRecord: SchedulerEventModel, newResource: SchedulerResourceModel }, domEvent: MouseEvent }) => void)|string
    /**
     * Fired before the editor will load the event record data into its input fields. This is useful if you
     * want to modify the fields before data is loaded (e.g. set some input field to be readonly)
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The editor widget
     * @param {Scheduler.model.SchedulerEventModel} event.record The record
     */
    onEventEditBeforeSetRecord? : ((event: { source: Container, record: SchedulerEventModel }) => void)|string
    /**
     * Triggered when a keydown event is observed if there are selected events.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords The selected event records
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The selected assignment records
     * @param {KeyboardEvent} event.event Browser event
     */
    onEventKeyDown? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], event: KeyboardEvent }) => void)|string
    /**
     * Triggered when a keyup event is observed if there are selected events.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords The selected event records
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The selected assignment records
     * @param {KeyboardEvent} event.event Browser event
     */
    onEventKeyUp? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], event: KeyboardEvent }) => void)|string
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
     * Triggered for mouse down on an event.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseDown? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when the mouse enters an event bar.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseEnter? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when the mouse leaves an event bar.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseLeave? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for mouse out events within and when moving out of an event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-eventMouseOut)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseOut? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for mouse over events when moving into and within an event bar.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-eventMouseOver)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseOver? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered for mouse up on an event.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord Event record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord Assignment record
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onEventMouseUp? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, assignmentRecord: SchedulerAssignmentModel, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
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
     * Fired any time there is a change to the events selected in the Scheduler.
     * @param {object} event Event object
     * @param {'select','deselect','update','clear'} event.action One of the actions 'select', 'deselect', 'update', 'clear'
     * @param {Scheduler.model.SchedulerEventModel[]} event.selected An array of the Events added to the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.deselected An array of the Event removed from the selection.
     * @param {Scheduler.model.SchedulerEventModel[]} event.selection The new selection.
     */
    onEventSelectionChange? : ((event: { action: 'select'|'deselect'|'update'|'clear', selected: SchedulerEventModel[], deselected: SchedulerEventModel[], selection: SchedulerEventModel[] }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-finishRowEdit)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-headerClick)
     * @param {object} event Event object
     * @param {Event} event.domEvent The triggering DOM event.
     * @param {Grid.column.Column} event.column The column clicked on.
     */
    onHeaderClick? : ((event: { domEvent: Event, column: Column }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Grid before the context menu is shown for a header.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Grid/feature/HeaderMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-headerMenuBeforeShow)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-paint)
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
     * Fires on the owning Scheduler if a paste action is not allowed. Depending on if the EventStore is using
     * [singleAssignment](https://bryntum.com/products/gantt/docs/api/Scheduler/data/EventStore#config-singleAssignment) or the configuration of
     * [copyPasteAction](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventCopyPaste#config-copyPasteAction), either the `eventRecords` or the `assignmentRecords` param will be populated
     * with record copies.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source Owner scheduler
     * @param {Scheduler.model.SchedulerEventModel[]} event.eventRecords The event records about to be pasted
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.assignmentRecords The assignment records about to be pasted
     * @param {Scheduler.model.SchedulerEventModel[]} event.originalEventRecords The event records that were copied
     * @param {Scheduler.model.SchedulerAssignmentModel[]} event.originalAssignmentRecords The assignment records that were copied
     * @param {Date} event.date The paste date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The target resource record
     * @param {boolean} event.isCut `true` if this is a cut action
     * @param {string} event.entityName 'event' to distinguish this event from other `pasteNotAllowed` events
     * @param {'overlappingEvents','resourceReadOnly'} event.reason A string id to use for displaying an error message to the user.
     */
    onPasteNotAllowed? : ((event: { source: Scheduler, eventRecords: SchedulerEventModel[], assignmentRecords: SchedulerAssignmentModel[], originalEventRecords: SchedulerEventModel[], originalAssignmentRecords: SchedulerAssignmentModel[], date: Date, resourceRecord: SchedulerResourceModel, isCut: boolean, entityName: string, reason: 'overlappingEvents'|'resourceReadOnly' }) => void)|string
    /**
     * Fires on the owning Grid when export has finished
     * @param {object} event Event object
     * @param {Response} event.response Optional response, if received
     * @param {Error} event.error Optional error, if exception occurred
     */
    onPdfExport? : ((event: { response?: any, error?: Error }) => void)|string
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
     * Fired after releasing an event, useful to cleanup of custom content added on `renderEvent` or in `eventRenderer`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The event record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord The assignment record
     * @param {object} event.renderData An object containing details about the event rendering
     * @param {HTMLElement} event.element The event bar element
     */
    onReleaseEvent? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, renderData: object, element: HTMLElement }) => void)|string
    /**
     * Fired after rendering an event, when its element is available in DOM.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerEventModel} event.eventRecord The event record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {Scheduler.model.SchedulerAssignmentModel} event.assignmentRecord The assignment record
     * @param {object} event.renderData An object containing details about the event rendering, see [eventRenderer](https://bryntum.com/products/gantt/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer) for details
     * @param {boolean} event.isRepaint `true` if this render is a repaint of the event, updating its existing element
     * @param {boolean} event.isReusingElement `true` if this render lead to the event reusing a released events element
     * @param {HTMLElement} event.element The event bar element
     */
    onRenderEvent? : ((event: { source: Scheduler, eventRecord: SchedulerEventModel, resourceRecord: SchedulerResourceModel, assignmentRecord: SchedulerAssignmentModel, renderData: object, isRepaint: boolean, isReusingElement: boolean, element: HTMLElement }) => void)|string
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
     * Fired when clicking a resource header cell
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {Event} event.event The event
     */
    onResourceHeaderClick? : ((event: { source: Scheduler, resourceRecord: SchedulerResourceModel, event: Event }) => void)|string
    /**
     * Fired when activating context menu on a resource header cell
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {Event} event.event The event
     */
    onResourceHeaderContextmenu? : ((event: { source: Scheduler, resourceRecord: SchedulerResourceModel, event: Event }) => void)|string
    /**
     * Fired when double clicking a resource header cell
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     * @param {Event} event.event The event
     */
    onResourceHeaderDblclick? : ((event: { source: Scheduler, resourceRecord: SchedulerResourceModel, event: Event }) => void)|string
    /**
     * This event fires on the owning scheduler before the context menu is shown for a resource.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ResourceMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-resourceMenuBeforeShow)
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Grid.column.Column} event.column Column
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Record
     */
    onResourceMenuBeforeShow? : ((event: { source: Scheduler, menu: Menu, items: Record<string, MenuItemConfig>, column: Column, resourceRecord: SchedulerResourceModel }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning scheduler when an item is selected in the context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Scheduler.model.SchedulerResourceModel} event.record Record
     */
    onResourceMenuItem? : ((event: { source: Scheduler, menu: Menu, item: MenuItem, record: SchedulerResourceModel }) => void)|string
    /**
     * This event fires on the owning scheduler after the context menu is shown for a resource.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Record<string, MenuItemConfig>} event.items Menu item configs
     * @param {Scheduler.model.SchedulerResourceModel} event.record Record
     */
    onResourceMenuShow? : ((event: { source: Scheduler, menu: Menu, items: Record<string, MenuItemConfig>, record: SchedulerResourceModel }) => void)|string
    /**
     * This event fires on the owning grid when a check item is toggled in the context menu.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The grid
     * @param {Core.widget.Menu} event.menu The menu
     * @param {Core.widget.MenuItem} event.item Selected menu item
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Record
     * @param {boolean} event.checked Checked or not
     */
    onResourceMenuToggleItem? : ((event: { source: Scheduler, menu: Menu, item: MenuItem, resourceRecord: SchedulerResourceModel, checked: boolean }) => void)|string
    /**
     * Triggered for click on a resource time range. Only triggered if the ResourceTimeRange feature is configured with
     * `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeClick? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for right-click on a resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeContextMenu? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for double-click on a resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeDblClick? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse down ona resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeMouseDown? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse out of a resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeMouseOut? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse over on a resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeMouseOver? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse up ona resource time range. Only triggered if the ResourceTimeRange feature is configured
     * with `enableMouseEvents: true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.ResourceTimeRanges} event.feature The ResourceTimeRange feature
     * @param {Scheduler.model.ResourceTimeRangeModel} event.resourceTimeRangeRecord Resource time range record
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onResourceTimeRangeMouseUp? : ((event: { source: Scheduler, feature: ResourceTimeRanges, resourceTimeRangeRecord: ResourceTimeRangeModel, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-rowExpand)
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
     * Triggered when user clicks an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleClick? : ((event: { source: Scheduler, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when user right-clicks an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleContextMenu? : ((event: { source: Scheduler, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when user double-clicks an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Index of double-clicked resource
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleDblClick? : ((event: { source: Scheduler, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
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
     * Triggered when user mousedowns over an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleMouseDown? : ((event: { source: Scheduler, date: Date, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when mouse enters an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleMouseEnter? : ((event: { source: Scheduler, date: Date, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when mouse leaves an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleMouseLeave? : ((event: { source: Scheduler, event: MouseEvent }) => void)|string
    /**
     * Triggered when user moves mouse over an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Scheduler.model.TimeSpan} event.tick A record which encapsulates the time axis tick clicked on.
     * @param {number} event.tickIndex The index of the time axis tick clicked on.
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleMouseMove? : ((event: { source: Scheduler, date: Date, tick: TimeSpan, tickIndex: number, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
    /**
     * Triggered when user mouseups over an empty area in the schedule.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Date} event.date Date at mouse position
     * @param {Date} event.tickStartDate The start date of the current time axis tick
     * @param {Date} event.tickEndDate The end date of the current time axis tick
     * @param {Grid.row.Row} event.row Row under the mouse (in horizontal mode only)
     * @param {number} event.index Resource index
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.event Browser event
     */
    onScheduleMouseUp? : ((event: { source: Scheduler, date: Date, tickStartDate: Date, tickEndDate: Date, row: Row, index: number, resourceRecord: SchedulerResourceModel, event: MouseEvent }) => void)|string
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
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord The resource record
     */
    onScrollButtonClick? : ((event: { domEvent: Event, resourceRecord: SchedulerResourceModel }) => Promise<boolean>|boolean|void)|string
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
     * Fired when the [shiftIncrement](https://bryntum.com/products/gantt/docs/api/Scheduler/view/SchedulerBase#property-shiftIncrement) of this view changes.
     * *This event is only fired when used as a mode of a Calendar*
     * @param {object} event Event object
     * @param {Scheduler.view.TimelineBase} event.source This Scheduler/Gantt instance.
     * @param {object} event.old The shift increment *if any*.
     * @param {object} event.new The shift increment
     */
    onShiftIncrementChange? : ((event: { source: TimelineBase, old?: object, new: object }) => void)|string
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
     * Triggered for click on a tick cell. Only triggered if the TreeSummary feature is configured with
     * `[enableMouseEvents](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary#config-enableMouseEvents): true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.TreeSummary} event.feature The TreeSummary feature
     * @param {Date} event.startDate Tick start date
     * @param {Date} event.endDate Tick end date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTickCellClick? : ((event: { source: Scheduler, feature: TreeSummary, startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for right-click on a tick cell. Only triggered if the TreeSummary feature is configured
     * with `[enableMouseEvents](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary#config-enableMouseEvents): true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.TreeSummary} event.feature The TreeSummary feature
     * @param {Date} event.startDate Tick start date
     * @param {Date} event.endDate Tick end date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTickCellContextMenu? : ((event: { source: Scheduler, feature: TreeSummary, startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for double-click on a tick cell. Only triggered if the TreeSummary feature is configured
     * with `[enableMouseEvents](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary#config-enableMouseEvents): true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.TreeSummary} event.feature The TreeSummary feature
     * @param {Date} event.startDate Tick start date
     * @param {Date} event.endDate Tick end date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTickCellDblClick? : ((event: { source: Scheduler, feature: TreeSummary, startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse down on a tick cell. Only triggered if the TreeSummary feature is configured
     * with `[enableMouseEvents](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary#config-enableMouseEvents): true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.TreeSummary} event.feature The TreeSummary feature
     * @param {Date} event.startDate Tick start date
     * @param {Date} event.endDate Tick end date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTickCellMouseDown? : ((event: { source: Scheduler, feature: TreeSummary, startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Triggered for mouse up on a tick cell. Only triggered if the TreeSummary feature is configured
     * with `[enableMouseEvents](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary#config-enableMouseEvents): true`.
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source This Scheduler
     * @param {Scheduler.feature.TreeSummary} event.feature The TreeSummary feature
     * @param {Date} event.startDate Tick start date
     * @param {Date} event.endDate Tick end date
     * @param {Scheduler.model.SchedulerResourceModel} event.resourceRecord Resource record
     * @param {MouseEvent} event.domEvent Browser event
     */
    onTickCellMouseUp? : ((event: { source: Scheduler, feature: TreeSummary, startDate: Date, endDate: Date, resourceRecord: SchedulerResourceModel, domEvent: MouseEvent }) => void)|string
    /**
     * Fired when the tick size changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-tickSizeChange)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-timeAxisHeaderMenuBeforeShow)
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
     * Triggered when time selection changes
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Date} event.startDate The selected range start date, or `undefined`
     * @param {Date} event.endDate The selected range end date, or `undefined`
     */
    onTimeSelectionChange? : ((event: { source: Scheduler, startDate: Date, endDate: Date }) => void)|string
    /**
     * Triggered when clicking the time selection header element
     * @param {object} event Event object
     * @param {Scheduler.view.Scheduler} event.source The scheduler
     * @param {Date} event.startDate The selected range start date
     * @param {Date} event.endDate The selected range end date
     * @param {Event} event.domEvent The raw DOM event
     */
    onTimeSelectionElementClick? : ((event: { source: Scheduler, startDate: Date, endDate: Date, domEvent: Event }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/Timeline#event-visibleDateRangeChange)
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
     * Allows using `[Ctrl/CMD + C]`, `[Ctrl/CMD + X]` and `[Ctrl/CMD + V]` to cut, copy and paste cell or cell ranges. Also
     * makes cut, copy and paste actions available via the cell context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellCopyPaste)
     */
    cellCopyPasteFeature? : object|boolean|string|CellCopyPaste|CellCopyPasteConfig
    /**
     * Adding this feature to the grid and other Bryntum products which are based on the Grid (i.e. Scheduler, SchedulerPro, and Gantt)
     * enables cell editing. Any subclass of [Field](https://bryntum.com/products/gantt/docs/api/Core/widget/Field) can be used
     * as editor for the [Column](https://bryntum.com/products/gantt/docs/api/Grid/column/Column). The most popular are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/CellEdit)
     */
    cellEditFeature? : object|boolean|string|GridCellEdit|GridCellEditConfig
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
     * Feature that draws dependencies between events. Uses a [DependencyStore](https://bryntum.com/products/gantt/docs/api/Scheduler/data/DependencyStore) to determine which
     * dependencies to draw, if none is defined one will be created automatically. Dependencies can also be specified as
     * `scheduler.dependencies`, see example below:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Dependencies)
     */
    dependenciesFeature? : object|boolean|string|SchedulerDependencies|SchedulerDependenciesConfig
    /**
     * Feature that displays a popup containing fields for editing a dependency. Requires the
     * [Dependencies](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Dependencies) feature to be enabled. Double-click a dependency line in the demo below to
     * show the editor.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/DependencyEdit)
     */
    dependencyEditFeature? : object|boolean|string|SchedulerDependencyEdit|SchedulerDependencyEditConfig
    /**
     * Displays a context menu when right-clicking dependency lines. Items are populated by other features and/or
     * application code.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/DependencyMenu)
     */
    dependencyMenuFeature? : object|boolean|string|DependencyMenu|DependencyMenuConfig
    /**
     * Allow using <kbd>Ctrl</kbd>/<kbd>CMD</kbd> + <kbd>C</kbd>/<kbd>X</kbd> and <kbd>Ctrl</kbd>/<kbd>CMD</kbd> +
     * <kbd>V</kbd> to copy/cut and paste events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventCopyPaste)
     */
    eventCopyPasteFeature? : object|boolean|string|EventCopyPaste|EventCopyPasteConfig
    /**
     * Allows user to drag and drop events within the scheduler, to change `startDate` or resource assignment.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventDrag)
     */
    eventDragFeature? : object|boolean|string|EventDrag|EventDragConfig
    /**
     * Feature that allows the user to create new events by dragging in empty parts of the scheduler rows.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventDragCreate)
     */
    eventDragCreateFeature? : object|boolean|string|EventDragCreate|EventDragCreateConfig
    /**
     * Enables users to click and drag to select events (or assignments in multi assignment mode) inside the Scheduler's
     * timeline. Press <kbd>CTRL</kbd>/<kbd>CMD</kbd> to extend an existing selection.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventDragSelect)
     */
    eventDragSelectFeature? : object|boolean|string|EventDragSelect|EventDragSelectConfig
    /**
     * Feature that displays a popup containing widgets for editing event data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventEdit)
     */
    eventEditFeature? : object|boolean|string|EventEdit|EventEditConfig
    /**
     * Adds event filter menu items to the timeline header context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventFilter)
     */
    eventFilterFeature? : object|boolean|string|EventFilter|EventFilterConfig
    /**
     * Displays a context menu for events. Items are populated by other features and/or application code.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventMenu)
     */
    eventMenuFeature? : object|boolean|string|EventMenu|EventMenuConfig
    /**
     * Feature that allows rendering non-working time ranges into event bars (weekends for Scheduler, effective calendar for
     * SchedulerPro):
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventNonWorkingTime)
     */
    eventNonWorkingTimeFeature? : object|boolean|string|EventNonWorkingTime|EventNonWorkingTimeConfig
    /**
     * Feature that allows resizing an event by dragging its end.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventResize)
     */
    eventResizeFeature? : object|boolean|string|SchedulerEventResize|SchedulerEventResizeConfig
    /**
     * Displays a tooltip when hovering events. The template used to render the tooltip can be customized, see [template](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventTooltip#config-template).
     * Config options are also applied to the tooltip shown, see [Tooltip](https://bryntum.com/products/gantt/docs/api/Core/widget/Tooltip) for available options.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/EventTooltip)
     */
    eventTooltipFeature? : object|boolean|string|EventTooltip|EventTooltipConfig
    /**
     * A feature that allows exporting Scheduler data to Excel or CSV without involving the server. It uses
     * [TableExporter](https://bryntum.com/products/gantt/docs/api/Grid/util/TableExporter) class as data provider, 3rd party provider to generate XLS files, and
     * [Microsoft XML specification](https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.aspx).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/experimental/ExcelExporter)
     */
    excelExporterFeature? : object|boolean|string|ExcelExporter|ExcelExporterConfig
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
     * A special version of the Grid GroupSummary feature that enables summaries within scheduler. To use a single summary
     * it is easiest to configure [renderer](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/GroupSummary#config-renderer), for multiple summaries see [summaries](#Scheduler/feature/GroupSummary#config-summaries).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/GroupSummary)
     */
    groupSummaryFeature? : object|boolean|string|GroupSummary|GroupSummaryConfig
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
     * Displays labels at positions [top](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Labels#config-top), [right](#Scheduler/feature/Labels#config-right), [bottom](#Scheduler/feature/Labels#config-bottom) and
     * [left](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Labels#config-left).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Labels)
     */
    labelsFeature? : object|boolean|string|SchedulerLabels|SchedulerLabelsConfig
    /**
     * This feature allows resources which satisfy a certain condition to be locked at the top of the scheduler.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/LockRows)
     */
    lockRowsFeature? : object|boolean|string|LockRows|LockRowsConfig
    /**
     * This feature merges cells that have the same value in sorted (or [optionally](https://bryntum.com/products/gantt/docs/api/Grid/feature/MergeCells#config-sortedOnly) any) columns
     * configured to [mergeCells](https://bryntum.com/products/gantt/docs/api/Grid/column/Column#config-mergeCells).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/MergeCells)
     */
    mergeCellsFeature? : object|boolean|string|MergeCells|MergeCellsConfig
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
     * Generates PDF/PNG files from the Scheduler component.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/export/PdfExport)
     */
    pdfExportFeature? : object|boolean|string|SchedulerPdfExport|SchedulerPdfExportConfig
    /**
     * Allows pinning columns to the start or end region of the grid without any additional subGrid configurations.
     * When pinning to a region that does not yet exist, the feature creates the required subGrid on the fly.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/PinColumns)
     */
    pinColumnsFeature? : object|boolean|string|PinColumns|PinColumnsConfig
    /**
     * Allows printing Scheduler contents using browser print dialog.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/export/Print)
     */
    printFeature? : object|boolean|string|SchedulerPrint|SchedulerPrintConfig
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
     * Applicable only for Scheduler in `vertical` mode. Right click resource header cells to display a context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ResourceMenu)
     */
    resourceMenuFeature? : object|boolean|string|ResourceMenu|ResourceMenuConfig
    /**
     * Feature that draws resource time ranges, shaded areas displayed behind events. These zones are similar to events in
     * that they have a start and end date but different in that they do not take part in the event layout, and they always
     * occupy full row height.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ResourceTimeRanges)
     */
    resourceTimeRangesFeature? : object|boolean|string|ResourceTimeRanges|ResourceTimeRangesConfig
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
     * field of the record is updated (when [applyToAllRows](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/RowResize#config-applyToAllRows) is `false`) and the [eventLayout](#Scheduler/model/ResourceModel#field-eventLayout) of the dragged resource
     * row will be switched to `pack` as a result (only applies when `stack` is used by default).
     * `barMargin` and `resourceMargin` will also be shrunk as you reduce the height of a row.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/RowResize)
     */
    rowResizeFeature? : object|boolean|string|RowResize|RowResizeConfig
    /**
     * Allow visually selecting a schedule "cell" by clicking, or [any other pointer gesture](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleContext#config-triggerEvent).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScheduleContext)
     */
    scheduleContextFeature? : object|boolean|string|ScheduleContext|ScheduleContextConfig
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
     * This feature injects buttons to the beginning and end of each row that will scroll to the next or previous event
     * outside the current view. It can optionally show a label along with the button, using the
     * [labelRenderer](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScrollButtons#config-labelRenderer). Only supported in horizontal [mode](#Scheduler/view/SchedulerBase#config-mode)
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/ScrollButtons)
     */
    scrollButtonsFeature? : object|boolean|string|SchedulerScrollButtons|SchedulerScrollButtonsConfig
    /**
     * <div class="external-example vertical" data-file="Grid/feature/Search.js"></div>
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Search)
     */
    searchFeature? : object|boolean|string|Search|SearchConfig
    /**
     * Feature that displays a text field to edit the event name.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/SimpleEventEdit)
     */
    simpleEventEditFeature? : object|boolean|string|SimpleEventEdit|SimpleEventEditConfig
    /**
     * Allows sorting of grid by clicking (or tapping) headers, also displays which columns grid is sorted by (numbered if
     * using multisort). Use modifier keys for multisorting: [Ctrl/CMD + click] to add sorter, [Ctrl/CMD + Alt + click] to remove sorter.
     * The actual sorting is done by the store, see [Store.sort()](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/StoreSort#function-sort).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Sort)
     */
    sortFeature? : object|boolean|string|Sort|SortConfig
    /**
     * This feature allows splitting the Scheduler into multiple views, either by using the cell context menu, or
     * programmatically by calling [split()](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Split#function-split).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Split)
     */
    splitFeature? : object|boolean|string|Split|SplitConfig
    /**
     * A feature which pins configurable content from a grid row to the top of the grid
     * while the row scrolls off the top but is still visible.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/StickyCells)
     */
    stickyCellsFeature? : object|boolean|string|StickyCells|StickyCellsConfig
    /**
     * This feature applies native `position: sticky` to event contents in horizontal mode, keeping the contents in view as
     * long as possible on scroll. For vertical mode it uses a programmatic solution to achieve the same result.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/StickyEvents)
     */
    stickyEventsFeature? : object|boolean|string|StickyEvents|StickyEventsConfig
    /**
     * Stripes rows by adding alternating CSS classes to all row elements (`b-even` and `b-odd`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/Stripe)
     */
    stripeFeature? : object|boolean|string|Stripe|StripeConfig
    /**
     * A special version of the Grid Summary feature. This feature displays a summary row in the grid footer.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/Summary)
     */
    summaryFeature? : object|boolean|string|SchedulerSummary|SchedulerSummaryConfig
    /**
     * Adds scheduler specific menu items to the timeline header context menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeAxisHeaderMenu)
     */
    timeAxisHeaderMenuFeature? : object|boolean|string|TimeAxisHeaderMenu|TimeAxisHeaderMenuConfig
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
     * Feature that allows selection of a time span in the time axis header. When a time span is selected in the header,
     * a [timeSelectionChange](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeSelection#event-timeSelectionChange) event is fired.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeSelection)
     */
    timeSelectionFeature? : object|boolean|string|TimeSelection|TimeSelectionConfig
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
     * A feature that allows transforming a flat dataset (or the leaves of a hierarchical) into a tree by specifying a
     * record field per parent level. Parents are generated based on each leaf's value for those fields.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/TreeGroup)
     */
    treeGroupFeature? : object|boolean|string|GridTreeGroup|GridTreeGroupConfig
    /**
     * A feature allowing you to roll up and display values in the time axis cell for each parent row in a tree scheduler.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TreeSummary)
     */
    treeSummaryFeature? : object|boolean|string|TreeSummary|TreeSummaryConfig

}

export class BryntumTimeline extends React.Component<BryntumTimelineProps> {

    static instanceClass = Timeline;

    static instanceName = 'Timeline';

    processWidgetContent = processWidgetContent;

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
        'crudManagerClass',
        'dataField',
        'defaultRegion',
        'defaultResourceImageName',
        'descriptionRenderer',
        'deselectAllOnScheduleClick',
        'deselectOnClick',
        'destroyStore',
        'destroyStores',
        'detectCSSCompatibilityIssues',
        'disableGridColumnIdWarning',
        'disableGridRowModelWarning',
        'dock',
        'drawer',
        'durationDisplayPrecision',
        'elementAttributes',
        'enableDeleteKey',
        'enableRecurringEvents',
        'enableSticky',
        'enableTextSelection',
        'enableTransactionalFeatures',
        'endParamName',
        'eventBarTextField',
        'eventRenderer',
        'eventRendererThisObj',
        'eventSelectionDisabled',
        'fillLastColumn',
        'fixedRowHeight',
        'footer',
        'formulaProviders',
        'fullRowRefresh',
        'getDateConstraints',
        'getRowHeight',
        'header',
        'hideHorizontalScrollbar',
        'highlightPredecessors',
        'highlightSuccessors',
        'hoverCls',
        'icon',
        'ignoreDomEventsWhileScrolling',
        'ignoreParentReadOnly',
        'listeners',
        'listRangeMenu',
        'loadMask',
        'loadMaskDefaults',
        'loadMaskError',
        'localizable',
        'maintainSelectionOnDatasetChange',
        'managedEventSizing',
        'maskDefaults',
        'masked',
        'maxDate',
        'maxTimeAxisUnit',
        'minDate',
        'mode',
        'monitorResize',
        'multiEventSelect',
        'narrowEventWidth',
        'owner',
        'partner',
        'passStartEndParameters',
        'plugins',
        'preCalculateHeightLimit',
        'preserveFocusOnDatasetChange',
        'preserveScrollOnDatasetChange',
        'preventTooltipOnTouch',
        'relayStoreEvents',
        'resizable',
        'resizeToFitIncludesHeader',
        'resourceColumns',
        'resourceImageExtension',
        'resourceImagePath',
        'resourceImages',
        'resourceTimeRangeRenderer',
        'responsiveLevels',
        'ripple',
        'rootElement',
        'scrollerClass',
        'scrollExtensionThreshold',
        'scrollManager',
        'showCreationTooltip',
        'showDirty',
        'showEventColorPickers',
        'showLagInTooltip',
        'showRecurringUI',
        'snapRelativeToEventStartDate',
        'startParamName',
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
        'tbar',
        'terminalCls',
        'terminalSides',
        'timeAxis',
        'triggerSelectionChangeOnRemove',
        'type',
        'ui',
        'verticalTimeAxisColumn',
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
        'allowOverlap',
        'animateTreeNodeToggle',
        'appendTo',
        'assignments',
        'assignmentStore',
        'autoCreate',
        'barMargin',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'cellEllipsis',
        'cls',
        'collapsed',
        'column',
        'columnLines',
        'columns',
        'creationTooltipTemplate',
        'crudManager',
        'data',
        'dataset',
        'date',
        'dateFormat',
        'dateSeparator',
        'dependencies',
        'dependencyStore',
        'descriptionFormat',
        'disabled',
        'displayDateFormat',
        'emptyText',
        'enableEventAnimations',
        'enableUndoRedoKeys',
        'endDate',
        'eventColor',
        'eventLayout',
        'eventReleaseThreshold',
        'events',
        'eventStore',
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
        'initialAnimationDuration',
        'inputFieldAlign',
        'insertBefore',
        'insertFirst',
        'isEventSelectable',
        'keyMap',
        'labelPosition',
        'lazyLoadingIndicator',
        'longPressTime',
        'margin',
        'maxHeight',
        'maxWidth',
        'maxZoomLevel',
        'milestoneAlign',
        'milestoneCharWidth',
        'milestoneLayoutMode',
        'milestoneTextPosition',
        'minHeight',
        'minPackSize',
        'minWidth',
        'minZoomLevel',
        'onAfterDependencyCreateDrop',
        'onAfterDependencySave',
        'onAfterDragCreate',
        'onAfterEventDragSelect',
        'onAfterEventDrop',
        'onAfterEventEdit',
        'onAfterEventSave',
        'onAssignmentSelectionChange',
        'onBeforeAssignmentDelete',
        'onBeforeAssignmentSelectionChange',
        'onBeforeAutoCreate',
        'onBeforeCancelCellEdit',
        'onBeforeCancelRowEdit',
        'onBeforeCellEditStart',
        'onBeforeCellRangeDelete',
        'onBeforeCellRangeEdit',
        'onBeforeColumnDragStart',
        'onBeforeColumnDropFinalize',
        'onBeforeColumnResize',
        'onBeforeContextShow',
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
        'onBeforeEventAdd',
        'onBeforeEventDelete',
        'onBeforeEventDrag',
        'onBeforeEventDragSelect',
        'onBeforeEventDropFinalize',
        'onBeforeEventEdit',
        'onBeforeEventEditShow',
        'onBeforeEventResize',
        'onBeforeEventResizeFinalize',
        'onBeforeEventSave',
        'onBeforeEventSelectionChange',
        'onBeforeExcelExport',
        'onBeforeFillHandleDragStart',
        'onBeforeFinishCellEdit',
        'onBeforeFinishRowEdit',
        'onBeforeHide',
        'onBeforePan',
        'onBeforePaste',
        'onBeforePdfExport',
        'onBeforePresetChange',
        'onBeforeRenderRow',
        'onBeforeRenderRows',
        'onBeforeRowCollapse',
        'onBeforeRowExpand',
        'onBeforeSelectedContextsShow',
        'onBeforeSelectionChange',
        'onBeforeSetRecord',
        'onBeforeShow',
        'onBeforeShowTerminals',
        'onBeforeStartRowEdit',
        'onBeforeStateApply',
        'onBeforeStateSave',
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
        'onCurrentTimelineUpdate',
        'onDataChange',
        'onDateRangeChange',
        'onDependenciesDrawn',
        'onDependencyClick',
        'onDependencyContextMenu',
        'onDependencyCreateDragStart',
        'onDependencyCreateDrop',
        'onDependencyDblClick',
        'onDependencyMenuBeforeShow',
        'onDependencyMenuItem',
        'onDependencyMenuShow',
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
        'onEventAutoCreated',
        'onEventClick',
        'onEventContextMenu',
        'onEventDblClick',
        'onEventDrag',
        'onEventDragAbort',
        'onEventDragModeChange',
        'onEventDragReset',
        'onEventDragSelect',
        'onEventDragStart',
        'onEventDrop',
        'onEventEditBeforeSetRecord',
        'onEventKeyDown',
        'onEventKeyUp',
        'onEventMenuBeforeShow',
        'onEventMenuItem',
        'onEventMenuShow',
        'onEventMouseDown',
        'onEventMouseEnter',
        'onEventMouseLeave',
        'onEventMouseOut',
        'onEventMouseOver',
        'onEventMouseUp',
        'onEventPartialResize',
        'onEventResizeEnd',
        'onEventResizeStart',
        'onEventSelectionChange',
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
        'onNavigate',
        'onNoZoomChange',
        'onPaint',
        'onPaste',
        'onPasteNotAllowed',
        'onPdfExport',
        'onPresetChange',
        'onReadOnly',
        'onRecompose',
        'onReleaseEvent',
        'onRenderEvent',
        'onRenderRow',
        'onRenderRows',
        'onResize',
        'onResourceHeaderClick',
        'onResourceHeaderContextmenu',
        'onResourceHeaderDblclick',
        'onResourceMenuBeforeShow',
        'onResourceMenuItem',
        'onResourceMenuShow',
        'onResourceMenuToggleItem',
        'onResourceTimeRangeClick',
        'onResourceTimeRangeContextMenu',
        'onResourceTimeRangeDblClick',
        'onResourceTimeRangeMouseDown',
        'onResourceTimeRangeMouseOut',
        'onResourceTimeRangeMouseOver',
        'onResourceTimeRangeMouseUp',
        'onResponsive',
        'onRowCollapse',
        'onRowExpand',
        'onRowMouseEnter',
        'onRowMouseLeave',
        'onScheduleClick',
        'onScheduleContextMenu',
        'onScheduleDblClick',
        'onScheduleMenuBeforeShow',
        'onScheduleMenuItem',
        'onScheduleMenuShow',
        'onScheduleMouseDown',
        'onScheduleMouseEnter',
        'onScheduleMouseLeave',
        'onScheduleMouseMove',
        'onScheduleMouseUp',
        'onScroll',
        'onScrollButtonClick',
        'onSelectionChange',
        'onSelectionModeChange',
        'onShiftIncrementChange',
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
        'onTickCellClick',
        'onTickCellContextMenu',
        'onTickCellDblClick',
        'onTickCellMouseDown',
        'onTickCellMouseUp',
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
        'onTimeSelectionChange',
        'onTimeSelectionElementClick',
        'onToggleGroup',
        'onToggleNode',
        'onToolClick',
        'onUnlockRows',
        'onUnsplit',
        'onVisibleDateRangeChange',
        'overlappingEventSorter',
        'preserveScroll',
        'presets',
        'project',
        'range',
        'readOnly',
        'recurrenceConfirmationPopup',
        'rendition',
        'resourceMargin',
        'resources',
        'resourceStore',
        'resourceTimeRanges',
        'resourceTimeRangeStore',
        'rowHeight',
        'rowLines',
        'rtl',
        'scrollable',
        'selectionMode',
        'selectResourceOnEventNavigate',
        'selectResourceOnScheduleClick',
        'shiftIncrement',
        'showTooltip',
        'snap',
        'span',
        'startDate',
        'stateSettings',
        'store',
        'suppressFit',
        'terminalHideDelay',
        'terminalOffset',
        'terminalShowDelay',
        'terminalSize',
        'tickSize',
        'timeRanges',
        'timeRangeStore',
        'timeResolution',
        'title',
        'tools',
        'tooltipTemplate',
        'transition',
        'transitionDuration',
        'updateTimelineContextOnScroll',
        'useContextualRecurrenceRules',
        'useInitialAnimation',
        'viewPreset',
        'visibleDate',
        'width',
        'workingTime'
    ];

    static propertyNames = [
        'focusVisible',
        'hasChanges',
        'isEngineReady',
        'isNavigatingTimelineCells',
        'originalStore',
        'parent',
        'scrollLeft',
        'scrollTop',
        'scrollX',
        'selectedAssignments',
        'selectedCell',
        'selectedCells',
        'selectedEvents',
        'selectedRecord',
        'selectedRecords',
        'selectedRows',
        'state',
        'timelineCell',
        'timeZone',
        'tooltip',
        'zoomLevel'
    ];

    // Component instance
    instance!: Timeline;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumTimelineProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-timeline-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
