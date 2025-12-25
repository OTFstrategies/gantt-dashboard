import React from 'react';
import { AlignSpec, Base, Button, ButtonListeners, ContainerItemConfig, DomConfig, KeyMapConfig, MaskConfig, Menu, MenuConfig, MenuItemConfig, PopupConfig, Rectangle, Scroller, ScrollerConfig, TabConfig, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumButtonProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    badge?: string;
    behaviorType?: 'button' | 'submit' | 'reset';
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
    href?: string;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    icon?: string;
    iconAlign?: 'start' | 'end';
    id?: string;
    ignoreParentReadOnly?: boolean;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    listeners?: ButtonListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxWidth?: string | number;
    menu?: Record<string, MenuItemConfig | ContainerItemConfig> | (MenuItemConfig | ContainerItemConfig)[] | MenuConfig | PopupConfig;
    menuIcon?: string;
    minHeight?: string | number;
    minWidth?: string | number;
    monitorResize?: boolean | {
        immediate?: boolean;
    };
    owner?: Widget | any;
    positioned?: boolean;
    pressed?: boolean;
    pressedCls?: string;
    pressedIcon?: string;
    preventTooltipOnTouch?: boolean;
    readOnly?: boolean;
    relayStoreEvents?: boolean;
    rendition?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text' | string;
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
    split?: boolean | 'mouseover' | 'hover';
    supportsPressedClick?: boolean;
    tab?: boolean | TabConfig;
    tabIndex?: number;
    tag?: string;
    target?: string;
    text?: string | DomConfig | DomConfig[];
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    title?: string;
    toggleable?: boolean;
    toggleGroup?: string;
    tooltip?: string | TooltipConfig | null;
    type?: 'button';
    ui?: string | object;
    weight?: number;
    width?: string | number;
    x?: number;
    y?: number;
    onAction?: ((event: {
        source: Button;
        event: Event;
        domEvent: Event;
    }) => void) | string;
    onBeforeDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onBeforeHide?: ((event: {
        source: Widget;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeShow?: ((event: {
        source: Widget | any;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeShowMenu?: ((event: {
        source: Button;
        menu: Menu;
        userAction: boolean;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeToggle?: ((event: {
        source: Button;
        pressed: boolean;
        userAction: boolean;
        domEvent: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onClick?: ((event: {
        source: Button;
        event: Event;
        domEvent: Event;
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
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
    onToggle?: ((event: {
        source: Button;
        pressed: boolean;
        userAction: boolean;
        domEvent: Event;
    }) => void) | string;
};
export declare class BryntumButton extends React.Component<BryntumButtonProps> {
    static instanceClass: typeof Button;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: Button;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumButtonProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
