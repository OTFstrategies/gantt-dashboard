/**
 * React wrapper for Bryntum VersionGrid
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, Base, CellCopyPaste, CellCopyPasteConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, DomConfig, EmptyTextDomConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Grid, GridBase, GridCellEdit, GridCellEditConfig, GridColumnConfig, GridExcelExporter, GridExcelExporterConfig, GridGroupSummary, GridGroupSummaryConfig, GridLocation, GridLocationConfig, GridLockRows, GridLockRowsConfig, GridPdfExport, GridPdfExportConfig, GridPrint, GridPrintConfig, GridRowReorder, GridRowReorderConfig, GridRowResize, GridRowResizeConfig, GridSelectionMode, GridSplit, GridSplitConfig, GridStateInfo, GridSummary, GridSummaryConfig, GridTreeGroup, GridTreeGroupConfig, Group, GroupConfig, HeaderMenu, HeaderMenuConfig, KeyMapConfig, Mask, MaskConfig, Menu, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, PagingToolbarConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PinColumns, PinColumnsConfig, PreserveScrollOptions, QuickFind, QuickFindConfig, RecordPositionContext, RegionResize, RegionResizeConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, SchedulerProProjectModel, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, Sort, SortConfig, StateProvider, StickyCells, StickyCellsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, TabConfig, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, Tree, TreeConfig, VersionGrid, VersionGridListeners, VersionModel, Widget, XLSColumn } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumVersionGridProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * When this widget is a child of a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container), it will by default be participating in a
     * flexbox layout. This config allows you to set this widget's
     * [align-self](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self) style.
     */
    alignSelf? : string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Automatically set grids height to fit all rows (no scrolling in the grid). In general you should avoid
     * using `autoHeight: true`, since it will bypass Grids virtual rendering and render all rows at once, which
     * in a larger grid is really bad for performance.
     */
    autoHeight? : boolean
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar. Another way to add a bbar is to use [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-bbar)
     */
    bbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * Custom CSS classes to add to the panel's body element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-bodyCls)
     */
    bodyCls? : string|object
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-catchEventHandlerExceptions)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-cls)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-collapsible)
     */
    collapsible? : boolean|PanelCollapserConfig|PanelCollapserOverlayConfig
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-color)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-columns)
     */
    columns? : ColumnStore|GridColumnConfig[]|ColumnStoreConfig
    /**
     * The id of the version currently being compared, if any.
     */
    comparingVersionId? : boolean
    config? : object
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-contentElementCls)
     */
    contentElementCls? : string|object
    /**
     * Event which is used to show context menus.
     * Available options are: 'contextmenu', 'click', 'dblclick'.
     */
    contextMenuTriggerEvent? : 'contextmenu'|'click'|'dblclick'
    /**
     * Convenient shortcut to set data in grids store both during initialization and at runtime. Can also be
     * used to retrieve data at runtime, although we do recommend interacting with Grids store instead using
     * the [store](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#property-store) property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-data)
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
     * The date format used for displaying date values in change actions.
     */
    dateFormat? : string
    /**
     * Region to which columns are added when they have none specified
     */
    defaultRegion? : string
    /**
     * Set to `true` to destroy the store when the grid is destroyed.
     */
    destroyStore? : boolean
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-disabled)
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
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * Make this Panel a docked drawer which slides out from one side of the browser viewport by default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-drawer)
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
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-elementAttributes)
     */
    elementAttributes? : Record<string, string|null>
    /**
     * Text or HTML, or a [EmptyTextDomConfig](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#typedef-EmptyTextDomConfig) block to display when there is no data to display in the grid.
     * When using multiple Grid regions, provide the `region` property to decide where the text is shown.
     * By default, it is shown in the first region.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-emptyText)
     */
    emptyText? : string|EmptyTextDomConfig
    /**
     * Configure this as `true` to allow elements within cells to be styled as `position: sticky`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-enableSticky)
     */
    enableSticky? : boolean
    /**
     * Set to `true` to allow text selection in the grid cells. Note, this cannot be used simultaneously with the
     * `RowReorder` feature.
     */
    enableTextSelection? : boolean
    /**
     * Set to `true` to listen for CTRL-Z (CMD-Z on Mac OS) keyboard event and trigger undo (redo when SHIFT is
     * pressed). Only applicable when using a [StateTrackingManager](https://bryntum.com/products/gantt/docs/api/Core/data/stm/StateTrackingManager).
     */
    enableUndoRedoKeys? : boolean
    extraData? : any
    /**
     * Set to `true` to stretch the last column in a grid with all fixed width columns
     * to fill extra available space if the grid's width is wider than the sum of all
     * configured column widths.
     */
    fillLastColumn? : boolean
    /**
     * Use fixed row height. Setting this to `true` will configure the underlying RowManager to use fixed row
     * height, which sacrifices the ability to use rows with variable height to gain a fraction better
     * performance.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-fixedRowHeight)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-footer)
     */
    footer? : {
        dock?: 'top'|'right'|'bottom'|'left'|'start'|'end'
        html?: string
        cls?: string
    }|string
    /**
     * An object which names formula prefixes which will be applied to all columns configured with
     * `formula : true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-formulaProviders)
     */
    formulaProviders? : Record<string, FormulaProviderConfig>
    /**
     * Refresh entire row when a record changes (`true`) or, if possible, only the cells affected (`false`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-fullRowRefresh)
     */
    fullRowRefresh? : boolean
    /**
     * A function called for each row to determine its height. It is passed a [record](https://bryntum.com/products/gantt/docs/api/Core/data/Model) and
     * expected to return the desired height of that records row. If the function returns a falsy value, Grids
     * configured [rowHeight](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-rowHeight) is used.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-getRowHeight)
     * @param {Core.data.Model} getRowHeight.record Record to determine row height for
     * @returns {number} Desired row height
     */
    getRowHeight? : (getRowHeight: { record: Model }) => number
    /**
     * A config [object](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#typedef-PanelHeader) for the panel's header or a string in place of a `title`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-header)
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
     * Determines if the widgets read-only state should be controlled by its parent.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Convenience setting to align input fields of child widgets. By default, the Field input element is
     * placed immediately following the `label`. If you prefer to have all input fields aligned to the
     * right, set this config to `'end'`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-inputFieldAlign)
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
     * See [Keyboard shortcuts](https://bryntum.com/products/gantt/docs/api/Grid/view/Grid#keyboard-shortcuts) for details
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * Convenience setting to use same label placement on all child widgets.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|'align-before'|'auto'|null
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-listeners)
     */
    listeners? : VersionGridListeners
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-loadMaskDefaults)
     */
    loadMaskDefaults? : MaskConfig
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object to adjust the [maskDefaults](#Core/widget/Widget#config-maskDefaults)
     * when an error occurs loading data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-loadMaskError)
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
     * The element's maxHeight. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [height](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-height), *reading* the value will return the numeric value in pixels.
     */
    maxHeight? : string|number
    /**
     * The elements maxWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    maxWidth? : string|number
    /**
     * Grid's `min-height`. Defaults to `10em` to be sure that the Grid always has a height wherever it is
     * inserted.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-minHeight)
     */
    minHeight? : string|number
    /**
     * The elements minWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    minWidth? : string|number
    /**
     * Grid monitors window resize by default.
     */
    monitorResize? : boolean
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-owner)
     */
    owner? : Widget|any
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
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * The [ProjectModel](https://bryntum.com/products/gantt/docs/api/SchedulerPro/model/ProjectModel) whose versions and changes are being observed in this grid.
     */
    project? : SchedulerProProjectModel|RefObject<any>
    /**
     * Set to `true` to make the grid read-only, by disabling any UIs for modifying data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-readOnly)
     */
    readOnly? : boolean
    relayStoreEvents? : boolean
    /**
     * Either a default `rendition` to apply to all child widgets, or a map of renditions keyed by child widget
     * `type`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-rendition)
     */
    rendition? : string|Record<string, string>|null
    /**
     * Configure this property to allow the widget/component to be resized. Pressing <kbd>Shift</kbd> while resizing will
     * constrain the aspect ratio.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-resizable)
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
     * "Break points" for which responsive config to use for columns and css.
     */
    responsiveLevels? : Record<string, number|string>
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-ripple)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-rowHeight)
     */
    rowHeight? : number
    /**
     * Set to `false` to not show row lines. End result might be overruled by/differ between themes.
     */
    rowLines? : boolean
    /**
     * This may be configured as `true` to make the widget's element use the `direction:rtl` style.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-rtl)
     */
    rtl? : boolean
    /**
     * Configures whether the grid is scrollable in the `Y` axis. This is used to configure a [Scroller](https://bryntum.com/products/gantt/docs/api/Core/helper/util/Scroller).
     * See the [scrollerClass](https://bryntum.com/products/gantt/docs/api/Grid/view/GridBase#config-scrollerClass) config option.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-scrollable)
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
     * Selection configuration settings, change these properties to control how selection works and what can be
     * selected.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-selectionMode)
     */
    selectionMode? : GridSelectionMode
    /**
     * Configure as `true` to have the grid show a red "changed" tag in cells whose
     * field value has changed and not yet been committed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-showDirty)
     */
    showDirty? : boolean|{
        duringEdit?: boolean
        newRecord?: boolean
    }
    /**
     * Whether to show only versions that have been assigned a specific name.
     */
    showNamedVersionsOnly? : boolean
    /**
     * Whether to display transactions not yet associated with a version.
     */
    showUnattachedTransactions? : boolean
    /**
     * Whether to include version rows in the display.
     */
    showVersions? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * This value can be one of the following:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-stateful)
     */
    stateful? : boolean|object|string[]
    /**
     * The events that, when fired by this component, should trigger it to save its state by calling
     * [saveState](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#function-saveState).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-statefulEvents)
     */
    statefulEvents? : object|string[]
    /**
     * The key to use when saving this object's state in the [stateProvider](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateProvider). If this config is
     * not assigned, and [stateful](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateful) is not set to `false`, the [id](#Core/widget/Widget#config-id)
     * (if explicitly specified) will be used as the `stateId`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-stateId)
     */
    stateId? : string
    /**
     * The `StateProvider` to use to save and restore this object's [state](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#property-state). By default, `state`
     * will be saved using the [default state provider](https://bryntum.com/products/gantt/docs/api/Core/state/StateProvider#property-instance-static).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-stateProvider)
     */
    stateProvider? : StateProvider
    /**
     * The properties of this settings object controls how grid is restored from state data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-stateSettings)
     */
    stateSettings? : {
        restoreUnconfiguredColumns?: boolean
    }
    /**
     * The store instance or config object that holds the records to be displayed by this TreeGrid. If assigning
     * a store instance, it must be configured with `tree: true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-store)
     */
    store? : Store|StoreConfig
    /**
     * An object containing widgets keyed by name. By default (when no `type` is given), strips are
     * [toolbars](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar). If you want to pass an array, you can use
     * the toolbar's [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-strips)
     */
    strips? : Record<string, ContainerItemConfig>
    /**
     * An object containing sub grid configuration objects keyed by a `region` property.
     * By default, grid has a 'locked' region (if configured with locked columns) and a 'normal' region.
     * The 'normal' region defaults to use `flex: 1`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-subGridConfigs)
     */
    subGridConfigs? : Record<string, SubGridConfig>
    /**
     * A [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object, or a message to be shown when Crud Manager
     * is persisting changes on the server. Set to `null` to disable default sync mask.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-syncMask)
     */
    syncMask? : string|MaskConfig|null
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * When this container is used as a tab in a TabPanel, these items are added to the
     * [TabBar](https://bryntum.com/products/gantt/docs/api/Core/widget/TabBar) when this container is the active tab.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-tabBarItems)
     */
    tabBarItems? : ToolbarItems[]|Widget[]
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar.
     * This creates a toolbar docked to the top of the panel immediately below the header.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-tbar)
     */
    tbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * A title to display in the header or owning TabPanel. Causes creation and docking of a header
     * to the top if no header is configured.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-title)
     */
    title? : string
    /**
     * The [tools](https://bryntum.com/products/gantt/docs/api/Core/widget/Tool) to add either before or after the `title` in the Panel header. Each
     * property name is the reference by which an instantiated tool may be retrieved from the live
     * `[tools](https://bryntum.com/products/gantt/docs/api/Core/widget/mixin/Toolable#property-tools)` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-tools)
     */
    tools? : Record<string, ToolConfig>|null
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
    }
    /**
     * Animation transition duration in milliseconds.
     */
    transitionDuration? : number
    type? : 'versiongrid'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#config-ui)
     */
    ui? : 'plain'|'toolbar'|string|object
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

    // Events
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-beforeCancelRowEdit)
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
     * Fires before an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onBeforeDestroy? : ((event: { source: Base }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-beforeFinishRowEdit)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-beforeRowCollapse)
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onBeforeRowCollapse? : ((event: { record: Model }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires before row expand is started.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-beforeRowExpand)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-catchAll)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-cellMenuBeforeShow)
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
     * Fires when the user chooses to compare a selected version.
     * @param {object} event Event object
     * @param {SchedulerPro.model.VersionModel} event.version The [VersionModel](https://bryntum.com/products/gantt/docs/api/SchedulerPro/model/VersionModel) being restored
     */
    onCompare? : ((event: { version: VersionModel }) => void)|string
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
     * Fired when data in the store changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-dataChange)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-finishRowEdit)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-headerClick)
     * @param {object} event Event object
     * @param {Event} event.domEvent The triggering DOM event.
     * @param {Grid.column.Column} event.column The column clicked on.
     */
    onHeaderClick? : ((event: { domEvent: Event, column: Column }) => Promise<boolean>|boolean|void)|string
    /**
     * This event fires on the owning Grid before the context menu is shown for a header.
     * Allows manipulation of the items to show in the same way as in the [processItems](https://bryntum.com/products/gantt/docs/api/Grid/feature/HeaderMenu#config-processItems).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-headerMenuBeforeShow)
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
     * Triggered when a widget which had been in a non-visible state for any reason
     * achieves visibility.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-paint)
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
     * Fires when the user chooses to restore a selected version.
     * @param {object} event Event object
     * @param {SchedulerPro.model.VersionModel} event.version The [VersionModel](https://bryntum.com/products/gantt/docs/api/SchedulerPro/model/VersionModel) being restored
     */
    onRestore? : ((event: { version: VersionModel }) => void)|string
    /**
     * This event fires when a row has finished collapsing.
     * @param {object} event Event object
     * @param {Core.data.Model} event.record Record
     */
    onRowCollapse? : ((event: { record: Model }) => void)|string
    /**
     * This event fires when a row expand has finished expanding.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/SchedulerPro/widget/VersionGrid#event-rowExpand)
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
     * Grid has scrolled vertically
     * @param {object} event Event object
     * @param {Grid.view.Grid} event.source The firing Grid instance.
     * @param {number} event.scrollTop The vertical scroll position.
     */
    onScroll? : ((event: { source: Grid, scrollTop: number }) => void)|string
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
     * Fires when the user chooses to stop comparing a currently compared version.
     */
    onStopCompare? : (() => void)|string
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
     * Generates PDF/PNG files from the Grid component.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/export/PdfExport)
     */
    pdfExportFeature? : object|boolean|string|GridPdfExport|GridPdfExportConfig
    /**
     * Allows pinning columns to the start or end region of the grid without any additional subGrid configurations.
     * When pinning to a region that does not yet exist, the feature creates the required subGrid on the fly.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/PinColumns)
     */
    pinColumnsFeature? : object|boolean|string|PinColumns|PinColumnsConfig
    /**
     * Allows printing Grid contents using browser print dialog.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/export/Print)
     */
    printFeature? : object|boolean|string|GridPrint|GridPrintConfig
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
     * Allows user to reorder rows by dragging them. To get notified about row reorder listen to `change` event
     * on the grid [store](https://bryntum.com/products/gantt/docs/api/Core/data/Store).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowReorder)
     */
    rowReorderFeature? : object|boolean|string|GridRowReorder|GridRowReorderConfig
    /**
     * Enables user to change row height by dragging the bottom row border. After a resize operation, the [rowHeight](https://bryntum.com/products/gantt/docs/api/Grid/data/GridRowModel#field-rowHeight)
     * field of the record is updated (when [applyToAllRows](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowResize#config-applyToAllRows) is `false`).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/RowResize)
     */
    rowResizeFeature? : object|boolean|string|GridRowResize|GridRowResizeConfig
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
     * Displays a summary row in the grid footer.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Grid/feature/GridSummary)
     */
    summaryFeature? : object|boolean|string|GridSummary|GridSummaryConfig
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

}

export class BryntumVersionGrid extends React.Component<BryntumVersionGridProps> {

    static instanceClass = VersionGrid;

    static instanceName = 'VersionGrid';

    processWidgetContent = processWidgetContent;

    static configNames = [
        'adopt',
        'animateFilterRemovals',
        'animateRemovingRows',
        'ariaDescription',
        'ariaLabel',
        'autoHeight',
        'bbar',
        'bodyCls',
        'bubbleEvents',
        'collapsible',
        'color',
        'config',
        'contentElementCls',
        'contextMenuTriggerEvent',
        'dataField',
        'dateFormat',
        'defaultRegion',
        'destroyStore',
        'detectCSSCompatibilityIssues',
        'disableGridColumnIdWarning',
        'disableGridRowModelWarning',
        'dock',
        'drawer',
        'elementAttributes',
        'enableSticky',
        'enableTextSelection',
        'fillLastColumn',
        'fixedRowHeight',
        'footer',
        'formulaProviders',
        'fullRowRefresh',
        'getRowHeight',
        'header',
        'hideHorizontalScrollbar',
        'hoverCls',
        'icon',
        'ignoreParentReadOnly',
        'listeners',
        'loadMask',
        'loadMaskDefaults',
        'loadMaskError',
        'localizable',
        'maskDefaults',
        'masked',
        'monitorResize',
        'owner',
        'plugins',
        'preserveFocusOnDatasetChange',
        'preserveScrollOnDatasetChange',
        'preventTooltipOnTouch',
        'project',
        'relayStoreEvents',
        'resizable',
        'resizeToFitIncludesHeader',
        'responsiveLevels',
        'ripple',
        'rootElement',
        'scrollerClass',
        'scrollManager',
        'showDirty',
        'stateful',
        'statefulEvents',
        'stateId',
        'stateProvider',
        'strips',
        'subGridConfigs',
        'syncMask',
        'tab',
        'tabBarItems',
        'tbar',
        'type',
        'ui',
        'weight'
    ];

    static propertyConfigNames = [
        'alignSelf',
        'animateTreeNodeToggle',
        'appendTo',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'cellEllipsis',
        'cls',
        'collapsed',
        'column',
        'columnLines',
        'columns',
        'comparingVersionId',
        'data',
        'dataset',
        'disabled',
        'emptyText',
        'enableUndoRedoKeys',
        'extraData',
        'flex',
        'height',
        'hidden',
        'hideFooters',
        'hideHeaders',
        'id',
        'inputFieldAlign',
        'insertBefore',
        'insertFirst',
        'keyMap',
        'labelPosition',
        'longPressTime',
        'margin',
        'maxHeight',
        'maxWidth',
        'minHeight',
        'minWidth',
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
        'onBeforeDestroy',
        'onBeforeExcelExport',
        'onBeforeFillHandleDragStart',
        'onBeforeFinishCellEdit',
        'onBeforeFinishRowEdit',
        'onBeforeHide',
        'onBeforePaste',
        'onBeforePdfExport',
        'onBeforeRenderRow',
        'onBeforeRenderRows',
        'onBeforeRowCollapse',
        'onBeforeRowExpand',
        'onBeforeSelectionChange',
        'onBeforeSetRecord',
        'onBeforeShow',
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
        'onCompare',
        'onContextMenuItem',
        'onContextMenuToggleItem',
        'onCopy',
        'onDataChange',
        'onDestroy',
        'onDirtyStateChange',
        'onDragSelecting',
        'onElementCreated',
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
        'onPaint',
        'onPaste',
        'onPdfExport',
        'onReadOnly',
        'onRecompose',
        'onRenderRow',
        'onRenderRows',
        'onResize',
        'onResponsive',
        'onRestore',
        'onRowCollapse',
        'onRowExpand',
        'onRowMouseEnter',
        'onRowMouseLeave',
        'onScroll',
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
        'onStopCompare',
        'onSubGridCollapse',
        'onSubGridExpand',
        'onToggleGroup',
        'onToggleNode',
        'onToolClick',
        'onUnlockRows',
        'onUnsplit',
        'preserveScroll',
        'readOnly',
        'rendition',
        'rowHeight',
        'rowLines',
        'rtl',
        'scrollable',
        'selectionMode',
        'showNamedVersionsOnly',
        'showUnattachedTransactions',
        'showVersions',
        'span',
        'stateSettings',
        'store',
        'title',
        'tools',
        'transition',
        'transitionDuration',
        'width'
    ];

    static propertyNames = [
        'focusVisible',
        'hasChanges',
        'originalStore',
        'parent',
        'selectedCell',
        'selectedCells',
        'selectedRecord',
        'selectedRecords',
        'selectedRows',
        'state',
        'tooltip'
    ];

    // Component instance
    instance!: VersionGrid;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumVersionGridProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-version-grid-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
