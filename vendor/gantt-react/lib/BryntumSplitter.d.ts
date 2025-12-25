import React from 'react';
import { AlignSpec, Base, DomConfig, KeyMapConfig, MaskConfig, Rectangle, Scroller, ScrollerConfig, Splitter, SplitterListeners, TabConfig, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumSplitterProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    cls?: string | object;
    color?: string;
    column?: number;
    config?: object;
    constrainTo?: HTMLElement | Widget | Rectangle;
    content?: string;
    contentElementCls?: string | object;
    dataField?: string;
    dataset?: Record<string, string>;
    defaultBindProperty?: string;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
    elementAttributes?: Record<string, string | null>;
    extraData?: any;
    flex?: number | string;
    floating?: boolean;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    id?: string;
    ignoreParentReadOnly?: boolean;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    listeners?: SplitterListeners;
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
    orientation?: 'auto' | 'horizontal' | 'vertical';
    owner?: Widget | any;
    positioned?: boolean;
    preventTooltipOnTouch?: boolean;
    readOnly?: boolean;
    relayStoreEvents?: boolean;
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
    showButtons?: boolean | 'start' | 'end';
    showTooltipWhenDisabled?: boolean;
    span?: number;
    tab?: boolean | TabConfig;
    tag?: string;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    title?: string;
    tooltip?: string | TooltipConfig | null;
    type?: 'splitter';
    ui?: string | object;
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
    onBeforeShow?: ((event: {
        source: Widget | any;
    }) => Promise<boolean> | boolean | void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onDrag?: ((event: {
        source: Splitter;
        event: MouseEvent | TouchEvent;
    }) => void) | string;
    onDragStart?: ((event: {
        source: Splitter;
        event: MouseEvent | TouchEvent;
    }) => void) | string;
    onDrop?: ((event: {
        source: Splitter;
        event: MouseEvent | TouchEvent;
    }) => void) | string;
    onElementCreated?: ((event: {
        element: HTMLElement;
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
};
export declare class BryntumSplitter extends React.Component<BryntumSplitterProps> {
    static instanceClass: typeof Splitter;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: Splitter;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumSplitterProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
