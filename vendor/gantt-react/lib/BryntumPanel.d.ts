import React from 'react';
import { AlignSpec, Base, Container, ContainerItemConfig, ContainerLayoutConfig, DomConfig, KeyMapConfig, MaskConfig, MenuItemConfig, Model, PagingToolbarConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, PanelListeners, Rectangle, Scroller, ScrollerConfig, StateProvider, TabConfig, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumPanelProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoUpdateRecord?: boolean;
    bbar?: (ContainerItemConfig | string)[] | ToolbarConfig | PagingToolbarConfig | null;
    bodyCls?: string | object;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
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
    defaultBindProperty?: string;
    defaultFocus?: ((widget: Widget) => boolean) | string;
    defaults?: ContainerItemConfig;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
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
    extraData?: any;
    flex?: number | string;
    floating?: boolean;
    footer?: {
        dock?: 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end';
        html?: string;
        cls?: string;
    } | string;
    header?: string | boolean | PanelHeader;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    hideWhenEmpty?: boolean;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    icon?: string | DomConfig;
    id?: string;
    ignoreParentReadOnly?: boolean;
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
    listeners?: PanelListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxWidth?: string | number;
    minHeight?: string | number;
    minWidth?: string | number;
    monitorResize?: boolean | {
        immediate?: boolean;
    };
    namedItems?: Record<string, ContainerItemConfig>;
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
    showAnimation?: boolean | object;
    showTooltipWhenDisabled?: boolean;
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
    title?: string;
    tools?: Record<string, ToolConfig> | null;
    tooltip?: string | TooltipConfig | null;
    trapFocus?: boolean;
    type?: 'panel';
    ui?: 'plain' | 'toolbar' | string | object;
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
    onResize?: ((event: {
        source: Widget;
        width: number;
        height: number;
        oldWidth: number;
        oldHeight: number;
    }) => void) | string;
    onShow?: ((event: {
        source: Widget;
    }) => void) | string;
    onToolClick?: ((event: {
        source: Tool;
        tool: Tool;
    }) => void) | string;
};
export declare class BryntumPanel extends React.Component<BryntumPanelProps> {
    static instanceClass: typeof Panel;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: Panel;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumPanelProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
