import React from 'react';
import { AlignSpec, Base, Container, ContainerItemConfig, ContainerLayoutConfig, DomConfig, Editor, EditorListeners, InputFieldConfig, KeyMapConfig, MaskConfig, MenuItemConfig, Model, Rectangle, Scroller, ScrollerConfig, TabConfig, ToolbarItems, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumEditorProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    appendToTargetParent?: boolean;
    ariaDescription?: string;
    ariaLabel?: string;
    autoUpdateRecord?: boolean;
    blurAction?: 'complete' | 'cancel' | null;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    cancelKey?: string;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    cls?: string | object;
    color?: string;
    column?: number;
    completeKey?: string;
    completeOnChange?: boolean;
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
    elementAttributes?: Record<string, string | null>;
    extraData?: any;
    fitTargetContent?: boolean;
    flex?: number | string;
    floating?: boolean;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    hideTarget?: boolean;
    hideWhenEmpty?: boolean;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    id?: string;
    ignoreParentReadOnly?: boolean;
    inputField?: InputFieldConfig | string | Widget;
    inputFieldAlign?: 'start' | 'end';
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    invalidAction?: 'block' | 'allow' | 'revert';
    itemCls?: string;
    items?: Record<string, ContainerItemConfig | MenuItemConfig | boolean | null> | (ContainerItemConfig | MenuItemConfig | Widget)[];
    keyMap?: Record<string, KeyMapConfig>;
    labelPosition?: 'before' | 'above' | 'align-before' | 'auto' | null;
    layout?: string | ContainerLayoutConfig;
    layoutStyle?: object;
    lazyItems?: Record<string, ContainerItemConfig> | ContainerItemConfig[] | Widget[];
    listeners?: EditorListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    matchFont?: boolean;
    matchSize?: boolean | {
        width?: boolean;
        height?: boolean;
    };
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
    strictRecordMapping?: boolean;
    tab?: boolean | TabConfig;
    tabBarItems?: ToolbarItems[] | Widget[];
    tag?: string;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    textContent?: boolean;
    title?: string;
    tooltip?: string | TooltipConfig | null;
    type?: 'Editor' | 'editor';
    ui?: string | object;
    weight?: number;
    width?: string | number;
    x?: number;
    y?: number;
    onAfterEdit?: ((event: {
        source: Editor;
        record?: Model;
    }) => void) | string;
    onBeforeCancel?: ((event: {
        oldValue: object;
        value: object;
        event: Event;
        source: Editor;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeComplete?: ((event: {
        oldValue: object;
        value: object;
        source: Editor;
        finalize: {
            context?: object;
        };
    }) => Promise<boolean> | boolean | void) | string;
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
    onBeforeStart?: ((event: {
        target: HTMLElement;
        record?: Model;
        field?: string;
        value: object;
        align: string | AlignSpec;
        hideTarget: boolean;
        matchSize: {
            width: boolean;
            height: boolean;
        };
        matchFont: boolean;
        focus: boolean;
    }) => Promise<boolean> | boolean | void) | string;
    onCancel?: ((event: {
        oldValue: object;
        value: object;
        event: Event;
        source: Editor;
    }) => void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onComplete?: ((event: {
        oldValue: object;
        value: object;
        source: Editor;
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
    onKeyDown?: ((event: {
        event: Event;
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
    onStart?: ((event: {
        value: object;
        source: Editor;
    }) => void) | string;
};
export declare class BryntumEditor extends React.Component<BryntumEditorProps> {
    static instanceClass: typeof Editor;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: Editor;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumEditorProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
