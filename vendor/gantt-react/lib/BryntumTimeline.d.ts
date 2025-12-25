import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, Base, CellCopyPaste, CellCopyPasteConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnLines, ColumnLinesConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, CrudManager, CrudManagerConfig, DateConstraint, DependencyBaseModel, DependencyMenu, DependencyMenuConfig, DependencyStoreConfig, DomClassList, DomConfig, DropData, DurationConfig, DurationUnit, EmptyTextDomConfig, EventColor, EventCopyPaste, EventCopyPasteConfig, EventDrag, EventDragConfig, EventDragCreate, EventDragCreateConfig, EventDragSelect, EventDragSelectConfig, EventEdit, EventEditConfig, EventFilter, EventFilterConfig, EventMenu, EventMenuConfig, EventNonWorkingTime, EventNonWorkingTimeConfig, EventResizeData, EventTooltip, EventTooltipConfig, ExcelExporter, ExcelExporterConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Grid, GridBase, GridCellEdit, GridCellEditConfig, GridColumnConfig, GridLocation, GridLocationConfig, GridSelectionMode, GridTreeGroup, GridTreeGroupConfig, Group, GroupConfig, GroupSummary, GroupSummaryConfig, HeaderMenu, HeaderMenuConfig, HeaderZoom, HeaderZoomConfig, KeyMapConfig, LockRows, LockRowsConfig, Mask, MaskConfig, Menu, MenuConfig, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, NonWorkingTime, NonWorkingTimeConfig, PagingToolbarConfig, Pan, PanConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PinColumns, PinColumnsConfig, Popup, PreserveScrollOptions, ProjectModelConfig, QuickFind, QuickFindConfig, RecordPositionContext, Rectangle, RecurrenceConfirmationPopup, RecurrenceConfirmationPopupConfig, RegionResize, RegionResizeConfig, ResourceHeaderConfig, ResourceMarginConfig, ResourceMenu, ResourceMenuConfig, ResourceTimeRangeModel, ResourceTimeRangeModelConfig, ResourceTimeRangeStore, ResourceTimeRangeStoreConfig, ResourceTimeRanges, ResourceTimeRangesConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, RowReorder, RowReorderConfig, RowResize, RowResizeConfig, ScheduleContext, ScheduleContextConfig, ScheduleMenu, ScheduleMenuConfig, ScheduleTooltip, ScheduleTooltipConfig, Scheduler, SchedulerAssignmentModel, SchedulerAssignmentModelConfig, SchedulerAssignmentStore, SchedulerAssignmentStoreConfig, SchedulerBase, SchedulerDependencies, SchedulerDependenciesConfig, SchedulerDependencyEdit, SchedulerDependencyEditConfig, SchedulerDependencyModel, SchedulerDependencyModelConfig, SchedulerDependencyStore, SchedulerEventModel, SchedulerEventModelConfig, SchedulerEventResize, SchedulerEventResizeConfig, SchedulerEventStore, SchedulerEventStoreConfig, SchedulerLabels, SchedulerLabelsConfig, SchedulerPdfExport, SchedulerPdfExportConfig, SchedulerPrint, SchedulerPrintConfig, SchedulerProProjectModel, SchedulerResourceModel, SchedulerResourceModelConfig, SchedulerResourceStore, SchedulerResourceStoreConfig, SchedulerScrollButtons, SchedulerScrollButtonsConfig, SchedulerStateInfo, SchedulerSummary, SchedulerSummaryConfig, SchedulerTimeAxisColumn, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, SimpleEventEdit, SimpleEventEditConfig, Sort, SortConfig, Split, SplitConfig, StateProvider, StickyCells, StickyCellsConfig, StickyEvents, StickyEventsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, TabConfig, TimeAxis, TimeAxisConfig, TimeAxisHeaderMenu, TimeAxisHeaderMenuConfig, TimeRanges, TimeRangesConfig, TimeSelection, TimeSelectionConfig, TimeSpan, TimeSpanConfig, Timeline, TimelineBase, TimelineContext, TimelineListeners, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, Tree, TreeConfig, TreeSummary, TreeSummaryConfig, VerticalTimeAxisColumn, VerticalTimeAxisColumnConfig, ViewPreset, ViewPresetConfig, VisibleDate, Widget, XLSColumn } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumTimelineProps = {
    adopt?: HTMLElement | string;
    alignSelf?: string;
    allowCreate?: boolean;
    allowCreateOnlyParent?: boolean;
    allowDropOnEventBar?: boolean;
    allowOverlap?: boolean;
    animateFilterRemovals?: boolean;
    animateRemovingRows?: boolean;
    animateTreeNodeToggle?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    assignments?: SchedulerAssignmentModel[] | object[] | SchedulerAssignmentModelConfig[];
    assignmentStore?: SchedulerAssignmentStore | SchedulerAssignmentStoreConfig;
    autoAdjustTimeAxis?: boolean;
    autoCreate?: boolean | string | {
        autoCreate: {
            gesture?: 'click' | 'dblclick';
            useEventModelDefaults?: boolean;
            snapType?: 'round' | 'ceil' | 'floor';
            step?: DurationConfig | string;
            duration?: DurationConfig | string;
            name?: string;
        };
    };
    autoHeight?: boolean;
    barMargin?: number;
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
    creationTooltip?: TooltipConfig;
    creationTooltipTemplate?: (data: {
        source: TimeSpan;
        target: TimeSpan;
        fromSide: string;
        toSide: string;
        valid: boolean;
    }) => string | DomConfig;
    crudManager?: CrudManagerConfig | CrudManager;
    crudManagerClass?: typeof CrudManager;
    data?: object[] | Model[] | ModelConfig[];
    dataField?: string;
    dataset?: Record<string, string>;
    date?: Date;
    dateFormat?: string | ((date: Date) => string);
    dateSeparator?: string;
    defaultRegion?: string;
    defaultResourceImageName?: string;
    dependencies?: SchedulerDependencyModel[] | SchedulerDependencyModelConfig[];
    dependencyStore?: SchedulerDependencyStore | DependencyStoreConfig;
    descriptionFormat?: string | string[] | boolean[] | ((date: Date) => string) | Function[];
    descriptionRenderer?: (view: Widget) => string;
    deselectAllOnScheduleClick?: boolean;
    deselectOnClick?: boolean;
    destroyStore?: boolean;
    destroyStores?: boolean;
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
    enableDeleteKey?: boolean;
    enableEventAnimations?: boolean;
    enableRecurringEvents?: boolean | {
        defaultAction?: 'single' | 'future';
    };
    enableSticky?: boolean;
    enableTextSelection?: boolean;
    enableTransactionalFeatures?: boolean;
    enableUndoRedoKeys?: boolean;
    endDate?: Date | string;
    endParamName?: string;
    eventBarTextField?: string;
    eventColor?: EventColor;
    eventLayout?: 'stack' | 'pack' | 'mixed' | 'none' | {
        type?: 'stack' | 'pack' | 'mixed' | 'none';
    };
    eventReleaseThreshold?: number;
    eventRenderer?: (detail: {
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        scheduler: Scheduler;
        renderData: {
            event: SchedulerEventModel;
            cls: DomClassList | string;
            wrapperCls: DomClassList | string;
            iconCls: DomClassList | string;
            left: number;
            width: number;
            height: number;
            style: string | Record<string, string>;
            wrapperStyle: string | Record<string, string>;
            eventStyle: 'tonal' | 'filled' | 'bordered' | 'traced' | 'outlined' | 'indented' | 'line' | 'dashed' | 'minimal' | 'rounded' | 'calendar' | 'interday' | 'gantt' | null;
            eventColor: string;
            ariaLabel: string;
            children: DomConfig[];
        };
    }) => string | DomConfig | DomConfig[];
    eventRendererThisObj?: object;
    events?: SchedulerEventModel[] | SchedulerEventModelConfig[];
    eventSelectionDisabled?: boolean;
    eventStore?: SchedulerEventStore | SchedulerEventStoreConfig;
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
    getDateConstraints?: (resourceRecord?: SchedulerResourceModel, eventRecord?: SchedulerEventModel) => DateConstraint;
    getRowHeight?: (getRowHeight: {
        record: SchedulerResourceModel;
    }) => number;
    header?: string | boolean | PanelHeader;
    height?: string | number;
    hidden?: boolean;
    hideFooters?: boolean;
    hideHeaders?: boolean;
    hideHorizontalScrollbar?: boolean;
    hideRowHover?: boolean;
    highlightPredecessors?: boolean;
    highlightSuccessors?: boolean;
    hoverCls?: string;
    icon?: string | DomConfig;
    id?: string;
    ignoreDomEventsWhileScrolling?: boolean;
    ignoreParentReadOnly?: boolean;
    infiniteScroll?: boolean;
    initialAnimationDuration?: number;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    isEventSelectable?: (event: SchedulerEventModel) => boolean;
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    lazyLoadingIndicator?: boolean;
    listeners?: TimelineListeners;
    listRangeMenu?: MenuConfig;
    loadMask?: string | MaskConfig | null;
    loadMaskDefaults?: MaskConfig;
    loadMaskError?: MaskConfig | Mask | boolean;
    localizable?: boolean;
    longPressTime?: number;
    maintainSelectionOnDatasetChange?: boolean;
    managedEventSizing?: boolean;
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxDate?: Date | string;
    maxHeight?: string | number;
    maxTimeAxisUnit?: DurationUnit;
    maxWidth?: string | number;
    maxZoomLevel?: number;
    milestoneAlign?: 'start' | 'center' | 'end';
    milestoneCharWidth?: number;
    milestoneLayoutMode?: 'default' | 'estimate' | 'data' | 'measure';
    milestoneTextPosition?: 'inside' | 'outside' | 'always-outside';
    minDate?: Date | string;
    minHeight?: string | number;
    minPackSize?: number;
    minWidth?: string | number;
    minZoomLevel?: number;
    mode?: 'horizontal' | 'vertical';
    monitorResize?: boolean;
    multiEventSelect?: boolean | {
        ctrlKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
    };
    narrowEventWidth?: number;
    overlappingEventSorter?: (a: SchedulerEventModel, b: SchedulerEventModel) => number;
    owner?: Widget | any;
    partner?: TimelineBase;
    passStartEndParameters?: boolean;
    plugins?: Function[];
    preCalculateHeightLimit?: number;
    preserveFocusOnDatasetChange?: boolean;
    preserveScroll?: PreserveScrollOptions | boolean;
    preserveScrollOnDatasetChange?: boolean;
    presets?: ViewPresetConfig[];
    preventTooltipOnTouch?: boolean;
    project?: SchedulerProProjectModel | ProjectModelConfig | RefObject<any>;
    range?: string | DurationConfig;
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
    resourceColumns?: ResourceHeaderConfig;
    resourceImageExtension?: string;
    resourceImagePath?: string;
    resourceImages?: {
        path?: string;
        extension?: string;
    };
    resourceMargin?: number | ResourceMarginConfig;
    resources?: SchedulerResourceModel[] | SchedulerResourceModelConfig[];
    resourceStore?: SchedulerResourceStore | SchedulerResourceStoreConfig;
    resourceTimeRangeRenderer?: (detail: {
        resourceTimeRangeRecord: ResourceTimeRangeModel;
        resourceRecord: SchedulerResourceModel;
        renderData: object;
    }) => string | DomConfig | DomConfig[];
    resourceTimeRanges?: ResourceTimeRangeModel[] | ResourceTimeRangeModelConfig[];
    resourceTimeRangeStore?: ResourceTimeRangeStore | ResourceTimeRangeStoreConfig;
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
    scrollable?: boolean | ScrollerConfig | Scroller;
    scrollerClass?: typeof Scroller;
    scrollExtensionThreshold?: string | DurationConfig;
    scrollManager?: ScrollManagerConfig | ScrollManager;
    selectionMode?: GridSelectionMode;
    selectResourceOnEventNavigate?: boolean;
    selectResourceOnScheduleClick?: boolean;
    shiftIncrement?: string | DurationConfig;
    showCreationTooltip?: boolean;
    showDirty?: boolean | {
        duringEdit?: boolean;
        newRecord?: boolean;
    };
    showEventColorPickers?: boolean;
    showLagInTooltip?: boolean;
    showRecurringUI?: boolean;
    showTooltip?: boolean;
    snap?: boolean;
    snapRelativeToEventStartDate?: boolean;
    span?: number;
    startDate?: Date | string;
    startParamName?: string;
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
    terminalCls?: string;
    terminalHideDelay?: number;
    terminalOffset?: number;
    terminalShowDelay?: number;
    terminalSides?: string[];
    terminalSize?: number | string;
    tickSize?: number;
    timeAxis?: TimeAxisConfig | TimeAxis;
    timeRanges?: TimeSpan[] | TimeSpanConfig[];
    timeRangeStore?: Store | StoreConfig;
    timeResolution?: {
        increment?: number;
        unit?: DurationUnit;
    } | number;
    title?: string;
    tools?: Record<string, ToolConfig> | null;
    tooltipTemplate?: (dependency: DependencyBaseModel) => string | DomConfig;
    transition?: {
        insertRecord?: boolean;
        removeRecord?: boolean;
        toggleColumn?: boolean;
        expandCollapseColumn?: boolean;
        toggleRegion?: boolean;
        toggleTreeNode?: boolean;
        toggleGroup?: boolean;
        filterRemoval?: boolean;
        removeEvent?: boolean;
        changeEvent?: boolean;
    };
    transitionDuration?: number;
    triggerSelectionChangeOnRemove?: boolean;
    type?: 'timeline';
    ui?: 'plain' | 'toolbar' | string | object;
    updateTimelineContextOnScroll?: boolean;
    useContextualRecurrenceRules?: boolean;
    useInitialAnimation?: boolean | 'fade-in' | 'slide-from-left' | 'slide-from-top' | string;
    verticalTimeAxisColumn?: VerticalTimeAxisColumnConfig;
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
    onAfterDependencyCreateDrop?: ((event: {
        source: TimeSpan;
        target: TimeSpan;
        dependency: DependencyBaseModel;
    }) => void) | string;
    onAfterDependencySave?: ((event: {
        source: Scheduler;
        dependencyRecord: SchedulerDependencyModel;
    }) => void) | string;
    onAfterDragCreate?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
    }) => void) | string;
    onAfterEventDragSelect?: ((event: {
        source: SchedulerBase;
    }) => void) | string;
    onAfterEventDrop?: ((event: {
        source: Scheduler;
        assignmentRecords: SchedulerAssignmentModel[];
        eventRecords: SchedulerEventModel[];
        valid: boolean;
        context: object;
        domEvent: MouseEvent;
    }) => void) | string;
    onAfterEventEdit?: ((event: {
        source: Scheduler;
        action: 'save' | 'delete' | 'cancel';
        eventEdit: EventEdit;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
        editor: Popup;
    }) => void) | string;
    onAfterEventSave?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
    }) => void) | string;
    onAssignmentSelectionChange?: ((event: {
        action: 'select' | 'deselect' | 'update' | 'clear';
        selected: SchedulerAssignmentModel[];
        deselected: SchedulerAssignmentModel[];
        selection: SchedulerAssignmentModel[];
    }) => void) | string;
    onBeforeAssignmentDelete?: ((event: {
        source: Scheduler;
        assignmentRecords: SchedulerAssignmentModel[];
        context: {
            finalize: {
                removeRecords?: boolean;
            };
        };
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeAssignmentSelectionChange?: ((event: {
        action: string;
        selected: SchedulerEventModel[];
        deselected: SchedulerEventModel[];
        selection: SchedulerEventModel[];
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeAutoCreate?: ((event: {
        domEvent: Event;
        date: Date;
        resourceRecord: SchedulerResourceModel;
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
    onBeforeContextShow?: ((event: {
        source: ScheduleContext;
        context: TimelineContext;
        element: HTMLElement;
        position: {
            width: number;
            height: number;
            x: number;
            y: number;
        };
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
    onBeforeDependencyAdd?: ((event: {
        source: Scheduler;
        dependencyEdit: SchedulerDependencyEdit;
        dependencyRecord: SchedulerDependencyModel;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDependencyCreateDrag?: ((event: {
        source: TimeSpan;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDependencyCreateFinalize?: ((event: {
        source: TimeSpan;
        target: TimeSpan;
        fromSide: 'start' | 'end' | 'top' | 'bottom';
        toSide: 'start' | 'end' | 'top' | 'bottom';
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDependencyDelete?: ((event: {
        source: Scheduler;
        dependencyRecord: SchedulerDependencyModel;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDependencyEdit?: ((event: {
        source: Scheduler;
        dependencyEdit: SchedulerDependencyEdit;
        dependencyRecord: SchedulerDependencyModel;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDependencyEditShow?: ((event: {
        source: Scheduler;
        dependencyEdit: SchedulerDependencyEdit;
        dependencyRecord: SchedulerDependencyModel;
        editor: Popup;
    }) => void) | string;
    onBeforeDependencySave?: ((event: {
        source: Scheduler;
        dependencyRecord: SchedulerDependencyModel;
        values: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onBeforeDragCreate?: ((event: {
        source: Scheduler;
        resourceRecord: SchedulerResourceModel;
        date: Date;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeDragCreateFinalize?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
        context: {
            startDate: Date;
            endDate: Date;
            async: boolean;
            finalize: Function;
        };
    }) => void) | string;
    onBeforeEventAdd?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecords: SchedulerResourceModel[];
        assignmentRecords: SchedulerAssignmentModel[];
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventDelete?: ((event: {
        source: Scheduler | any;
        eventRecords: SchedulerEventModel[];
        context: {
            finalize: {
                removeRecords?: boolean;
            };
        };
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventDrag?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        domEvent: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventDragSelect?: ((event: {
        source: SchedulerBase;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventDropFinalize?: ((event: {
        source: Scheduler;
        context: {
            dropData: DropData;
            async: boolean;
            eventRecords: SchedulerEventModel[];
            assignmentRecords: SchedulerAssignmentModel[];
            targetEventRecord: SchedulerEventModel;
            newResource: SchedulerResourceModel;
            valid: boolean;
            finalize: Function;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onBeforeEventEdit?: ((event: {
        source: Scheduler;
        eventEdit: EventEdit;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventEditShow?: ((event: {
        source: Scheduler;
        eventEdit: EventEdit;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
        editor: Popup;
    }) => void) | string;
    onBeforeEventResize?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventResizeFinalize?: ((event: {
        source: Scheduler;
        context: object;
        eventRecord: SchedulerEventModel;
        startDate: Date;
        endDate: Date;
        originalStartDate: Date;
        originalEndDate: Date;
        async: boolean;
        finalize: Function;
        event: Event;
        resizeData: EventResizeData[];
    }) => Promise<void>) | string;
    onBeforeEventSave?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecords: SchedulerResourceModel[];
        values: object;
        context: {
            async?: boolean;
            finalize: Function;
        };
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventSelectionChange?: ((event: {
        action: string;
        selected: SchedulerEventModel[];
        deselected: SchedulerEventModel[];
        selection: SchedulerEventModel[];
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
    onBeforeSelectedContextsShow?: ((event: {
        source: ScheduleContext;
        selectedContexts: TimelineContext[];
        domConfig: DomConfig;
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
    onBeforeShowTerminals?: ((event: {
        source: TimeSpan;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStartRowEdit?: ((event: {
        source: Grid;
        editorContext: RowEditorContext;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateApply?: ((event: {
        state: SchedulerStateInfo;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateSave?: ((event: {
        state: SchedulerStateInfo;
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
    onDependenciesDrawn?: (() => void) | string;
    onDependencyClick?: ((event: {
        source: Scheduler;
        dependency: SchedulerDependencyModel;
        event: MouseEvent;
    }) => void) | string;
    onDependencyContextMenu?: ((event: {
        source: Scheduler;
        dependency: SchedulerDependencyModel;
        event: MouseEvent;
    }) => void) | string;
    onDependencyCreateDragStart?: ((event: {
        source: TimeSpan;
    }) => void) | string;
    onDependencyCreateDrop?: ((event: {
        source: TimeSpan;
        target: TimeSpan;
        dependency: DependencyBaseModel;
    }) => void) | string;
    onDependencyDblClick?: ((event: {
        source: Scheduler;
        dependency: SchedulerDependencyModel;
        event: MouseEvent;
    }) => void) | string;
    onDependencyMenuBeforeShow?: ((event: {
        source: Scheduler;
        items: Record<string, MenuItemConfig>;
        dependencyRecord: SchedulerDependencyModel;
        element: HTMLElement;
        event?: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onDependencyMenuItem?: ((event: {
        source: Scheduler;
        dependencyRecord: SchedulerDependencyModel;
        item: MenuItem;
        element: HTMLElement;
    }) => void) | string;
    onDependencyMenuShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        dependencyRecord: SchedulerDependencyModel;
        element: HTMLElement;
    }) => void) | string;
    onDependencyMouseOut?: ((event: {
        source: Scheduler;
        dependency: SchedulerDependencyModel;
        event: MouseEvent;
    }) => void) | string;
    onDependencyMouseOver?: ((event: {
        source: Scheduler;
        dependency: SchedulerDependencyModel;
        event: MouseEvent;
    }) => void) | string;
    onDependencyValidationComplete?: ((event: {
        source: TimeSpan;
        target: TimeSpan;
        dependencyType: number;
    }) => void) | string;
    onDependencyValidationStart?: ((event: {
        source: TimeSpan;
        target: TimeSpan;
        dependencyType: number;
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onDirtyStateChange?: ((event: {
        source: Container;
        dirty: boolean;
    }) => void) | string;
    onDragCreateEnd?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
        eventElement: HTMLElement;
    }) => void) | string;
    onDragCreateStart?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        eventElement: HTMLElement;
    }) => void) | string;
    onDragSelecting?: ((event: {
        source: Grid;
        selectedCells: GridLocationConfig[] | GridLocation[];
        selectedRecords: Model[];
    }) => void) | string;
    onElementCreated?: ((event: {
        element: HTMLElement;
    }) => void) | string;
    onEventAutoCreated?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
    }) => void) | string;
    onEventClick?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventContextMenu?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventDblClick?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventDrag?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        newResource: SchedulerResourceModel;
        context: {
            valid: boolean;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onEventDragAbort?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        domEvent: MouseEvent;
    }) => void) | string;
    onEventDragModeChange?: ((event: {
        mode: string;
    }) => void) | string;
    onEventDragReset?: ((event: {
        source: Scheduler;
    }) => void) | string;
    onEventDragSelect?: ((event: {
        source: SchedulerBase;
        startDate: Date;
        endDate: Date;
        rectangle: Rectangle;
        selectedAssignments: SchedulerAssignmentModel[];
        selectedEvents: SchedulerEventModel[];
    }) => void) | string;
    onEventDragStart?: ((event: {
        source: Scheduler;
        resourceRecord: SchedulerResourceModel;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        domEvent: MouseEvent;
    }) => void) | string;
    onEventDrop?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        externalDropTarget: HTMLElement;
        isCopy: boolean;
        context: {
            targetEventRecord: SchedulerEventModel;
            newResource: SchedulerResourceModel;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onEventEditBeforeSetRecord?: ((event: {
        source: Container;
        record: SchedulerEventModel;
    }) => void) | string;
    onEventKeyDown?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        event: KeyboardEvent;
    }) => void) | string;
    onEventKeyUp?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        event: KeyboardEvent;
    }) => void) | string;
    onEventMenuBeforeShow?: ((event: {
        source: Scheduler;
        items: Record<string, MenuItemConfig>;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        eventElement: HTMLElement;
        event?: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onEventMenuItem?: ((event: {
        source: Scheduler;
        item: MenuItem;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        eventElement: HTMLElement;
    }) => void) | string;
    onEventMenuShow?: ((event: {
        source: Scheduler;
        menu: Menu;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        eventElement: HTMLElement;
    }) => void) | string;
    onEventMouseDown?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventMouseEnter?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventMouseLeave?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventMouseOut?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventMouseOver?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventMouseUp?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        assignmentRecord: SchedulerAssignmentModel;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onEventPartialResize?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        startDate: Date;
        endDate: Date;
        element: HTMLElement;
        resizeData: EventResizeData[];
    }) => void) | string;
    onEventResizeEnd?: ((event: {
        source: Scheduler;
        changed: boolean;
        eventRecord: SchedulerEventModel;
        resizeData: EventResizeData[];
    }) => void) | string;
    onEventResizeStart?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
        resizeData: EventResizeData[];
    }) => void) | string;
    onEventSelectionChange?: ((event: {
        action: 'select' | 'deselect' | 'update' | 'clear';
        selected: SchedulerEventModel[];
        deselected: SchedulerEventModel[];
        selection: SchedulerEventModel[];
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
    onLockRows?: ((event: {
        clone: GridBase;
    }) => void) | string;
    onMouseOut?: ((event: {
        event: MouseEvent;
    }) => void) | string;
    onMouseOver?: ((event: {
        event: MouseEvent;
    }) => void) | string;
    onNavigate?: ((event: {
        event: Event;
        item: HTMLElement | null;
        oldItem: HTMLElement | null;
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
    onPasteNotAllowed?: ((event: {
        source: Scheduler;
        eventRecords: SchedulerEventModel[];
        assignmentRecords: SchedulerAssignmentModel[];
        originalEventRecords: SchedulerEventModel[];
        originalAssignmentRecords: SchedulerAssignmentModel[];
        date: Date;
        resourceRecord: SchedulerResourceModel;
        isCut: boolean;
        entityName: string;
        reason: 'overlappingEvents' | 'resourceReadOnly';
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
    onReleaseEvent?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        renderData: object;
        element: HTMLElement;
    }) => void) | string;
    onRenderEvent?: ((event: {
        source: Scheduler;
        eventRecord: SchedulerEventModel;
        resourceRecord: SchedulerResourceModel;
        assignmentRecord: SchedulerAssignmentModel;
        renderData: object;
        isRepaint: boolean;
        isReusingElement: boolean;
        element: HTMLElement;
    }) => void) | string;
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
    onResourceHeaderClick?: ((event: {
        source: Scheduler;
        resourceRecord: SchedulerResourceModel;
        event: Event;
    }) => void) | string;
    onResourceHeaderContextmenu?: ((event: {
        source: Scheduler;
        resourceRecord: SchedulerResourceModel;
        event: Event;
    }) => void) | string;
    onResourceHeaderDblclick?: ((event: {
        source: Scheduler;
        resourceRecord: SchedulerResourceModel;
        event: Event;
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
    onScheduleClick?: ((event: {
        source: Scheduler;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleContextMenu?: ((event: {
        source: Scheduler;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleDblClick?: ((event: {
        source: Scheduler;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleMenuBeforeShow?: ((event: {
        source: Scheduler;
        items: Record<string, MenuItemConfig>;
        resourceRecord: SchedulerResourceModel;
        date: Date;
        assignmentRecord: SchedulerAssignmentModel;
        eventElement: HTMLElement;
    }) => Promise<boolean> | boolean | void) | string;
    onScheduleMenuItem?: ((event: {
        source: Scheduler;
        item: MenuItem;
        resourceRecord: SchedulerResourceModel;
        date: Date;
        element: HTMLElement;
    }) => void) | string;
    onScheduleMenuShow?: ((event: {
        source: Scheduler;
        items: Record<string, MenuItemConfig>;
        menu: Menu;
        resourceRecord: SchedulerResourceModel;
        date: Date;
        targetElement: HTMLElement;
    }) => void) | string;
    onScheduleMouseDown?: ((event: {
        source: Scheduler;
        date: Date;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleMouseEnter?: ((event: {
        source: Scheduler;
        date: Date;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleMouseLeave?: ((event: {
        source: Scheduler;
        event: MouseEvent;
    }) => void) | string;
    onScheduleMouseMove?: ((event: {
        source: Scheduler;
        date: Date;
        tick: TimeSpan;
        tickIndex: number;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScheduleMouseUp?: ((event: {
        source: Scheduler;
        date: Date;
        tickStartDate: Date;
        tickEndDate: Date;
        row: Row;
        index: number;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => void) | string;
    onScroll?: ((event: {
        source: Grid;
        scrollTop: number;
    }) => void) | string;
    onScrollButtonClick?: ((event: {
        domEvent: Event;
        resourceRecord: SchedulerResourceModel;
    }) => Promise<boolean> | boolean | void) | string;
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
    onShiftIncrementChange?: ((event: {
        source: TimelineBase;
        old?: object;
        new: object;
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
    onTickCellClick?: ((event: {
        source: Scheduler;
        feature: TreeSummary;
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onTickCellContextMenu?: ((event: {
        source: Scheduler;
        feature: TreeSummary;
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onTickCellDblClick?: ((event: {
        source: Scheduler;
        feature: TreeSummary;
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onTickCellMouseDown?: ((event: {
        source: Scheduler;
        feature: TreeSummary;
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
    }) => void) | string;
    onTickCellMouseUp?: ((event: {
        source: Scheduler;
        feature: TreeSummary;
        startDate: Date;
        endDate: Date;
        resourceRecord: SchedulerResourceModel;
        domEvent: MouseEvent;
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
    onTimeSelectionChange?: ((event: {
        source: Scheduler;
        startDate: Date;
        endDate: Date;
    }) => void) | string;
    onTimeSelectionElementClick?: ((event: {
        source: Scheduler;
        startDate: Date;
        endDate: Date;
        domEvent: Event;
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
    dependenciesFeature?: object | boolean | string | SchedulerDependencies | SchedulerDependenciesConfig;
    dependencyEditFeature?: object | boolean | string | SchedulerDependencyEdit | SchedulerDependencyEditConfig;
    dependencyMenuFeature?: object | boolean | string | DependencyMenu | DependencyMenuConfig;
    eventCopyPasteFeature?: object | boolean | string | EventCopyPaste | EventCopyPasteConfig;
    eventDragFeature?: object | boolean | string | EventDrag | EventDragConfig;
    eventDragCreateFeature?: object | boolean | string | EventDragCreate | EventDragCreateConfig;
    eventDragSelectFeature?: object | boolean | string | EventDragSelect | EventDragSelectConfig;
    eventEditFeature?: object | boolean | string | EventEdit | EventEditConfig;
    eventFilterFeature?: object | boolean | string | EventFilter | EventFilterConfig;
    eventMenuFeature?: object | boolean | string | EventMenu | EventMenuConfig;
    eventNonWorkingTimeFeature?: object | boolean | string | EventNonWorkingTime | EventNonWorkingTimeConfig;
    eventResizeFeature?: object | boolean | string | SchedulerEventResize | SchedulerEventResizeConfig;
    eventTooltipFeature?: object | boolean | string | EventTooltip | EventTooltipConfig;
    excelExporterFeature?: object | boolean | string | ExcelExporter | ExcelExporterConfig;
    fileDropFeature?: object | boolean | string | FileDrop | FileDropConfig;
    fillHandleFeature?: object | boolean | string | FillHandle | FillHandleConfig;
    filterFeature?: object | boolean | string | Filter | FilterConfig;
    filterBarFeature?: object | boolean | string | FilterBar | FilterBarConfig;
    groupFeature?: object | boolean | string | Group | GroupConfig;
    groupSummaryFeature?: object | boolean | string | GroupSummary | GroupSummaryConfig;
    headerMenuFeature?: object | boolean | string | HeaderMenu | HeaderMenuConfig;
    headerZoomFeature?: object | boolean | string | HeaderZoom | HeaderZoomConfig;
    labelsFeature?: object | boolean | string | SchedulerLabels | SchedulerLabelsConfig;
    lockRowsFeature?: object | boolean | string | LockRows | LockRowsConfig;
    mergeCellsFeature?: object | boolean | string | MergeCells | MergeCellsConfig;
    nonWorkingTimeFeature?: object | boolean | string | NonWorkingTime | NonWorkingTimeConfig;
    panFeature?: object | boolean | string | Pan | PanConfig;
    pdfExportFeature?: object | boolean | string | SchedulerPdfExport | SchedulerPdfExportConfig;
    pinColumnsFeature?: object | boolean | string | PinColumns | PinColumnsConfig;
    printFeature?: object | boolean | string | SchedulerPrint | SchedulerPrintConfig;
    quickFindFeature?: object | boolean | string | QuickFind | QuickFindConfig;
    regionResizeFeature?: object | boolean | string | RegionResize | RegionResizeConfig;
    resourceMenuFeature?: object | boolean | string | ResourceMenu | ResourceMenuConfig;
    resourceTimeRangesFeature?: object | boolean | string | ResourceTimeRanges | ResourceTimeRangesConfig;
    rowCopyPasteFeature?: object | boolean | string | RowCopyPaste | RowCopyPasteConfig;
    rowEditFeature?: object | boolean | string | RowEdit | RowEditConfig;
    rowExpanderFeature?: object | boolean | string | RowExpander | RowExpanderConfig;
    rowReorderFeature?: object | boolean | string | RowReorder | RowReorderConfig;
    rowResizeFeature?: object | boolean | string | RowResize | RowResizeConfig;
    scheduleContextFeature?: object | boolean | string | ScheduleContext | ScheduleContextConfig;
    scheduleMenuFeature?: object | boolean | string | ScheduleMenu | ScheduleMenuConfig;
    scheduleTooltipFeature?: object | boolean | string | ScheduleTooltip | ScheduleTooltipConfig;
    scrollButtonsFeature?: object | boolean | string | SchedulerScrollButtons | SchedulerScrollButtonsConfig;
    searchFeature?: object | boolean | string | Search | SearchConfig;
    simpleEventEditFeature?: object | boolean | string | SimpleEventEdit | SimpleEventEditConfig;
    sortFeature?: object | boolean | string | Sort | SortConfig;
    splitFeature?: object | boolean | string | Split | SplitConfig;
    stickyCellsFeature?: object | boolean | string | StickyCells | StickyCellsConfig;
    stickyEventsFeature?: object | boolean | string | StickyEvents | StickyEventsConfig;
    stripeFeature?: object | boolean | string | Stripe | StripeConfig;
    summaryFeature?: object | boolean | string | SchedulerSummary | SchedulerSummaryConfig;
    timeAxisHeaderMenuFeature?: object | boolean | string | TimeAxisHeaderMenu | TimeAxisHeaderMenuConfig;
    timeRangesFeature?: object | boolean | string | TimeRanges | TimeRangesConfig;
    timeSelectionFeature?: object | boolean | string | TimeSelection | TimeSelectionConfig;
    treeFeature?: object | boolean | string | Tree | TreeConfig;
    treeGroupFeature?: object | boolean | string | GridTreeGroup | GridTreeGroupConfig;
    treeSummaryFeature?: object | boolean | string | TreeSummary | TreeSummaryConfig;
};
export declare class BryntumTimeline extends React.Component<BryntumTimelineProps> {
    static instanceClass: typeof Timeline;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: Timeline;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumTimelineProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
