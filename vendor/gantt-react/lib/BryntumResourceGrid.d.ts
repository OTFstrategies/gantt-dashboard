import React, { RefObject } from 'react';
import { AIFilter, AIFilterConfig, AjaxStore, AjaxStoreConfig, Base, CellCopyPaste, CellCopyPasteConfig, CellEditorContext, CellMenu, CellMenuConfig, CellTooltip, CellTooltipConfig, Charts, ChartsConfig, Column, ColumnAutoWidth, ColumnAutoWidthConfig, ColumnDragToolbar, ColumnDragToolbarConfig, ColumnPicker, ColumnPickerConfig, ColumnRename, ColumnRenameConfig, ColumnReorder, ColumnReorderConfig, ColumnResize, ColumnResizeConfig, ColumnStore, ColumnStoreConfig, Container, ContainerItemConfig, DomConfig, EmptyTextDomConfig, ExportConfig, FileDrop, FileDropConfig, FillHandle, FillHandleConfig, Filter, FilterBar, FilterBarConfig, FilterConfig, FormulaProviderConfig, Grid, GridBase, GridCellEdit, GridCellEditConfig, GridColumnConfig, GridExcelExporter, GridExcelExporterConfig, GridGroupSummary, GridGroupSummaryConfig, GridLocation, GridLocationConfig, GridLockRows, GridLockRowsConfig, GridPdfExport, GridPdfExportConfig, GridPrint, GridPrintConfig, GridRowReorder, GridRowReorderConfig, GridRowResize, GridRowResizeConfig, GridSelectionMode, GridSplit, GridSplitConfig, GridStateInfo, GridSummary, GridSummaryConfig, GridTreeGroup, GridTreeGroupConfig, Group, GroupConfig, HeaderMenu, HeaderMenuConfig, KeyMapConfig, Mask, MaskConfig, Menu, MenuItem, MenuItemConfig, MergeCells, MergeCellsConfig, Model, ModelConfig, PagingToolbarConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PinColumns, PinColumnsConfig, PreserveScrollOptions, ProjectModel, ProjectModelConfig, QuickFind, QuickFindConfig, RecordPositionContext, RegionResize, RegionResizeConfig, ResourceGrid, ResourceGridListeners, Row, RowCopyPaste, RowCopyPasteConfig, RowEdit, RowEditConfig, RowEditorContext, RowExpander, RowExpanderConfig, ScrollManager, ScrollManagerConfig, Scroller, ScrollerConfig, Search, SearchConfig, Sort, SortConfig, StateProvider, StickyCells, StickyCellsConfig, Store, StoreConfig, Stripe, StripeConfig, SubGrid, SubGridConfig, TabConfig, Tool, ToolConfig, ToolbarConfig, ToolbarItems, Tree, TreeConfig, Widget, XLSColumn } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumResourceGridProps = {
    adopt?: HTMLElement | string;
    alignSelf?: string;
    animateFilterRemovals?: boolean;
    animateRemovingRows?: boolean;
    animateTreeNodeToggle?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoHeight?: boolean;
    bbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    bodyCls?: string | object;
    bubbleEvents?: object;
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
    dataset?: Record<string, string>;
    defaultRegion?: string;
    destroyStore?: boolean;
    destroyStores?: boolean;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    disableGridColumnIdWarning?: boolean;
    disableGridRowModelWarning?: boolean;
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
    elementAttributes?: Record<string, string | null>;
    emptyText?: string | EmptyTextDomConfig;
    enableSticky?: boolean;
    enableTextSelection?: boolean;
    enableUndoRedoKeys?: boolean;
    extraData?: any;
    fillLastColumn?: boolean;
    fixedRowHeight?: boolean;
    flex?: number | string;
    footer?: {
        dock?: 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end';
        html?: string;
        cls?: string;
    } | string;
    formulaProviders?: Record<string, FormulaProviderConfig>;
    fullRowRefresh?: boolean;
    getRowHeight?: (getRowHeight: {
        record: Model;
    }) => number;
    header?: string | boolean | PanelHeader;
    height?: string | number;
    hidden?: boolean;
    hideFooters?: boolean;
    hideHeaders?: boolean;
    hideHorizontalScrollbar?: boolean;
    hoverCls?: string;
    icon?: string | DomConfig;
    id?: string;
    ignoreParentReadOnly?: boolean;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    listeners?: ResourceGridListeners;
    loadMask?: string | MaskConfig | null;
    loadMaskDefaults?: MaskConfig;
    loadMaskError?: MaskConfig | Mask | boolean;
    localizable?: boolean;
    longPressTime?: number;
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxHeight?: string | number;
    maxWidth?: string | number;
    minHeight?: string | number;
    minWidth?: string | number;
    monitorResize?: boolean;
    owner?: Widget | any;
    plugins?: Function[];
    preserveFocusOnDatasetChange?: boolean;
    preserveScroll?: PreserveScrollOptions | boolean;
    preserveScrollOnDatasetChange?: boolean;
    preventTooltipOnTouch?: boolean;
    project?: ProjectModel | ProjectModelConfig | RefObject<any>;
    readOnly?: boolean;
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
    scrollManager?: ScrollManagerConfig | ScrollManager;
    selectionMode?: GridSelectionMode;
    showDirty?: boolean | {
        duringEdit?: boolean;
        newRecord?: boolean;
    };
    span?: number;
    stateful?: boolean | object | string[];
    statefulEvents?: object | string[];
    stateId?: string;
    stateProvider?: StateProvider;
    stateSettings?: {
        restoreUnconfiguredColumns?: boolean;
    };
    store?: Store | StoreConfig | AjaxStore | AjaxStoreConfig;
    strips?: Record<string, ContainerItemConfig>;
    subGridConfigs?: Record<string, SubGridConfig>;
    syncMask?: string | MaskConfig | null;
    tab?: boolean | TabConfig;
    tabBarItems?: ToolbarItems[] | Widget[];
    tbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
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
    type?: 'resourcegrid';
    ui?: 'plain' | 'toolbar' | string | object;
    weight?: number;
    width?: string | number;
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
    onBeforePaste?: ((event: {
        source: Grid;
        clipboardData: string;
        targetCell: GridLocation;
        entityName: string;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforePdfExport?: ((event: {
        config: object;
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
    onDataChange?: ((event: {
        source: Grid;
        store: Store;
        action: 'remove' | 'removeAll' | 'add' | 'clearchanges' | 'filter' | 'update' | 'dataset' | 'replace';
        record: Model;
        records: Model[];
        changes: object;
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
    onLockRows?: ((event: {
        clone: GridBase;
    }) => void) | string;
    onMouseOut?: ((event: {
        event: MouseEvent;
    }) => void) | string;
    onMouseOver?: ((event: {
        event: MouseEvent;
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
    aiFilterFeature?: object | boolean | string | AIFilter | AIFilterConfig;
    cellCopyPasteFeature?: object | boolean | string | CellCopyPaste | CellCopyPasteConfig;
    cellEditFeature?: object | boolean | string | GridCellEdit | GridCellEditConfig;
    cellMenuFeature?: object | boolean | string | CellMenu | CellMenuConfig;
    cellTooltipFeature?: object | boolean | string | CellTooltip | CellTooltipConfig;
    chartsFeature?: object | boolean | string | Charts | ChartsConfig;
    columnAutoWidthFeature?: object | boolean | string | ColumnAutoWidth | ColumnAutoWidthConfig;
    columnDragToolbarFeature?: object | boolean | string | ColumnDragToolbar | ColumnDragToolbarConfig;
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
    groupSummaryFeature?: object | boolean | string | GridGroupSummary | GridGroupSummaryConfig;
    headerMenuFeature?: object | boolean | string | HeaderMenu | HeaderMenuConfig;
    lockRowsFeature?: object | boolean | string | GridLockRows | GridLockRowsConfig;
    mergeCellsFeature?: object | boolean | string | MergeCells | MergeCellsConfig;
    pdfExportFeature?: object | boolean | string | GridPdfExport | GridPdfExportConfig;
    pinColumnsFeature?: object | boolean | string | PinColumns | PinColumnsConfig;
    printFeature?: object | boolean | string | GridPrint | GridPrintConfig;
    quickFindFeature?: object | boolean | string | QuickFind | QuickFindConfig;
    regionResizeFeature?: object | boolean | string | RegionResize | RegionResizeConfig;
    rowCopyPasteFeature?: object | boolean | string | RowCopyPaste | RowCopyPasteConfig;
    rowEditFeature?: object | boolean | string | RowEdit | RowEditConfig;
    rowExpanderFeature?: object | boolean | string | RowExpander | RowExpanderConfig;
    rowReorderFeature?: object | boolean | string | GridRowReorder | GridRowReorderConfig;
    rowResizeFeature?: object | boolean | string | GridRowResize | GridRowResizeConfig;
    searchFeature?: object | boolean | string | Search | SearchConfig;
    sortFeature?: object | boolean | string | Sort | SortConfig;
    splitFeature?: object | boolean | string | GridSplit | GridSplitConfig;
    stickyCellsFeature?: object | boolean | string | StickyCells | StickyCellsConfig;
    stripeFeature?: object | boolean | string | Stripe | StripeConfig;
    summaryFeature?: object | boolean | string | GridSummary | GridSummaryConfig;
    treeFeature?: object | boolean | string | Tree | TreeConfig;
    treeGroupFeature?: object | boolean | string | GridTreeGroup | GridTreeGroupConfig;
};
export declare class BryntumResourceGrid extends React.Component<BryntumResourceGridProps> {
    static instanceClass: typeof ResourceGrid;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: ResourceGrid;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumResourceGridProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
