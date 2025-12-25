import React from 'react';
import { FieldFilterPicker } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumFieldFilterPicker extends React.Component {
    constructor() {
        super(...arguments);
        this.processWidgetContent = processWidgetContent;
    }
    componentDidMount() {
        this.instance = createWidget(this);
    }
    componentWillUnmount() {
        var _a, _b;
        (_b = (_a = this.instance) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return shouldComponentUpdate(this, nextProps, nextState);
    }
    render() {
        const className = `b-react-field-filter-picker-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumFieldFilterPicker.instanceClass = FieldFilterPicker;
BryntumFieldFilterPicker.instanceName = 'FieldFilterPicker';
BryntumFieldFilterPicker.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'bubbleEvents',
    'centered',
    'color',
    'config',
    'constrainTo',
    'contentElementCls',
    'dataField',
    'dateFormat',
    'defaultBindProperty',
    'defaultFocus',
    'defaults',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
    'fields',
    'filter',
    'floating',
    'getValueFieldConfig',
    'hideAnimation',
    'hideWhenEmpty',
    'htmlCls',
    'ignoreParentReadOnly',
    'itemCls',
    'lazyItems',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'monitorResize',
    'namedItems',
    'operatorLocked',
    'operators',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'propertyFieldConfig',
    'propertyLocked',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAnimation',
    'showTooltipWhenDisabled',
    'store',
    'tab',
    'tabBarItems',
    'tag',
    'textAlign',
    'textContent',
    'title',
    'triggerChangeOnInput',
    'type',
    'ui',
    'valueFieldPlaceholders',
    'valueLocked',
    'weight'
];
BryntumFieldFilterPicker.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'column',
    'content',
    'dataset',
    'disabled',
    'extraData',
    'flex',
    'height',
    'hidden',
    'html',
    'id',
    'inputFieldAlign',
    'insertBefore',
    'insertFirst',
    'items',
    'keyMap',
    'labelPosition',
    'layout',
    'layoutStyle',
    'margin',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'minHeight',
    'minWidth',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeSetRecord',
    'onBeforeShow',
    'onCatchAll',
    'onChange',
    'onDestroy',
    'onDirtyStateChange',
    'onElementCreated',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onShow',
    'readOnly',
    'record',
    'rendition',
    'rtl',
    'scrollable',
    'span',
    'strictRecordMapping',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumFieldFilterPicker.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'values'
];
//# sourceMappingURL=BryntumFieldFilterPicker.js.map