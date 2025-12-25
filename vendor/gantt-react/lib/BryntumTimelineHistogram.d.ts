import React from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, Base, CellCopyPaste, CellCopyPasteConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnLines, ColumnLinesConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, DomConfig, DurationUnit, EmptyTextDomConfig, EventColor, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Grid, GridBase, GridCellEdit, GridCellEditConfig, GridColumnConfig, GridExcelExporter, GridExcelExporterConfig, GridLocation, GridLocationConfig, GridLockRows, GridLockRowsConfig, GridPdfExport, GridPdfExportConfig, GridPrint, GridPrintConfig, GridRowResize, GridRowResizeConfig, GridSelectionMode, GridStateInfo, GridTreeGroup, GridTreeGroupConfig, Group, GroupConfig, GroupSummary, GroupSummaryConfig, HeaderMenu, HeaderMenuConfig, HeaderZoom, HeaderZoomConfig, Histogram, HistogramConfig, HistogramRenderData, HistogramSeries, KeyMapConfig, Mask, MaskConfig, Menu, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, NonWorkingTime, NonWorkingTimeConfig, PagingToolbarConfig, Pan, PanConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PinColumns, PinColumnsConfig, PreserveScrollOptions, QuickFind, QuickFindConfig, RecordPositionContext, RecurrenceConfirmationPopup, RecurrenceConfirmationPopupConfig, RegionResize, RegionResizeConfig, ResourceMenu, ResourceMenuConfig, ResourceTimeRangeModel, ResourceTimeRanges, ResourceTimeRangesConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, RowReorder, RowReorderConfig, ScaleColumnConfig, ScalePoint, ScheduleTooltip, ScheduleTooltipConfig, Scheduler, SchedulerAssignmentModel, SchedulerEventModel, SchedulerResourceModel, SchedulerSummary, SchedulerSummaryConfig, SchedulerTimeAxisColumn, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, Sort, SortConfig, Split, SplitConfig, StateProvider, StickyCells, StickyCellsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, TabConfig, TimeAxis, TimeAxisConfig, TimeAxisHeaderMenu, TimeAxisHeaderMenuConfig, TimeRanges, TimeRangesConfig, TimeSpan, TimelineBase, TimelineContext, TimelineHistogram, TimelineHistogramListeners, Tool, ToolConfig, ToolbarConfig, ToolbarItems, Tooltip, TooltipConfig, Tree, TreeConfig, VerticalTimeAxisColumn, ViewPreset, ViewPresetConfig, VisibleDate, Widget, XLSColumn } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumTimelineHistogramProps = {
    adopt?: HTMLElement | string;
    aggregateDataEntry?: ((aggregateDataEntry: {
        aggregated: object;
        entry: object;
        arrayIndex: number;
        entryIndex: object[];
    }) => object) | string;
    aggregateHistogramDataForGroups?: boolean;
    alignSelf?: string;
    animateFilterRemovals?: boolean;
    animateRemovingRows?: boolean;
    animateTreeNodeToggle?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoAdjustTimeAxis?: boolean;
    autoHeight?: boolean;
    barMargin?: number;
    barTooltipTemplate?: (context: {
        datum: object;
        tip: Tooltip;
        element: HTMLElement;
        activeTarget: HTMLElement;
        event: Event;
        record: Model;
    }) => string;
    bbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    bodyCls?: string | object;
    bubbleEvents?: object;
    bufferCoef?: number;
    bufferThreshold?: number;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    cellEllipsis?: boolean;
    cls?: string | object;
    collapsed?: boolean;
    collapsible?: boolean | PanelCollapserConfig | PanelCollapserOverlayConfig;
    color?: string;
    column?: number;
    columnLines?: boolean;
    columns?: ColumnStore | GridColumnConfig[] | ColumnStoreConfig;
    config?: object;
    contentElementCls?: string | object;
    contextMenuTriggerEvent?: 'contextmenu' | 'click' | 'dblclick';
    data?: object[] | Model[] | ModelConfig[];
    dataField?: string;
    dataModelField?: string;
    dataset?: Record<string, string>;
    defaultRegion?: string;
    destroyStore?: boolean;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    disableGridColumnIdWarning?: boolean;
    disableGridRowModelWarning?: boolean;
    displayDateFormat?: string;
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    drawer?: boolean | {
        side?: 'start' | 'left' | 'end' | 'right' | 'top' | 'bottom';
        size?: string | number;
        inline?: boolean;
        autoClose: {
            mousedown?: boolean | string;
            focusout?: boolean | string;
            mouseout?: string;
        };
        autoCloseDelay?: number;
    };
    durationDisplayPrecision?: number | boolean;
    elementAttributes?: Record<string, string | null>;
    emptyText?: string | EmptyTextDomConfig;
    enableEventAnimations?: boolean;
    enableRecurringEvents?: boolean | {
        defaultAction?: 'single' | 'future';
    };
    enableSticky?: boolean;
    enableTextSelection?: boolean;
    enableUndoRedoKeys?: boolean;
    endDate?: Date | string;
    eventColor?: EventColor;
    eventStyle?: 'tonal' | 'filled' | 'bordered' | 'traced' | 'outlined' | 'indented' | 'line' | 'dashed' | 'minimal' | 'rounded' | 'calendar' | 'interday' | 'gantt' | null;
    extraData?: any;
    fillLastColumn?: boolean;
    fillTicks?: boolean;
    fixedRowHeight?: boolean;
    flex?: number | string;
    footer?: {
        dock?: 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end';
        html?: string;
        cls?: string;
    } | string;
    forceFit?: boolean;
    formulaProviders?: Record<string, FormulaProviderConfig>;
    fullRowRefresh?: boolean;
    getBarClass?: (series: HistogramSeries, domConfig: DomConfig, datum: object, index: number, renderData: HistogramRenderData) => string;
    getBarDOMConfig?: (series: HistogramSeries, domConfig: DomConfig, datum: object, index: number, renderData: HistogramRenderData) => object;
    getBarText?: (datum: object, index: number, series: HistogramSeries, renderData: HistogramRenderData) => string;
    getBarTextDOMConfig?: (domConfig: DomConfig, datum: object, index: number, series: HistogramSeries, renderData: HistogramRenderData) => object;
    getDataEntryForAggregating?: ((getDataEntryForAggregating: {
        entry: object;
    }) => object) | string;
    getOutlineClass?: (series: HistogramSeries, data: object[], renderData: HistogramRenderData) => string;
    getOutlineDOMConfig?: (series: HistogramSeries, domConfig: DomConfig, data: object[]) => object;
    getRecordData?: ((getRecordData: {
        record: Model;
    }, aggregationContext?: object) => object) | string;
    getRowHeight?: (getRowHeight: {
        record: Model;
    }) => number;
    hardRefreshOnTimeAxisReconfigure?: boolean;
    header?: string | boolean | PanelHeader;
    height?: string | number;
    hidden?: boolean;
    hideFooters?: boolean;
    hideHeaders?: boolean;
    hideHorizontalScrollbar?: boolean;
    hideRowHover?: boolean;
    histogramWidget?: Histogram | HistogramConfig;
    histogramWidgetClass?: Histogram;
    hoverCls?: string;
    icon?: string | DomConfig;
    id?: string;
    ignoreDomEventsWhileScrolling?: boolean;
    ignoreParentReadOnly?: boolean;
    infiniteScroll?: boolean;
    initAggregatedDataEntry?: (() => object) | string;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    listeners?: TimelineHistogramListeners;
    loadMask?: string | MaskConfig | null;
    loadMaskDefaults?: MaskConfig;
    loadMaskError?: MaskConfig | Mask | boolean;
    localizable?: boolean;
    longPressTime?: number;
    managedEventSizing?: boolean;
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxDate?: Date | string;
    maxHeight?: string | number;
    maxTimeAxisUnit?: DurationUnit;
    maxWidth?: string | number;
    maxZoomLevel?: number;
    minDate?: Date | string;
    minHeight?: string | number;
    minWidth?: string | number;
    minZoomLevel?: number;
    monitorResize?: boolean;
    owner?: Widget | any;
    partner?: TimelineBase;
    plugins?: Function[];
    preserveFocusOnDatasetChange?: boolean;
    preserveScroll?: PreserveScrollOptions | boolean;
    preserveScrollOnDatasetChange?: boolean;
    presets?: ViewPresetConfig[];
    preventTooltipOnTouch?: boolean;
    readOnly?: boolean;
    recurrenceConfirmationPopup?: RecurrenceConfirmationPopupConfig | RecurrenceConfirmationPopup;
    relayStoreEvents?: boolean;
    rendition?: string | Record<string, string> | null;
    resizable?: boolean | {
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        handles?: object;
    };
    resizeToFitIncludesHeader?: boolean;
    resourceTimeRangeRenderer?: (detail: {
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        renderData: object;
    }) => string | DomConfig | DomConfig[];
    responsiveLevels?: Record<string, number | string>;
    ripple?: boolean | {
        delegate?: string;
        color?: string;
        radius?: number;
        clip?: string;
    };
    rootElement?: ShadowRoot | HTMLElement;
    rowHeight?: number;
    rowLines?: boolean;
    rtl?: boolean;
    scaleColumn?: ScaleColumnConfig;
    scalePoints?: ScalePoint[];
    scrollable?: boolean | ScrollerConfig | Scroller;
    scrollerClass?: typeof Scroller;
    scrollManager?: ScrollManagerConfig | ScrollManager;
    selectionMode?: GridSelectionMode;
    series?: Record<string, HistogramSeries>;
    showBarTip?: boolean | TooltipConfig;
    showBarTipWhenNavigatingTimeAxis?: boolean;
    showDirty?: boolean | {
        duringEdit?: boolean;
        newRecord?: boolean;
    };
    snap?: boolean;
    snapRelativeToEventStartDate?: boolean;
    span?: number;
    startDate?: Date | string;
    stateful?: boolean | object | string[];
    statefulEvents?: object | string[];
    stateId?: string;
    stateProvider?: StateProvider;
    stateSettings?: {
        restoreUnconfiguredColumns?: boolean;
    };
    stickyHeaders?: boolean;
    store?: Store | StoreConfig | AjaxStore | AjaxStoreConfig;
    strips?: Record<string, ContainerItemConfig>;
    subGridConfigs?: Record<string, SubGridConfig>;
    suppressFit?: boolean;
    syncMask?: string | MaskConfig | null;
    tab?: boolean | TabConfig;
    tabBarItems?: ToolbarItems[] | Widget[];
    tbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    tickSize?: number;
    timeAxis?: TimeAxisConfig | TimeAxis;
    timeResolution?: {
        increment?: number;
        unit?: DurationUnit;
    } | number;
    timeZone?: string | number;
    title?: string;
    tools?: Record<string, ToolConfig> | null;
    transition?: {
        insertRecord?: boolean;
        removeRecord?: boolean;
        toggleColumn?: boolean;
        expandCollapseColumn?: boolean;
        toggleRegion?: boolean;
        toggleTreeNode?: boolean;
        toggleGroup?: boolean;
        filterRemoval?: boolean;
    };
    transitionDuration?: number;
    type?: 'timelinehistogram';
    ui?: 'plain' | 'toolbar' | string | object;
    viewPreset?: string | ViewPresetConfig;
    visibleDate?: Date | VisibleDate;
    visibleZoomFactor?: number;
    weekStartDay?: number;
    weight?: number;
    width?: string | number;
    workingTime?: {
        fromDay?: number;
        toDay?: number;
        fromHour?: number;
        toHour?: number;
    };
    zoomKeepsOriginalTimespan?: boolean;
    zoomOnMouseWheel?: boolean;
    zoomOnTimeAxisDoubleClick?: boolean;
    onBeforeAssignmentDelete?: ((event: {
        source: Scheduler;
        assignmentRecords: SchedulerAssignmentModel[];
        context: {
            finalize: {
                removeRecords?: boolean;
            };
        };
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCancelCellEdit?: ((event: {
        source: Grid;
        editorContext: GridLocation;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCancelRowEdit?: ((event: {
        grid: Grid;
        editorContext: RowEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCellEditStart?: ((event: {
        source: Grid;
        editorContext: CellEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCellRangeDelete?: ((event: {
        source: Grid;
        gridSelection: (GridLocation | Model)[];
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCellRangeEdit?: ((event: {
        record: Model;
        field: string;
        value: any;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeColumnDragStart?: ((event: {
        source: Grid;
        column: Column;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeColumnDropFinalize?: ((event: {
        source: Grid;
        column: Column;
        insertBefore: Column;
        newParent: Column;
        event: Event;
        region: string;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeColumnResize?: ((event: {
        source: Grid;
        column: Column;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCopy?: ((event: {
        source: Grid;
        cells: GridLocation[];
        data: string;
        isCut: boolean;
        entityName: string;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeCSVExport?: ((event: {
        config: ExportConfig;
        columns: Column[];
        rows: Model[];
        lineDelimiter: string;
        columnDelimiter: string;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onBeforeEventDelete?: ((event: {
        source: Scheduler | any;
        eventRecords: SchedulerEventModel[];
        context: {
            finalize: {
                removeRecords?: boolean;
            };
        };
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeExcelExport?: ((event: {
        config: ExportConfig;
        columns: XLSColumn[];
        rows: any[];
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeFillHandleDragStart?: ((event: {
        cell: GridLocation;
        domEvent: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeFinishCellEdit?: ((event: {
        grid: Grid;
        editorContext: CellEditorContext;
    }) => void) | string;
    onBeforeFinishRowEdit?: ((event: {
        grid: Grid;
        editorContext: RowEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeHide?: ((event: {
        source: Widget;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeHistogramDataCacheSet?: ((event: {
        source: TimelineHistogram;
        record: Model;
        data: object;
    }) => void) | string;
    onBeforePan?: ((event: {
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforePaste?: ((event: {
        source: Grid;
        clipboardData: string;
        targetCell: GridLocation;
        entityName: string;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforePdfExport?: ((event: {
        config: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforePresetChange?: ((event: {
        source: Scheduler;
        startDate: Date;
        endDate: Date;
        from: ViewPreset;
        to: ViewPreset;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeRenderHistogramRow?: ((event: {
        source: TimelineHistogram;
        record: Model;
        histogramConfig: HistogramConfig;
        histogramWidget: Histogram;
    }) => void) | string;
    onBeforeRenderRecordHistogram?: ((event: {
        source: TimelineHistogram;
        record: Model;
        histogramConfig: HistogramConfig;
        histogramWidget: Histogram;
    }) => void) | string;
    onBeforeRenderRow?: ((event: {
        source: Grid;
        row: Row;
        record: Model;
        recordIndex: number;
    }) => void) | string;
    onBeforeRenderRows?: ((event: {
        source: Grid;
    }) => void) | string;
    onBeforeRowCollapse?: ((event: {
        record: Model;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeRowExpand?: ((event: {
        record: Model;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeSelectionChange?: ((event: {
        action: string;
        mode: 'row' | 'cell';
        source: Grid;
        deselected: Model[];
        selected: Model[];
        selection: Model[];
        deselectedCells: GridLocation[];
        selectedCells: GridLocation[];
        cellSelection: GridLocation[];
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeSetRecord?: ((event: {
        source: Container;
        record: Model;
    }) => void) | string;
    onBeforeShow?: ((event: {
        source: Widget | any;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStartRowEdit?: ((event: {
        source: Grid;
        editorContext: RowEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateApply?: ((event: {
        state: GridStateInfo;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateSave?: ((event: {
        state: GridStateInfo;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeToggleGroup?: ((event: {
        groupRecord: Model;
        groupRecords: Model[];
        collapse: boolean;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeToggleNode?: ((event: {
        source: Grid;
        record: Model;
        collapse: boolean;
    }) => void) | string;
    onCancelCellEdit?: ((event: {
        source: Grid;
        editorContext: GridLocation;
        event: Event;
    }) => void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onCellClick?: ((event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        target: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellContextMenu?: ((event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        target: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellDblClick?: ((event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        target: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellMenuBeforeShow?: ((event: {
        source: Grid;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
        record: Model;
    }) => Promise<boolean> | boolean | void) | string;
    onCellMenuItem?: ((event: {
        source: Grid;
        menu: Menu;
        item: MenuItem;
        column: Column;
        record: Model;
    }) => void) | string;
    onCellMenuShow?: ((event: {
        source: Grid;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
        record: Model;
    }) => void) | string;
    onCellMenuToggleItem?: ((event: {
        source: Grid;
        menu: Menu;
        item: MenuItem;
        column: Column;
        record: Model;
        checked: boolean;
    }) => void) | string;
    onCellMouseEnter?: ((event: {
        source: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellMouseLeave?: ((event: {
        source: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellMouseOut?: ((event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        target: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCellMouseOver?: ((event: {
        grid: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        target: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onCollapse?: ((event: {
        source: Panel;
    }) => void) | string;
    onCollapseNode?: ((event: {
        source: Grid;
        record: Model;
    }) => void) | string;
    onColumnDrag?: ((event: {
        source: Grid;
        column: Column;
        insertBefore: Column;
        event: Event;
        context: {
            valid: boolean;
        };
    }) => void) | string;
    onColumnDragStart?: ((event: {
        source: Grid;
        column: Column;
        event: Event;
    }) => void) | string;
    onColumnDrop?: ((event: {
        source: Grid;
        column: Column;
        insertBefore: Column;
        newParent: Column;
        valid: boolean;
        event: Event;
        region: string;
    }) => Promise<boolean> | boolean | void) | string;
    onColumnResize?: ((event: {
        source: Grid;
        column: Column;
        domEvent: Event;
    }) => void) | string;
    onColumnResizeStart?: ((event: {
        source: Grid;
        column: Column;
        domEvent: Event;
    }) => void) | string;
    onContextMenuItem?: ((event: {
        source: Widget;
        menu: Menu;
        item: MenuItem;
    }) => void) | string;
    onContextMenuToggleItem?: ((event: {
        source: Widget;
        menu: Menu;
        item: MenuItem;
        checked: boolean;
    }) => void) | string;
    onCopy?: ((event: {
        source: Grid;
        cells: GridLocation[];
        copiedDataString: string;
        isCut: boolean;
        entityName: string;
    }) => void) | string;
    onCurrentTimelineUpdate?: ((event: {
        source: Scheduler;
        date: Date;
    }) => void) | string;
    onDataChange?: ((event: {
        source: Grid;
        store: Store;
        action: 'remove' | 'removeAll' | 'add' | 'clearchanges' | 'filter' | 'update' | 'dataset' | 'replace';
        record: Model;
        records: Model[];
        changes: object;
    }) => void) | string;
    onDateRangeChange?: ((event: {
        source: TimelineBase;
        old: {
            startDate: Date;
            endDate: Date;
        };
        new: {
            startDate: Date;
            endDate: Date;
        };
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onDirtyStateChange?: ((event: {
        source: Container;
        dirty: boolean;
    }) => void) | string;
    onDragSelecting?: ((event: {
        source: Grid;
        selectedCells: GridLocationConfig[] | GridLocation[];
        selectedRecords: Model[];
    }) => void) | string;
    onElementCreated?: ((event: {
        element: HTMLElement;
    }) => void) | string;
    onExpand?: ((event: {
        source: Panel;
    }) => void) | string;
    onExpandNode?: ((event: {
        source: Grid;
        record: Model;
    }) => void) | string;
    onFileDrop?: ((event: {
        source: Grid;
        file: DataTransferItem;
        domEvent: DragEvent;
    }) => void) | string;
    onFillHandleBeforeDragFinalize?: ((event: {
        from: GridLocation;
        to: GridLocation;
        domEvent: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onFillHandleDrag?: ((event: {
        from: GridLocation;
        to: GridLocation;
        domEvent: MouseEvent;
    }) => void) | string;
    onFillHandleDragAbort?: (() => void) | string;
    onFillHandleDragEnd?: ((event: {
        from: GridLocation;
        to: GridLocation;
        domEvent: MouseEvent;
    }) => void) | string;
    onFillHandleDragStart?: ((event: {
        cell: GridLocation;
        domEvent: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onFinishCellEdit?: ((event: {
        grid: Grid;
        editorContext: CellEditorContext;
    }) => void) | string;
    onFinishRowEdit?: ((event: {
        grid: Grid;
        editorContext: RowEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onFocusIn?: ((event: {
        source: Widget;
        fromElement: HTMLElement;
        toElement: HTMLElement;
        fromWidget: Widget;
        toWidget: Widget;
        backwards: boolean;
    }) => void) | string;
    onFocusOut?: ((event: {
        source: Widget;
        fromElement: HTMLElement;
        toElement: HTMLElement;
        fromWidget: Widget;
        toWidget: Widget;
        backwards: boolean;
    }) => void) | string;
    onGridRowBeforeDragStart?: ((event: {
        source: GridBase;
        context: {
            records: Model[];
        };
        event: MouseEvent | TouchEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onGridRowBeforeDropFinalize?: ((event: {
        source: GridBase;
        context: {
            valid: boolean;
            insertBefore: Model;
            parent: Model;
            records: Model[];
            oldPositionContext: RecordPositionContext[];
        };
        event: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onGridRowDrag?: ((event: {
        source: GridBase;
        context: {
            valid: boolean;
            insertBefore: Model;
            parent: Model;
            records: Model[];
        };
        event: MouseEvent;
    }) => void) | string;
    onGridRowDragAbort?: ((event: {
        source: GridBase;
        context: {
            records: Model[];
        };
        event: MouseEvent;
    }) => void) | string;
    onGridRowDragStart?: ((event: {
        source: GridBase;
        context: {
            records: Model[];
        };
        event: MouseEvent | TouchEvent;
    }) => void) | string;
    onGridRowDrop?: ((event: {
        source: GridBase;
        context: {
            valid: boolean;
            insertBefore: Model;
            parent: Model;
            records: Model[];
            oldPositionContext: RecordPositionContext[];
        };
        event: MouseEvent;
    }) => void) | string;
    onHeaderClick?: ((event: {
        domEvent: Event;
        column: Column;
    }) => Promise<boolean> | boolean | void) | string;
    onHeaderMenuBeforeShow?: ((event: {
        source: Grid;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
    }) => Promise<boolean> | boolean | void) | string;
    onHeaderMenuItem?: ((event: {
        source: Grid;
        menu: Menu;
        item: MenuItem;
        column: Column;
    }) => void) | string;
    onHeaderMenuShow?: ((event: {
        source: Grid;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
    }) => void) | string;
    onHeaderMenuToggleItem?: ((event: {
        source: Grid;
        menu: Menu;
        item: MenuItem;
        column: Column;
        checked: boolean;
    }) => void) | string;
    onHide?: ((event: {
        source: Widget;
    }) => void) | string;
    onHistogramDataCacheSet?: ((event: {
        source: TimelineHistogram;
        record: Model;
        data: object;
    }) => void) | string;
    onLockRows?: ((event: {
        clone: GridBase;
    }) => void) | string;
    onMouseOut?: ((event: {
        event: MouseEvent;
    }) => void) | string;
    onMouseOver?: ((event: {
        event: MouseEvent;
    }) => void) | string;
    onNoZoomChange?: ((event: {
        currentZoomLevel: number;
        startDate: Date;
        endDate: Date;
    }) => void) | string;
    onPaint?: ((event: {
        source: Widget;
        firstPaint: boolean;
    }) => void) | string;
    onPaste?: ((event: {
        source: Grid;
        clipboardData: string;
        modifiedRecords: Model[];
        targetCell: GridLocation;
        entityName: string;
    }) => void) | string;
    onPdfExport?: ((event: {
        response?: any;
        error?: Error;
    }) => void) | string;
    onPresetChange?: ((event: {
        source: Scheduler;
        startDate: Date;
        centerDate: Date;
        endDate: Date;
        from: ViewPreset;
        to: ViewPreset;
    }) => Promise<boolean> | boolean | void) | string;
    onReadOnly?: ((event: {
        readOnly: boolean;
    }) => void) | string;
    onRecompose?: (() => void) | string;
    onRenderRow?: ((event: {
        source: Grid;
        row: Row;
        record: Model;
        recordIndex: number;
    }) => void) | string;
    onRenderRows?: ((event: {
        source: Grid;
    }) => void) | string;
    onResize?: ((event: {
        source: Widget;
        width: number;
        height: number;
        oldWidth: number;
        oldHeight: number;
    }) => void) | string;
    onResourceMenuBeforeShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
        resourceRecord: SchedulerResourceModel;
    }) => Promise<boolean> | boolean | void) | string;
    onResourceMenuItem?: ((event: {
        source: Scheduler;
        menu: Menu;
        item: MenuItem;
        record: SchedulerResourceModel;
    }) => void) | string;
    onResourceMenuShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        record: SchedulerResourceModel;
    }) => void) | string;
    onResourceMenuToggleItem?: ((event: {
        source: Scheduler;
        menu: Menu;
        item: MenuItem;
        resourceRecord: SchedulerResourceModel;
        checked: boolean;
    }) => void) | string;
    onResourceTimeRangeClick?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeContextMenu?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeDblClick?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeMouseDown?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeMouseOut?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeMouseOver?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResourceTimeRangeMouseUp?: ((event: {
        source: Scheduler;
        feature: ResourceTimeRanges;
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onResponsive?: ((event: {
        grid: Grid;
        level: string;
        width: number;
        oldLevel: string;
        oldWidth: number;
    }) => void) | string;
    onRowCollapse?: ((event: {
        record: Model;
    }) => void) | string;
    onRowExpand?: ((event: {
        record: Model;
        expandedElements: object;
        widget: Widget;
        widgets: object;
    }) => void) | string;
    onRowMouseEnter?: ((event: {
        source: Grid;
        record: Model;
        column: Column;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onRowMouseLeave?: ((event: {
        source: Grid;
        record: Model;
        cellElement: HTMLElement;
        event: MouseEvent;
    }) => void) | string;
    onScroll?: ((event: {
        source: Grid;
        scrollTop: number;
    }) => void) | string;
    onSelectionChange?: ((event: {
        action: 'select' | 'deselect';
        mode: 'row' | 'cell';
        source: Grid;
        deselected: Model[];
        selected: Model[];
        selection: Model[];
        deselectedCells: GridLocation[];
        selectedCells: GridLocation[];
        cellSelection: GridLocation[];
    }) => void) | string;
    onSelectionModeChange?: ((event: {
        selectionMode: object;
    }) => void) | string;
    onShow?: ((event: {
        source: Widget;
    }) => void) | string;
    onSplit?: ((event: {
        subViews: GridBase[];
        options: {
            direction: 'horizontal' | 'vertical' | 'both';
            atColumn: Column;
            atRecord: Model;
        };
    }) => void) | string;
    onSplitterCollapseClick?: ((event: {
        source: Grid;
        subGrid: SubGrid;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onSplitterDragEnd?: ((event: {
        source: Grid;
        subGrid: SubGrid;
        domEvent: Event;
    }) => void) | string;
    onSplitterDragStart?: ((event: {
        source: Grid;
        subGrid: SubGrid;
        domEvent: Event;
    }) => void) | string;
    onSplitterExpandClick?: ((event: {
        source: Grid;
        subGrid: SubGrid;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onStartCellEdit?: ((event: {
        source: Grid;
        editorContext: CellEditorContext;
    }) => void) | string;
    onStartRowEdit?: ((event: {
        source: Grid;
        editorContext: RowEditorContext;
    }) => void) | string;
    onSubGridCollapse?: ((event: {
        source: Grid;
        subGrid: SubGrid;
    }) => void) | string;
    onSubGridExpand?: ((event: {
        source: Grid;
        subGrid: SubGrid;
    }) => void) | string;
    onTickSizeChange?: ((event: {
        source: Scheduler;
        tickSize: number;
    }) => void) | string;
    onTimeAxisChange?: ((event: {
        source: Scheduler;
        config: {
            startDate: Date;
            endDate: Date;
        };
    }) => void) | string;
    onTimeAxisHeaderClick?: ((event: {
        source: SchedulerTimeAxisColumn | VerticalTimeAxisColumn;
        startDate: Date;
        endDate: Date;
        event: Event;
    }) => void) | string;
    onTimeAxisHeaderContextMenu?: ((event: {
        source: SchedulerTimeAxisColumn | VerticalTimeAxisColumn;
        startDate: Date;
        endDate: Date;
        event: Event;
    }) => void) | string;
    onTimeAxisHeaderDblClick?: ((event: {
        source: SchedulerTimeAxisColumn | VerticalTimeAxisColumn;
        startDate: Date;
        endDate: Date;
        event: Event;
    }) => void) | string;
    onTimeAxisHeaderMenuBeforeShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
    }) => Promise<boolean> | boolean | void) | string;
    onTimeAxisHeaderMenuItem?: ((event: {
        source: Scheduler;
        menu: Menu;
        item: MenuItem;
        column: Column;
    }) => void) | string;
    onTimeAxisHeaderMenuShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        items: Record<string, MenuItemConfig>;
        column: Column;
    }) => void) | string;
    onTimelineContextChange?: ((event: {
        oldContext: TimelineContext;
        context: TimelineContext;
    }) => void) | string;
    onTimelineViewportResize?: ((event: {
        source: Widget;
        width: number;
        height: number;
        oldWidth: number;
        oldHeight: number;
    }) => void) | string;
    onTimeRangeHeaderClick?: ((event: {
        source: Scheduler;
        timeRangeRecord: TimeSpan;
        domEvent: MouseEvent;
    }) => void) | string;
    onTimeRangeHeaderContextMenu?: ((event: {
        source: Scheduler;
        timeRangeRecord: TimeSpan;
        domEvent: MouseEvent;
    }) => void) | string;
    onTimeRangeHeaderDblClick?: ((event: {
        source: Scheduler;
        timeRangeRecord: TimeSpan;
        domEvent: MouseEvent;
    }) => void) | string;
    onToggleGroup?: ((event: {
        groupRecord: Model;
        groupRecords: Model[];
        collapse: boolean;
        allRecords?: boolean;
    }) => void) | string;
    onToggleNode?: ((event: {
        record: Model;
        collapse: boolean;
    }) => void) | string;
    onToolClick?: ((event: {
        source: Tool;
        tool: Tool;
    }) => void) | string;
    onUnlockRows?: ((event: {
        clone: GridBase;
    }) => void) | string;
    onUnsplit?: (() => void) | string;
    onVisibleDateRangeChange?: ((event: {
        source: Scheduler;
        old: {
            startDate: Date;
            endDate: Date;
        };
        new: {
            startDate: Date;
            endDate: Date;
        };
    }) => void) | string;
    aiFilterFeature?: object | boolean | string | AIFilter | AIFilterConfig;
    cellCopyPasteFeature?: object | boolean | string | CellCopyPaste | CellCopyPasteConfig;
    cellEditFeature?: object | boolean | string | GridCellEdit | GridCellEditConfig;
    cellMenuFeature?: object | boolean | string | CellMenu | CellMenuConfig;
    cellTooltipFeature?: object | boolean | string | CellTooltip | CellTooltipConfig;
    chartsFeature?: object | boolean | string | Charts | ChartsConfig;
    columnAutoWidthFeature?: object | boolean | string | ColumnAutoWidth | ColumnAutoWidthConfig;
    columnDragToolbarFeature?: object | boolean | string | ColumnDragToolbar | ColumnDragToolbarConfig;
    columnLinesFeature?: object | boolean | string | ColumnLines | ColumnLinesConfig;
    columnPickerFeature?: object | boolean | string | ColumnPicker | ColumnPickerConfig;
    columnRenameFeature?: object | boolean | string | ColumnRename | ColumnRenameConfig;
    columnReorderFeature?: object | boolean | string | ColumnReorder | ColumnReorderConfig;
    columnResizeFeature?: object | boolean | string | ColumnResize | ColumnResizeConfig;
    excelExporterFeature?: object | boolean | string | GridExcelExporter | GridExcelExporterConfig;
    fileDropFeature?: object | boolean | string | FileDrop | FileDropConfig;
    fillHandleFeature?: object | boolean | string | FillHandle | FillHandleConfig;
    filterFeature?: object | boolean | string | Filter | FilterConfig;
    filterBarFeature?: object | boolean | string | FilterBar | FilterBarConfig;
    groupFeature?: object | boolean | string | Group | GroupConfig;
    groupSummaryFeature?: object | boolean | string | GroupSummary | GroupSummaryConfig;
    headerMenuFeature?: object | boolean | string | HeaderMenu | HeaderMenuConfig;
    headerZoomFeature?: object | boolean | string | HeaderZoom | HeaderZoomConfig;
    lockRowsFeature?: object | boolean | string | GridLockRows | GridLockRowsConfig;
    mergeCellsFeature?: object | boolean | string | MergeCells | MergeCellsConfig;
    nonWorkingTimeFeature?: object | boolean | string | NonWorkingTime | NonWorkingTimeConfig;
    panFeature?: object | boolean | string | Pan | PanConfig;
    pdfExportFeature?: object | boolean | string | GridPdfExport | GridPdfExportConfig;
    pinColumnsFeature?: object | boolean | string | PinColumns | PinColumnsConfig;
    printFeature?: object | boolean | string | GridPrint | GridPrintConfig;
    quickFindFeature?: object | boolean | string | QuickFind | QuickFindConfig;
    regionResizeFeature?: object | boolean | string | RegionResize | RegionResizeConfig;
    resourceMenuFeature?: object | boolean | string | ResourceMenu | ResourceMenuConfig;
    resourceTimeRangesFeature?: object | boolean | string | ResourceTimeRanges | ResourceTimeRangesConfig;
    rowCopyPasteFeature?: object | boolean | string | RowCopyPaste | RowCopyPasteConfig;
    rowEditFeature?: object | boolean | string | RowEdit | RowEditConfig;
    rowExpanderFeature?: object | boolean | string | RowExpander | RowExpanderConfig;
    rowReorderFeature?: object | boolean | string | RowReorder | RowReorderConfig;
    rowResizeFeature?: object | boolean | string | GridRowResize | GridRowResizeConfig;
    scheduleTooltipFeature?: object | boolean | string | ScheduleTooltip | ScheduleTooltipConfig;
    searchFeature?: object | boolean | string | Search | SearchConfig;
    sortFeature?: object | boolean | string | Sort | SortConfig;
    splitFeature?: object | boolean | string | Split | SplitConfig;
    stickyCellsFeature?: object | boolean | string | StickyCells | StickyCellsConfig;
    stripeFeature?: object | boolean | string | Stripe | StripeConfig;
    summaryFeature?: object | boolean | string | SchedulerSummary | SchedulerSummaryConfig;
    timeAxisHeaderMenuFeature?: object | boolean | string | TimeAxisHeaderMenu | TimeAxisHeaderMenuConfig;
    timeRangesFeature?: object | boolean | string | TimeRanges | TimeRangesConfig;
    treeFeature?: object | boolean | string | Tree | TreeConfig;
    treeGroupFeature?: object | boolean | string | GridTreeGroup | GridTreeGroupConfig;
};
export declare class BryntumTimelineHistogram extends React.Component<BryntumTimelineHistogramProps> {
    static instanceClass: typeof TimelineHistogram;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static isView: boolean;
    portalsCache?: HTMLElement;
    portalContainerClass: string;
    state: {
        portals: Map<any, any>;
        generation: number;
    };
    static featureNames: string[];
    projectStores: boolean;
    dataStores: {
        originalStore: string;
    };
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: TimelineHistogram;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumTimelineHistogramProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
