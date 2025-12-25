import React from 'react';
import { FieldFilterPickerGroup } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumFieldFilterPickerGroup extends React.Component {
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
        const className = `b-react-field-filter-picker-group-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumFieldFilterPickerGroup.instanceClass = FieldFilterPickerGroup;
BryntumFieldFilterPickerGroup.instanceName = 'FieldFilterPickerGroup';
BryntumFieldFilterPickerGroup.configNames = [
    'addFilterButtonText',
    'adopt',
    'align',
    'allowedFieldNames',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'bubbleEvents',
    'canDeleteFilter',
    'canManageFilter',
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
    'filters',
    'floating',
    'getFieldFilterPickerConfig',
    'hideAnimation',
    'hideWhenEmpty',
    'htmlCls',
    'ignoreParentReadOnly',
    'itemCls',
    'lazyItems',
    'limitToProperty',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'monitorResize',
    'namedItems',
    'operators',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAddFilterButton',
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
    'weight'
];
BryntumFieldFilterPickerGroup.propertyConfigNames = [
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
    'onBeforeAddFilter',
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
BryntumFieldFilterPickerGroup.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'value',
    'values'
];
//# sourceMappingURL=BryntumFieldFilterPickerGroup.js.map