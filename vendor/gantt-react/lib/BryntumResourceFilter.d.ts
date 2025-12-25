import React from 'react';
import { AlignSpec, Base, Collection, CollectionConfig, DomConfig, Field, KeyMapConfig, List, MaskConfig, Model, Rectangle, ResourceFilter, ResourceFilterListeners, SchedulerEventStore, SchedulerResourceModel, Scroller, ScrollerConfig, Store, StoreConfig, TabConfig, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumResourceFilterProps = {
    activateOnMouseover?: boolean;
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    allowGroupSelect?: boolean;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    clearSelectionOnEmptySpaceClick?: boolean;
    cls?: string | object;
    collapsibleGroups?: boolean;
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
    displayField?: string;
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
    elementAttributes?: Record<string, string | null>;
    emptyText?: string;
    eventStore?: SchedulerEventStore;
    extraData?: any;
    filterResources?: boolean;
    flex?: number | string;
    floating?: boolean;
    getItemCls?: ((record: Model) => string) | string;
    getItemStyle?: ((record: Model) => string) | string;
    groupHeaderTpl?: (record: Model, groupName: string) => string;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    html?: string | ((widget: Widget) => string) | DomConfig | DomConfig[] | VueConfig;
    htmlCls?: string | object;
    id?: string;
    ignoreParentReadOnly?: boolean;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    isSelectable?: (() => boolean) | string;
    items?: object[];
    itemTpl?: ((record: Model) => string) | string;
    keyMap?: Record<string, KeyMapConfig>;
    listeners?: ResourceFilterListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    masterFilter?: ((resource: SchedulerResourceModel) => boolean) | string;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxWidth?: string | number;
    minHeight?: string | number;
    minWidth?: string | number;
    monitorResize?: boolean | {
        immediate?: boolean;
    };
    multiSelect?: boolean;
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
    selectAllItem?: boolean | string;
    selected?: object[] | number[] | string[] | Collection | CollectionConfig | CollectionConfig[];
    showAnimation?: boolean | object;
    showTooltipWhenDisabled?: boolean;
    span?: number;
    store?: object | object[] | StoreConfig | Store | StoreConfig[];
    tab?: boolean | TabConfig;
    tag?: string;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    title?: string;
    toggleAllIfCtrlPressed?: boolean;
    tooltip?: string | TooltipConfig | null;
    tooltipTemplate?: (record: Model) => string;
    type?: 'resourceFilter' | 'resourcefilter';
    ui?: string | object;
    useResourceColor?: boolean;
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
    onBeforeItem?: ((event: {
        source: List;
        item: HTMLElement;
        record: Model;
        index: number;
        event: Event;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeShow?: ((event: {
        source: Widget | any;
    }) => Promise<boolean> | boolean | void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onChange?: ((event: {
        value: string;
        oldValue: string;
        source: Field;
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
    onItem?: ((event: {
        source: List;
        item: HTMLElement;
        record: Model;
        index: number;
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
    onSelectionChange?: ((event: {
        source: List;
        selected: Model[];
    }) => void) | string;
    onShow?: ((event: {
        source: Widget;
    }) => void) | string;
    onToggleGroup?: ((event: {
        groupRecord: Model;
        collapse: boolean;
    }) => void) | string;
    onToggleNode?: ((event: {
        record: Model;
        collapse: boolean;
    }) => void) | string;
};
export declare class BryntumResourceFilter extends React.Component<BryntumResourceFilterProps> {
    static instanceClass: typeof ResourceFilter;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: ResourceFilter;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumResourceFilterProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
