import React from 'react';
import { AlignSpec, Base, ContainerItemConfig, Field, FieldContainer, FieldContainerConfig, FieldTriggerConfig, KeyMapConfig, MaskConfig, Model, NumberField, NumberFieldListeners, NumberFormatConfig, Rectangle, TabConfig, TooltipConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumNumberFieldProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoComplete?: string;
    autoSelect?: boolean;
    badge?: string;
    bubbleEvents?: object;
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    changeOnSpin?: boolean | number;
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
    format?: string | NumberFormatConfig;
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
    inputAlign?: string;
    inputAttributes?: Record<string, string>;
    inputTag?: string;
    inputType?: string;
    inputWidth?: string | number;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    keyMap?: Record<string, KeyMapConfig>;
    keyStrokeChangeDelay?: number;
    label?: string;
    labelCls?: string | object;
    labelPosition?: 'before' | 'above' | null;
    labels?: object[];
    labelWidth?: string | number;
    largeStep?: number;
    listeners?: NumberFieldListeners;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    max?: number;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxWidth?: string | number;
    min?: number;
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
    spellCheck?: boolean;
    step?: number;
    tab?: boolean | TabConfig;
    tabIndex?: number;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    title?: string;
    tooltip?: string | TooltipConfig | null;
    triggers?: Record<string, FieldTriggerConfig> | Record<string, Widget>;
    type?: 'numberfield' | 'number';
    ui?: string | object;
    validateOnInput?: boolean;
    value?: number;
    weight?: number;
    width?: string | number;
    wrapAround?: boolean;
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
export declare class BryntumNumberField extends React.Component<BryntumNumberFieldProps> {
    static instanceClass: typeof NumberField;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: NumberField;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumNumberFieldProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
