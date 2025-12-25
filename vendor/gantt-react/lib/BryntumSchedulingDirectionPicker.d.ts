import React from 'react';
import { AlignSpec, Base, ChipViewConfig, CollectionCompareOperator, CollectionFilterConfig, Combo, ComboModel, ContainerItemConfig, Duration, DurationConfig, Field, FieldContainer, FieldContainerConfig, FieldTriggerConfig, KeyMapConfig, List, ListConfig, MaskConfig, Model, Rectangle, SchedulingDirectionPicker, SchedulingDirectionPickerListeners, Store, StoreConfig, TabConfig, TooltipConfig, Widget } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumSchedulingDirectionPickerProps = {
    adopt?: HTMLElement | string;
    align?: AlignSpec | string;
    alignSelf?: string;
    anchor?: boolean;
    appendTo?: HTMLElement | string;
    ariaDescription?: string;
    ariaLabel?: string;
    autoComplete?: string;
    autoExpand?: boolean;
    autoSelect?: boolean;
    badge?: string;
    bubbleEvents?: object;
    cacheLastResult?: number | string | Duration | DurationConfig;
    callOnFunctions?: boolean;
    caseSensitive?: boolean;
    catchEventHandlerExceptions?: boolean;
    centered?: boolean;
    chipView?: ChipViewConfig;
    clearable?: boolean | FieldTriggerConfig;
    clearTextOnPickerHide?: boolean;
    clearTextOnSelection?: boolean;
    clearWhenInputEmpty?: boolean;
    cls?: string | object;
    color?: string;
    column?: number;
    config?: object;
    constrainTo?: HTMLElement | Widget | Rectangle;
    container?: Record<string, ContainerItemConfig> | ContainerItemConfig[] | FieldContainerConfig | FieldContainer;
    containValues?: boolean | string | ((field: Field) => boolean);
    contentElementCls?: string | object;
    createOnUnmatched?: ((name: string, combo: Combo) => Model) | string | boolean;
    dataField?: string;
    dataset?: Record<string, string>;
    defaultBindProperty?: string;
    detectCSSCompatibilityIssues?: boolean;
    disabled?: boolean | 'inert';
    displayField?: string;
    displayValueRenderer?: (record: Model | ComboModel, combo: Combo) => string | void;
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'header' | 'pre-header' | object;
    draggable?: boolean | {
        handleSelector?: string;
    };
    editable?: boolean;
    elementAttributes?: Record<string, string | null>;
    emptyText?: string;
    encodeFilterParams?: (filters: object[]) => object[];
    extraData?: any;
    filterOnEnter?: boolean;
    filterOperator?: CollectionCompareOperator;
    filterParamName?: string;
    filterSelected?: boolean;
    flex?: number | string;
    floating?: boolean;
    height?: string | number;
    hidden?: boolean;
    hideAnimation?: boolean | object;
    hidePickerOnSelect?: boolean;
    hideTrigger?: boolean;
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
    inlinePicker?: boolean;
    inputAlign?: string;
    inputAttributes?: Record<string, string>;
    inputTag?: string;
    inputType?: string;
    inputWidth?: string | number;
    insertBefore?: HTMLElement | string;
    insertFirst?: HTMLElement | string;
    items?: object[] | string[] | object;
    keyMap?: Record<string, KeyMapConfig>;
    keyStrokeChangeDelay?: number;
    keyStrokeFilterDelay?: number;
    label?: string;
    labelCls?: string | object;
    labelPosition?: 'before' | 'above' | null;
    labels?: object[];
    labelWidth?: string | number;
    listCls?: string;
    listeners?: SchedulingDirectionPickerListeners;
    listItemTpl?: (record: Model | ComboModel) => string | void;
    localeClass?: typeof Base;
    localizable?: boolean;
    localizableProperties?: string[];
    margin?: number | string;
    maskDefaults?: MaskConfig;
    masked?: boolean | string | MaskConfig;
    maxHeight?: string | number;
    maximizeOnMobile?: number | string;
    maxLength?: number;
    maxWidth?: string | number;
    minChars?: number;
    minHeight?: string | number;
    minLength?: number;
    minWidth?: string | number;
    monitorResize?: boolean | {
        immediate?: boolean;
    };
    multiSelect?: boolean;
    multiValueSeparator?: string;
    name?: string;
    overlayAnchor?: boolean;
    owner?: Widget | any;
    picker?: ListConfig | List;
    pickerAlignElement?: string;
    pickerWidth?: number | string;
    placeholder?: string;
    positioned?: boolean;
    preventTooltipOnTouch?: boolean;
    primaryFilter?: CollectionFilterConfig;
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
    store?: Store | StoreConfig;
    tab?: boolean | TabConfig;
    tabIndex?: number;
    textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
    title?: string;
    tooltip?: string | TooltipConfig | null;
    triggerAction?: 'all' | 'last' | null;
    triggers?: Record<string, FieldTriggerConfig> | Record<string, Widget>;
    type?: 'schedulingdirectionpicker';
    ui?: string | object;
    validateFilter?: boolean;
    validateOnInput?: boolean;
    value?: string | number | string[] | number[];
    valueField?: string | null;
    weight?: number;
    width?: string | number;
    x?: number;
    y?: number;
    onAction?: ((event: {
        source: Combo;
        value: any;
        record: Model;
        records: Model[];
        userAction: boolean;
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
        source: Combo;
        value: string;
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
    onSelect?: ((event: {
        source: Combo;
        record: Model;
        records: Model[];
        userAction: boolean;
    }) => void) | string;
    onShow?: ((event: {
        source: Widget;
    }) => void) | string;
    onTrigger?: ((event: {
        source: Field | any;
        trigger: Widget;
    }) => void) | string;
};
export declare class BryntumSchedulingDirectionPicker extends React.Component<BryntumSchedulingDirectionPickerProps> {
    static instanceClass: typeof SchedulingDirectionPicker;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: SchedulingDirectionPicker;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumSchedulingDirectionPickerProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
