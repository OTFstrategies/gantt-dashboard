import React from 'react';
import { AlignSpec, Base, CalendarPanel, Container, ContainerItemConfig, ContainerLayoutConfig, DatePicker, DomConfig, KeyMapConfig, MaskConfig, MenuItemConfig, Model, Month, MonthConfig, PagingToolbarConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, Rectangle, SchedulerDatePicker, SchedulerDatePickerListeners, SchedulerEventModel, SchedulerEventStore, Scroller, ScrollerConfig, StateProvider, TabConfig, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumSchedulerDatePickerProps = {
    activeDate?: Date | 'today' | string;
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    animateTimeShift?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoUpdateRecord?: boolean;
    bbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    bodyCls?: string | object;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    cellRenderer?: ((renderData: {
        cell: HTMLElement;
        innerCell: HTMLElement;
        cellPayload: HTMLElement;
        date: Date;
        day: number;
        rowIndex: number[];
        row: HTMLElement;
        source: CalendarPanel;
        cellIndex: number[];
        columnIndex: number[];
        visibleColumnIndex: number[];
    }) => string | DomConfig | void) | string;
    centered?: boolean;
    cls?: string | object;
    collapsed?: boolean;
    collapsible?: boolean | PanelCollapserConfig | PanelCollapserOverlayConfig;
    color?: string;
    column?: number;
    config?: object;
    constrainTo?: HTMLElement | Widget | Rectangle;
    content?: string;
    contentElementCls?: string | object;
    dataField?: string;
    dataset?: Record<string, string>;
    date?: Date | string;
    dayNameFormat?: string;
    defaultBindProperty?: string;
    defaultFocus?: ((widget: Widget) => boolean) | string;
    defaults?: ContainerItemConfig;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    disabledCls?: string;
    disabledDates?: ((date: Date) => boolean) | string | Date[] | string[];
    disableNonWorkingDays?: boolean;
    disableOtherMonthCells?: boolean;
    disableWeekends?: boolean;
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
    dragSelect?: boolean;
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
    editMonth?: boolean;
    elementAttributes?: Record<string, string | null>;
    eventFilter?: ((event: SchedulerEventModel) => boolean) | string;
    eventStore?: SchedulerEventStore;
    extraData?: any;
    flex?: number | string;
    floating?: boolean;
    focusDisabledDates?: boolean;
    footer?: {
        dock?: 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end';
        html?: string;
        cls?: string;
    } | string;
    header?: string | boolean | PanelHeader;
    headerRenderer?: ((cell: HTMLElement, columnIndex: number, weekDay: number) => string | DomConfig | void) | string;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    hideOtherMonthCells?: boolean;
    hideWhenEmpty?: boolean;
    highlightSelectedWeek?: boolean;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    icon?: string | DomConfig;
    id?: string;
    ignoreParentReadOnly?: boolean;
    includeYear?: boolean;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    itemCls?: string;
    items?: Record<string, ContainerItemConfig | MenuItemConfig | boolean | null> | (ContainerItemConfig | MenuItemConfig | Widget)[];
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    layout?: string | ContainerLayoutConfig;
    layoutStyle?: object;
    lazyItems?: Record<string, ContainerItemConfig> | ContainerItemConfig[] | Widget[];
    listeners?: SchedulerDatePickerListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxDate?: Date;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxWidth?: string | number;
    minColumnWidth?: number;
    minDate?: Date;
    minHeight?: string | number;
    minRowHeight?: number | string;
    minWidth?: string | number;
    monitorResize?: boolean | {
        immediate?: boolean;
    };
    month?: Month | MonthConfig;
    monthButtonFormat?: string;
    multiSelect?: boolean | 'range' | 'simple';
    namedItems?: Record<string, ContainerItemConfig>;
    nonWorkingDayCls?: string;
    nonWorkingDays?: Record<number, boolean>;
    otherMonthCls?: string;
    owner?: Widget | any;
    positioned?: boolean;
    preventTooltipOnTouch?: boolean;
    readOnly?: boolean;
    record?: Model;
    relayStoreEvents?: boolean;
    rendition?: string | Record<string, string> | null;
    ripple?: boolean | {
        delegate?: string;
        color?: string;
        radius?: number;
        clip?: string;
    };
    rootElement?: ShadowRoot | HTMLElement;
    rtl?: boolean;
    scrollable?: boolean | ScrollerConfig | Scroller;
    scrollAction?: 'hide' | 'realign' | null;
    selection?: Date[] | string[];
    shadePastDates?: boolean;
    showAnimation?: boolean | object;
    showEvents?: boolean | 'count' | 'heatmap';
    showTooltipWhenDisabled?: boolean;
    showWeekColumn?: boolean;
    sixWeeks?: boolean;
    span?: number;
    stateful?: boolean | object | string[];
    statefulEvents?: object | string[];
    stateId?: string;
    stateProvider?: StateProvider;
    strictRecordMapping?: boolean;
    strips?: Record<string, ContainerItemConfig>;
    tab?: boolean | TabConfig;
    tabBarItems?: ToolbarItems[] | Widget[];
    tag?: string;
    tbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    textContent?: boolean;
    tip?: TooltipConfig;
    title?: string;
    todayCls?: string;
    tools?: Record<string, ToolConfig> | null;
    tooltip?: string | TooltipConfig | null;
    trapFocus?: boolean;
    type?: 'datepicker';
    ui?: 'plain' | 'toolbar' | string | object;
    weekColumnHeader?: string;
    weekendCls?: string;
    weekRenderer?: ((weekCell: HTMLElement, week: number[]) => string | DomConfig | void) | string;
    weekStartDay?: number;
    weight?: number;
    width?: string | number;
    x?: number;
    y?: number;
    onBeforeDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onBeforeHide?: ((event: {
        source: Widget;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeRefresh?: ((event: {
        source: DatePicker;
    }) => void) | string;
    onBeforeSetRecord?: ((event: {
        source: Container;
        record: Model;
    }) => void) | string;
    onBeforeShow?: ((event: {
        source: Widget | any;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateApply?: ((event: {
        state: any;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeStateSave?: ((event: {
        state: any;
    }) => Promise<boolean> | boolean | void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onCollapse?: ((event: {
        source: Panel;
    }) => void) | string;
    onDateChange?: ((event: {
        value: Date;
        oldValue: Date;
        changes: {
            d: boolean;
            w: boolean;
            m: boolean;
            y: boolean;
        };
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onDirtyStateChange?: ((event: {
        source: Container;
        dirty: boolean;
    }) => void) | string;
    onElementCreated?: ((event: {
        element: HTMLElement;
    }) => void) | string;
    onExpand?: ((event: {
        source: Panel;
    }) => void) | string;
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
    onHide?: ((event: {
        source: Widget;
    }) => void) | string;
    onPaint?: ((event: {
        source: Widget;
        firstPaint: boolean;
    }) => void) | string;
    onReadOnly?: ((event: {
        readOnly: boolean;
    }) => void) | string;
    onRecompose?: (() => void) | string;
    onRefresh?: (() => void) | string;
    onResize?: ((event: {
        source: Widget;
        width: number;
        height: number;
        oldWidth: number;
        oldHeight: number;
    }) => void) | string;
    onSelectionChange?: ((event: {
        selection: Date[];
        oldSelection: Date[];
        userAction: boolean;
    }) => void) | string;
    onShow?: ((event: {
        source: Widget;
    }) => void) | string;
    onToolClick?: ((event: {
        source: Tool;
        tool: Tool;
    }) => void) | string;
};
export declare class BryntumSchedulerDatePicker extends React.Component<BryntumSchedulerDatePickerProps> {
    static instanceClass: typeof SchedulerDatePicker;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: SchedulerDatePicker;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumSchedulerDatePickerProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
