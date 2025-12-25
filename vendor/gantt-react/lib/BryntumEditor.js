import React from 'react';
import { Editor } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumEditor extends React.Component {
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
        const className = `b-react-editor-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumEditor.instanceClass = Editor;
BryntumEditor.instanceName = 'Editor';
BryntumEditor.configNames = [
    'adopt',
    'align',
    'anchor',
    'appendToTargetParent',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'blurAction',
    'bubbleEvents',
    'cancelKey',
    'centered',
    'color',
    'completeKey',
    'completeOnChange',
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
    'fitTargetContent',
    'floating',
    'hideAnimation',
    'hideTarget',
    'hideWhenEmpty',
    'htmlCls',
    'ignoreParentReadOnly',
    'invalidAction',
    'itemCls',
    'lazyItems',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'matchFont',
    'matchSize',
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
BryntumEditor.propertyConfigNames = [
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
    'inputField',
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
    'onAfterEdit',
    'onBeforeCancel',
    'onBeforeComplete',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeSetRecord',
    'onBeforeShow',
    'onBeforeStart',
    'onCancel',
    'onCatchAll',
    'onComplete',
    'onDestroy',
    'onDirtyStateChange',
    'onElementCreated',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onKeyDown',
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onShow',
    'onStart',
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
BryntumEditor.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'values'
];
//# sourceMappingURL=BryntumEditor.js.map