import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, AssignmentModel, AssignmentModelConfig, Base, Baselines, BaselinesConfig, BryntumScrollOptions, CalendarModel, CalendarModelConfig, CellCopyPaste, CellCopyPasteConfig, CellEdit, CellEditConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnLines, ColumnLinesConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, CriticalPaths, CriticalPathsConfig, CycleResolutionPopup, DateConstraint, Dependencies, DependenciesConfig, DependencyBaseModel, DependencyEdit, DependencyEditConfig, DependencyModel, DependencyModelConfig, DomClassList, DomConfig, DurationUnit, EmptyTextDomConfig, EventColor, EventEdit, EventFilter, EventFilterConfig, EventModel, EventResizeData, EventSegments, EventSegmentsConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Gantt, GanttBase, GanttBaseListeners, Grid, GridBase, GridColumnConfig, GridExcelExporter, GridExcelExporterConfig, GridGroupSummary, GridGroupSummaryConfig, GridLocation, GridLocationConfig, GridLockRows, GridLockRowsConfig, GridRowResize, GridRowResizeConfig, GridSelectionMode, GridSplit, GridSplitConfig, GridStateInfo, Group, GroupConfig, HeaderMenu, HeaderMenuConfig, HeaderZoom, HeaderZoomConfig, Indicators, IndicatorsConfig, KeyMapConfig, Labels, LabelsConfig, Mask, MaskConfig, Menu, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, MspExport, MspExportConfig, NonWorkingTime, NonWorkingTimeConfig, PagingToolbarConfig, Pan, PanConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, ParentArea, ParentAreaConfig, PdfExport, PdfExportConfig, PercentBar, PercentBarConfig, PinColumns, PinColumnsConfig, Popup, PreserveScrollOptions, Print, PrintConfig, ProgressLine, ProgressLineConfig, ProjectEdit, ProjectEditConfig, ProjectEditor, ProjectLines, ProjectLinesConfig, ProjectModel, ProjectModelConfig, QuickFind, QuickFindConfig, RecordPositionContext, RecurrenceConfirmationPopup, RecurrenceConfirmationPopupConfig, RegionResize, RegionResizeConfig, ResourceModel, ResourceModelConfig, Rollups, RollupsConfig, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, RowReorder, RowReorderConfig, ScheduleMenu, ScheduleMenuConfig, ScheduleTooltip, ScheduleTooltipConfig, Scheduler, SchedulerAssignmentModel, SchedulerDependencyEdit, SchedulerDependencyModel, SchedulerEventModel, SchedulerPro, SchedulerProResourceModel, SchedulerProTaskEdit, SchedulerResourceModel, SchedulerTimeAxisColumn, SchedulingIssueResolutionPopup, ScrollButtons, ScrollButtonsConfig, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, Sort, SortConfig, StateProvider, StickyCells, StickyCellsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, Summary, SummaryConfig, TabConfig, TaskCopyPaste, TaskCopyPasteConfig, TaskDrag, TaskDragConfig, TaskDragCreate, TaskDragCreateConfig, TaskEdit, TaskEditConfig, TaskEditorBase, TaskMenu, TaskMenuConfig, TaskModel, TaskModelConfig, TaskNonWorkingTime, TaskNonWorkingTimeConfig, TaskResize, TaskResizeConfig, TaskResizeData, TaskSegmentDrag, TaskSegmentDragConfig, TaskSegmentResize, TaskSegmentResizeConfig, TaskStore, TaskStoreConfig, TaskTooltip, TaskTooltipConfig, TimeAxis, TimeAxisConfig, TimeAxisHeaderMenu, TimeAxisHeaderMenuConfig, TimeRanges, TimeRangesConfig, TimeSpan, TimeSpanConfig, TimeSpanHighlight, TimeSpanHighlightConfig, TimelineBase, TimelineChart, TimelineChartConfig, TimelineContext, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, Tree, TreeConfig, TreeGroup, TreeGroupConfig, Versions, VersionsConfig, VerticalTimeAxisColumn, ViewPreset, ViewPresetConfig, VisibleDate, Widget, XLSColumn } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumGanttBaseProps = {
    adopt?: HTMLElement | string;
    alignSelf?: string;
    allowCreate?: boolean;
    allowCreateOnlyParent?: boolean;
    allowDropOnEventBar?: boolean;
    animateFilterRemovals?: boolean;
    animateRemovingRows?: boolean;
    animateTreeNodeToggle?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    assignments?: AssignmentModel[] | AssignmentModelConfig[];
    autoAdjustTimeAxis?: boolean;
    autoHeight?: boolean;
    barMargin?: number;
    bbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    bodyCls?: string | object;
    bubbleEvents?: object;
    bufferCoef?: number;
    bufferThreshold?: number;
    calendars?: CalendarModel[] | CalendarModelConfig[];
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
    cycleResolutionPopupClass?: typeof CycleResolutionPopup;
    data?: object[] | Model[] | ModelConfig[];
    dataField?: string;
    dataset?: Record<string, string>;
    defaultRegion?: string;
    defaultResourceImageName?: string;
    dependencies?: DependencyModel[] | DependencyModelConfig[];
    dependencyIdField?: string;
    destroyStore?: boolean;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    disableGridColumnIdWarning?: boolean;
    disableGridRowModelWarning?: boolean;
    displayDateFormat?: string;
    displaySchedulingIssueResolutionPopup?: boolean;
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
    getDateConstraints?: (taskRecord: TaskModel) => DateConstraint;
    getRowHeight?: (getRowHeight: {
        record: Model;
    }) => number;
    header?: string | boolean | PanelHeader;
    height?: string | number;
    hidden?: boolean;
    hideFooters?: boolean;
    hideHeaders?: boolean;
    hideHorizontalScrollbar?: boolean;
    hideRowHover?: boolean;
    hoverCls?: string;
    icon?: string | DomConfig;
    id?: string;
    ignoreDomEventsWhileScrolling?: boolean;
    ignoreParentReadOnly?: boolean;
    infiniteScroll?: boolean;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    listeners?: GanttBaseListeners;
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
    newTaskDefaults?: TaskModelConfig | object | (() => TaskModelConfig | object);
    owner?: Widget | any;
    partner?: TimelineBase;
    plugins?: Function[];
    preserveFocusOnDatasetChange?: boolean;
    preserveScroll?: PreserveScrollOptions | boolean;
    preserveScrollOnDatasetChange?: boolean;
    presets?: ViewPresetConfig[];
    preventTooltipOnTouch?: boolean;
    project?: ProjectModel | ProjectModelConfig | RefObject<any>;
    projectProgressReporting?: string | null;
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
    resourceImageFolderPath?: string;
    resourceImagePath?: string;
    resources?: ResourceModel[] | ResourceModelConfig[];
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
    schedulingIssueResolutionPopupClass?: typeof SchedulingIssueResolutionPopup;
    scrollable?: boolean | ScrollerConfig | Scroller;
    scrollerClass?: typeof Scroller;
    scrollManager?: ScrollManagerConfig | ScrollManager;
    scrollTaskIntoViewOnCellClick?: boolean | BryntumScrollOptions;
    selectionMode?: GridSelectionMode;
    showCostControls?: boolean;
    showCreationTooltip?: boolean;
    showDirty?: boolean | {
        duringEdit?: boolean;
        newRecord?: boolean;
    };
    showLagInTooltip?: boolean;
    showRecurringUI?: boolean;
    showTaskColorPickers?: boolean;
    showTooltip?: boolean;
    showUnscheduledTasks?: boolean;
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
    taskRenderer?: (detail: {
        taskRecord: TaskModel;
        renderData: {
            cls: DomClassList | string;
            style: string | Record<string, string>;
            wrapperCls: DomClassList | string;
            iconCls: DomClassList | string;
        };
    }, indicators: TimeSpan[] | TimeSpanConfig[]) => string | DomConfig | DomConfig[];
    tasks?: TaskModel[] | TaskModelConfig[];
    taskStore?: TaskStore | TaskStoreConfig;
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
    timeResolution?: {
        increment?: number;
        unit?: DurationUnit;
    } | number;
    timeZone?: string | number;
    title?: string;
    toggleParentTasksOnClick?: boolean;
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
    ui?: 'plain' | 'toolbar' | string | object;
    useContextualRecurrenceRules?: boolean;
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
        source: Gantt;
        proxyElement: HTMLElement;
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
        source: SchedulerPro;
        eventRecord: EventModel;
        editor: TaskEditorBase;
    }) => void) | string;
    onAfterProjectEdit?: ((event: {
        source: Gantt;
        projectRecord: ProjectModel;
        editor: ProjectEditor;
    }) => void) | string;
    onAfterProjectSave?: ((event: {
        source: Gantt;
        projectRecord: ProjectModel;
        editor: ProjectEditor;
    }) => void) | string;
    onAfterTaskDrop?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        valid: boolean;
    }) => void) | string;
    onAfterTaskEdit?: ((event: {
        source: SchedulerPro;
        taskRecord: EventModel;
        editor: TaskEditorBase;
    }) => void) | string;
    onAfterTaskSave?: ((event: {
        source: SchedulerPro;
        taskRecord: EventModel;
        editor: TaskEditorBase;
    }) => void) | string;
    onAfterTaskSegmentDrop?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        valid: boolean;
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
        source: Gantt;
        taskRecord: TaskModel;
        date: Date;
    }) => void) | string;
    onBeforeDragCreateFinalize?: ((event: {
        source: Gantt;
        proxyElement: HTMLElement;
        context: {
            async: boolean;
            finalize: Function;
        };
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
        source: SchedulerPro;
        eventRecord: EventModel;
        editor: TaskEditorBase;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventSegmentResize?: ((event: {
        source: SchedulerPro;
        eventRecord: EventModel;
        resourceRecord: SchedulerProResourceModel;
        event: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeEventSegmentResizeFinalize?: ((event: {
        source: SchedulerPro;
        context: {
            async: boolean;
            finalize: Function;
        };
    }) => void) | string;
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
    onBeforeMspExport?: ((event: {
        config: object;
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
    onBeforeProjectEdit?: ((event: {
        source: Gantt;
        projectEdit: ProjectEdit;
        projectRecord: ProjectModel;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeProjectEditShow?: ((event: {
        source: Gantt;
        projectEdit: ProjectEdit;
        projectRecord: ProjectModel;
        editor: ProjectEditor;
    }) => void) | string;
    onBeforeProjectSave?: ((event: {
        source: Gantt;
        projectRecord: ProjectModel;
        editor: ProjectEditor;
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
        state: GridStateInfo;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateSave?: ((event: {
        state: GridStateInfo;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskAdd?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
    }) => void) | string;
    onBeforeTaskDelete?: ((event: {
        source: SchedulerPro;
        taskRecord: EventModel;
        editor: TaskEditorBase;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskDrag?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskDropFinalize?: ((event: {
        source: Gantt;
        context: {
            taskRecords: TaskModel[];
            valid: boolean;
            async: boolean;
            finalize: Function;
        };
    }) => void) | string;
    onBeforeTaskEdit?: ((event: {
        source: SchedulerPro;
        taskEdit: SchedulerProTaskEdit;
        taskRecord: EventModel;
        taskElement: HTMLElement;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskEditShow?: ((event: {
        source: SchedulerPro;
        taskEdit: SchedulerProTaskEdit;
        taskRecord: EventModel;
        eventElement: HTMLElement;
        editor: TaskEditorBase;
    }) => void) | string;
    onBeforeTaskResize?: ((event: {
        taskRecord: TaskModel;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskResizeFinalize?: ((event: {
        taskRecord: TaskModel;
        source: Gantt;
        context: {
            endDate: Date;
            originalEndDate: Date;
            resizeData: TaskResizeData[];
            async: boolean;
            finalize: Function;
        };
        event: Event;
    }) => void) | string;
    onBeforeTaskSave?: ((event: {
        source: SchedulerPro;
        taskRecord: EventModel;
        editor: TaskEditorBase;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskSegmentDrag?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskSegmentDropFinalize?: ((event: {
        source: Gantt;
        context: {
            taskRecords: TaskModel[];
            valid: boolean;
            async: boolean;
            finalize: Function;
        };
    }) => void) | string;
    onBeforeTaskSegmentResize?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeTaskSegmentResizeFinalize?: ((event: {
        source: Gantt;
        context: {
            async: boolean;
            finalize: Function;
        };
    }) => void) | string;
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
    onCriticalPathsHighlighted?: (() => void) | string;
    onCriticalPathsUnhighlighted?: (() => void) | string;
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
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
        proxyElement: HTMLElement;
    }) => void) | string;
    onDragCreateStart?: ((event: {
        source: Gantt;
        proxyElement: HTMLElement;
    }) => void) | string;
    onDragSelecting?: ((event: {
        source: Grid;
        selectedCells: GridLocationConfig[] | GridLocation[];
        selectedRecords: Model[];
    }) => void) | string;
    onElementCreated?: ((event: {
        element: HTMLElement;
    }) => void) | string;
    onEventEditBeforeSetRecord?: ((event: {
        source: Container;
        record: SchedulerEventModel;
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
    onEventSegmentPartialResize?: ((event: {
        source: SchedulerPro;
        eventRecord: EventModel;
        startDate: Date;
        endDate: Date;
        element: HTMLElement;
    }) => void) | string;
    onEventSegmentResizeEnd?: ((event: {
        source: SchedulerPro;
        changed: boolean;
        eventRecord: EventModel;
    }) => void) | string;
    onEventSegmentResizeStart?: ((event: {
        source: SchedulerPro;
        eventRecord: EventModel;
        resourceRecord: SchedulerProResourceModel;
        event: MouseEvent;
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
    onMspExport?: ((event: {
        config: object;
        fileContent: string;
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
    onPdfExport?: ((event: {
        response?: any;
        error?: Error;
    }) => void) | string;
    onPercentBarDrag?: ((event: {
        source: TimelineBase;
        taskRecord: Model;
        domEvent: MouseEvent;
    }) => void) | string;
    onPercentBarDragAbort?: ((event: {
        source: TimelineBase;
        taskRecord: Model;
        domEvent: MouseEvent;
    }) => void) | string;
    onPercentBarDragStart?: ((event: {
        source: TimelineBase;
        taskRecord: Model;
        domEvent: MouseEvent;
    }) => void) | string;
    onPercentBarDrop?: ((event: {
        source: TimelineBase;
        taskRecord: Model;
        domEvent: MouseEvent;
    }) => void) | string;
    onPresetChange?: ((event: {
        source: Scheduler;
        startDate: Date;
        centerDate: Date;
        endDate: Date;
        from: ViewPreset;
        to: ViewPreset;
    }) => Promise<boolean> | boolean | void) | string;
    onProjectEditCanceled?: ((event: {
        source: Gantt;
        projectRecord: ProjectModel;
        editor: ProjectEditor;
    }) => void) | string;
    onReadOnly?: ((event: {
        readOnly: boolean;
    }) => void) | string;
    onRecompose?: (() => void) | string;
    onReleaseTask?: ((event: {
        source: Gantt;
        renderData: object;
        taskRecord: TaskModel;
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
    onRenderTask?: ((event: {
        source: Gantt;
        renderData: object;
        taskRecord: TaskModel;
        element: HTMLElement;
    }) => void) | string;
    onResize?: ((event: {
        source: Widget;
        width: number;
        height: number;
        oldWidth: number;
        oldHeight: number;
    }) => void) | string;
    onResourceAssignmentClick?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        resourceRecord: ResourceModel;
        event: Event;
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
    onScroll?: ((event: {
        source: Grid;
        scrollTop: number;
    }) => void) | string;
    onScrollButtonClick?: ((event: {
        domEvent: Event;
        taskRecord: TaskModel;
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
    onTaskClick?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskContextMenu?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskDblClick?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskDrag?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        startDate: Date;
        endDate: Date;
        dragData: object;
        changed: boolean;
    }) => void) | string;
    onTaskDragStart?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
    }) => void) | string;
    onTaskDrop?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        isCopy: boolean;
    }) => void) | string;
    onTaskEditCanceled?: ((event: {
        source: SchedulerPro;
        taskRecord: EventModel;
        editor: TaskEditorBase;
    }) => void) | string;
    onTaskKeyDown?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: KeyboardEvent;
    }) => void) | string;
    onTaskKeyUp?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: KeyboardEvent;
    }) => void) | string;
    onTaskMenuBeforeShow?: ((event: {
        source: Gantt;
        items: MenuItemConfig[];
        taskRecord: TaskModel;
        taskElement: HTMLElement;
    }) => Promise<boolean> | boolean | void) | string;
    onTaskMenuItem?: ((event: {
        source: Gantt;
        item: MenuItem;
        taskRecord: TaskModel;
        taskElement: HTMLElement;
    }) => void) | string;
    onTaskMenuShow?: ((event: {
        source: Gantt;
        menu: Menu;
        taskRecord: TaskModel;
        taskElement: HTMLElement;
    }) => void) | string;
    onTaskMouseDown?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskMouseOut?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskMouseOver?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskMouseUp?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        event: MouseEvent;
    }) => void) | string;
    onTaskNonWorkingTimeClick?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        interval: {
            name: string;
            startDate: Date;
            endDate: Date;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onTaskNonWorkingTimeContextMenu?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        interval: {
            name: string;
            startDate: Date;
            endDate: Date;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onTaskNonWorkingTimeDblClick?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        interval: {
            name: string;
            startDate: Date;
            endDate: Date;
        };
        domEvent: MouseEvent;
    }) => void) | string;
    onTaskPartialResize?: ((event: {
        resizeData: TaskResizeData[];
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
        element: HTMLElement;
    }) => void) | string;
    onTaskResizeEnd?: ((event: {
        changed: boolean;
        taskRecord: TaskModel;
        resizeData: TaskResizeData[];
    }) => void) | string;
    onTaskResizeStart?: ((event: {
        taskRecord: TaskModel;
        event: Event;
        resizeData: TaskResizeData[];
    }) => void) | string;
    onTaskSegmentDrag?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        startDate: Date;
        endDate: Date;
        dragData: object;
        changed: boolean;
    }) => void) | string;
    onTaskSegmentDragStart?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
    }) => void) | string;
    onTaskSegmentDrop?: ((event: {
        source: Gantt;
        taskRecords: TaskModel[];
        isCopy: boolean;
    }) => void) | string;
    onTaskSegmentPartialResize?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        startDate: Date;
        endDate: Date;
        element: HTMLElement;
    }) => void) | string;
    onTaskSegmentResizeEnd?: ((event: {
        source: Gantt;
        changed: boolean;
        taskRecord: TaskModel;
    }) => void) | string;
    onTaskSegmentResizeStart?: ((event: {
        source: Gantt;
        taskRecord: TaskModel;
        resourceRecord: SchedulerResourceModel;
        event: MouseEvent;
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
    onTransactionChange?: ((event: {
        hasChanges: boolean;
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
    baselinesFeature?: object | boolean | string | Baselines | BaselinesConfig;
    cellCopyPasteFeature?: object | boolean | string | CellCopyPaste | CellCopyPasteConfig;
    cellEditFeature?: object | boolean | string | CellEdit | CellEditConfig;
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
    criticalPathsFeature?: object | boolean | string | CriticalPaths | CriticalPathsConfig;
    dependenciesFeature?: object | boolean | string | Dependencies | DependenciesConfig;
    dependencyEditFeature?: object | boolean | string | DependencyEdit | DependencyEditConfig;
    eventFilterFeature?: object | boolean | string | EventFilter | EventFilterConfig;
    eventSegmentsFeature?: object | boolean | string | EventSegments | EventSegmentsConfig;
    excelExporterFeature?: object | boolean | string | GridExcelExporter | GridExcelExporterConfig;
    fileDropFeature?: object | boolean | string | FileDrop | FileDropConfig;
    fillHandleFeature?: object | boolean | string | FillHandle | FillHandleConfig;
    filterFeature?: object | boolean | string | Filter | FilterConfig;
    filterBarFeature?: object | boolean | string | FilterBar | FilterBarConfig;
    groupFeature?: object | boolean | string | Group | GroupConfig;
    groupSummaryFeature?: object | boolean | string | GridGroupSummary | GridGroupSummaryConfig;
    headerMenuFeature?: object | boolean | string | HeaderMenu | HeaderMenuConfig;
    headerZoomFeature?: object | boolean | string | HeaderZoom | HeaderZoomConfig;
    indicatorsFeature?: object | boolean | string | Indicators | IndicatorsConfig;
    labelsFeature?: object | boolean | string | Labels | LabelsConfig;
    lockRowsFeature?: object | boolean | string | GridLockRows | GridLockRowsConfig;
    mergeCellsFeature?: object | boolean | string | MergeCells | MergeCellsConfig;
    mspExportFeature?: object | boolean | string | MspExport | MspExportConfig;
    nonWorkingTimeFeature?: object | boolean | string | NonWorkingTime | NonWorkingTimeConfig;
    panFeature?: object | boolean | string | Pan | PanConfig;
    parentAreaFeature?: object | boolean | string | ParentArea | ParentAreaConfig;
    pdfExportFeature?: object | boolean | string | PdfExport | PdfExportConfig;
    percentBarFeature?: object | boolean | string | PercentBar | PercentBarConfig;
    pinColumnsFeature?: object | boolean | string | PinColumns | PinColumnsConfig;
    printFeature?: object | boolean | string | Print | PrintConfig;
    progressLineFeature?: object | boolean | string | ProgressLine | ProgressLineConfig;
    projectEditFeature?: object | boolean | string | ProjectEdit | ProjectEditConfig;
    projectLinesFeature?: object | boolean | string | ProjectLines | ProjectLinesConfig;
    quickFindFeature?: object | boolean | string | QuickFind | QuickFindConfig;
    regionResizeFeature?: object | boolean | string | RegionResize | RegionResizeConfig;
    rollupsFeature?: object | boolean | string | Rollups | RollupsConfig;
    rowCopyPasteFeature?: object | boolean | string | RowCopyPaste | RowCopyPasteConfig;
    rowEditFeature?: object | boolean | string | RowEdit | RowEditConfig;
    rowExpanderFeature?: object | boolean | string | RowExpander | RowExpanderConfig;
    rowReorderFeature?: object | boolean | string | RowReorder | RowReorderConfig;
    rowResizeFeature?: object | boolean | string | GridRowResize | GridRowResizeConfig;
    scheduleMenuFeature?: object | boolean | string | ScheduleMenu | ScheduleMenuConfig;
    scheduleTooltipFeature?: object | boolean | string | ScheduleTooltip | ScheduleTooltipConfig;
    scrollButtonsFeature?: object | boolean | string | ScrollButtons | ScrollButtonsConfig;
    searchFeature?: object | boolean | string | Search | SearchConfig;
    sortFeature?: object | boolean | string | Sort | SortConfig;
    splitFeature?: object | boolean | string | GridSplit | GridSplitConfig;
    stickyCellsFeature?: object | boolean | string | StickyCells | StickyCellsConfig;
    stripeFeature?: object | boolean | string | Stripe | StripeConfig;
    summaryFeature?: object | boolean | string | Summary | SummaryConfig;
    taskCopyPasteFeature?: object | boolean | string | TaskCopyPaste | TaskCopyPasteConfig;
    taskDragFeature?: object | boolean | string | TaskDrag | TaskDragConfig;
    taskDragCreateFeature?: object | boolean | string | TaskDragCreate | TaskDragCreateConfig;
    taskEditFeature?: object | boolean | string | TaskEdit | TaskEditConfig;
    taskMenuFeature?: object | boolean | string | TaskMenu | TaskMenuConfig;
    taskNonWorkingTimeFeature?: object | boolean | string | TaskNonWorkingTime | TaskNonWorkingTimeConfig;
    taskResizeFeature?: object | boolean | string | TaskResize | TaskResizeConfig;
    taskSegmentDragFeature?: object | boolean | string | TaskSegmentDrag | TaskSegmentDragConfig;
    taskSegmentResizeFeature?: object | boolean | string | TaskSegmentResize | TaskSegmentResizeConfig;
    taskTooltipFeature?: object | boolean | string | TaskTooltip | TaskTooltipConfig;
    timeAxisHeaderMenuFeature?: object | boolean | string | TimeAxisHeaderMenu | TimeAxisHeaderMenuConfig;
    timelineChartFeature?: object | boolean | string | TimelineChart | TimelineChartConfig;
    timeRangesFeature?: object | boolean | string | TimeRanges | TimeRangesConfig;
    timeSpanHighlightFeature?: object | boolean | string | TimeSpanHighlight | TimeSpanHighlightConfig;
    treeFeature?: object | boolean | string | Tree | TreeConfig;
    treeGroupFeature?: object | boolean | string | TreeGroup | TreeGroupConfig;
    versionsFeature?: object | boolean | string | Versions | VersionsConfig;
};
export declare class BryntumGanttBase extends React.Component<BryntumGanttBaseProps> {
    static instanceClass: typeof GanttBase;
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
        assignmentStore: string;
        calendarManagerStore: string;
        dependencyStore: string;
        eventStore: string;
        resourceStore: string;
        taskStore: string;
        timeRangeStore: string;
    };
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: GanttBase;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumGanttBaseProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
