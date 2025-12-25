import React from 'react';
import { AlignSpec, Base, ContainerItemConfig, DateFieldConfig, DateTimeField, DateTimeFieldListeners, Field, FieldContainer, FieldContainerConfig, FieldTriggerConfig, KeyMapConfig, MaskConfig, Model, Rectangle, TabConfig, TimeFieldConfig, TooltipConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumDateTimeFieldProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoSelect?: boolean;
    badge?: string;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    clearable?: boolean | FieldTriggerConfig;
    cls?: string | object;
    color?: string;
    column?: number;
    config?: object;
    constrainTo?: HTMLElement | Widget | Rectangle;
    container?: Record<string, ContainerItemConfig> | ContainerItemConfig[] | FieldContainerConfig | FieldContainer;
    containValues?: boolean | string | ((field: Field) => boolean);
    contentElementCls?: string | object;
    dataField?: string;
    dataset?: Record<string, string>;
    dateField?: DateFieldConfig;
    defaultBindProperty?: string;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
    editable?: boolean;
    elementAttributes?: Record<string, string | null>;
    extraData?: any;
    flex?: number | string;
    floating?: boolean;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    highlightExternalChange?: boolean;
    hint?: string | ((data: {
        source: Field;
        value: any;
    }) => string);
    hintHtml?: string | ((data: {
        source: Field;
        value: any;
    }) => string);
    id?: string;
    ignoreParentReadOnly?: boolean;
    inline?: boolean;
    inputTag?: string;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    keyStrokeChangeDelay?: number;
    label?: string;
    labelCls?: string | object;
    labelPosition?: 'before' | 'above' | null;
    labels?: object[];
    labelWidth?: string | number;
    listeners?: DateTimeFieldListeners;
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
    name?: string;
    owner?: Widget | any;
    placeholder?: string;
    positioned?: boolean;
    preventTooltipOnTouch?: boolean;
    readOnly?: boolean;
    relayStoreEvents?: boolean;
    rendition?: 'outlined' | 'filled' | string;
    required?: boolean;
    revertOnEscape?: boolean;
    ripple?: boolean | {
        delegate?: string;
        color?: string;
        radius?: number;
        clip?: string;
    };
    rootElement?: ShadowRoot | HTMLElement;
    rtl?: boolean;
    scrollAction?: 'hide' | 'realign' | null;
    showAnimation?: boolean | object;
    showRequiredIndicator?: string;
    showTooltipWhenDisabled?: boolean;
    skipValidation?: boolean;
    span?: number;
    tab?: boolean | TabConfig;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    timeField?: TimeFieldConfig;
    title?: string;
    tooltip?: string | TooltipConfig | null;
    triggers?: Record<string, FieldTriggerConfig> | Record<string, Widget>;
    type?: 'datetimefield' | 'datetime';
    ui?: string | object;
    value?: string;
    weekStartDay?: number;
    weight?: number;
    width?: string | number;
    x?: number;
    y?: number;
    onAction?: ((event: {
        source: Field | any;
        value: string | number | boolean | any;
        oldValue: string | number | boolean | any;
        valid: boolean;
        event: Event;
        record: Model;
        records: Model[];
        userAction: boolean;
        checked: boolean;
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
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onChange?: ((event: {
        source: Field | any;
        value: string | number | boolean | any;
        oldValue: string | number | boolean | any;
        valid: boolean;
        event: Event;
        userAction: boolean;
        checked: boolean;
    }) => void) | string;
    onClear?: ((event: {
        source: Field | any;
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
    onInput?: ((event: {
        source: Field | any;
        value: string | number | boolean | any;
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
    onTrigger?: ((event: {
        source: Field | any;
        trigger: Widget;
    }) => void) | string;
};
export declare class BryntumDateTimeField extends React.Component<BryntumDateTimeFieldProps> {
    static instanceClass: typeof DateTimeField;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: DateTimeField;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumDateTimeFieldProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
