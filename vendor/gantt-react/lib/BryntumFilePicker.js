import React from 'react';
import { FilePicker } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumFilePicker extends React.Component {
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
        const className = `b-react-file-picker-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumFilePicker.instanceClass = FilePicker;
BryntumFilePicker.instanceName = 'FilePicker';
BryntumFilePicker.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'bubbleEvents',
    'buttonConfig',
    'centered',
    'color',
    'config',
    'constrainTo',
    'contentElementCls',
    'dataField',
    'defaultBindProperty',
    'defaultFocus',
    'defaults',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
    'fileFieldConfig',
    'floating',
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
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAnimation',
    'showTooltipWhenDisabled',
    'tab',
    'tabBarItems',
    'tag',
    'textAlign',
    'textContent',
    'title',
    'type',
    'ui',
    'weight'
];
BryntumFilePicker.propertyConfigNames = [
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
    'onClear',
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
    'showBadge',
    'span',
    'strictRecordMapping',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumFilePicker.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'values'
];
//# sourceMappingURL=BryntumFilePicker.js.map