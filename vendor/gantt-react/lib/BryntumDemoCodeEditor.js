import React from 'react';
import { DemoCodeEditor } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumDemoCodeEditor extends React.Component {
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
        const className = `b-react-demo-code-editor-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumDemoCodeEditor.instanceClass = DemoCodeEditor;
BryntumDemoCodeEditor.instanceName = 'DemoCodeEditor';
BryntumDemoCodeEditor.configNames = [
    'adopt',
    'align',
    'anchor',
    'appFolder',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'bbar',
    'bodyCls',
    'bubbleEvents',
    'centered',
    'codePath',
    'collapsible',
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
    'drawer',
    'editor',
    'elementAttributes',
    'floating',
    'footer',
    'header',
    'hideAnimation',
    'hideWhenEmpty',
    'htmlCls',
    'icon',
    'ignoreParentReadOnly',
    'itemCls',
    'lazyItems',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'mode',
    'monitorResize',
    'namedItems',
    'owner',
    'positioned',
    'preferredSources',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAnimation',
    'showTooltipWhenDisabled',
    'stateful',
    'statefulEvents',
    'stateId',
    'stateProvider',
    'strips',
    'tab',
    'tabBarItems',
    'tag',
    'tbar',
    'textAlign',
    'textContent',
    'trapFocus',
    'type',
    'ui',
    'weight'
];
BryntumDemoCodeEditor.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'collapsed',
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
    'language',
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
    'onBeforeStateApply',
    'onBeforeStateSave',
    'onCatchAll',
    'onCollapse',
    'onDestroy',
    'onDirtyStateChange',
    'onElementCreated',
    'onExpand',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onShow',
    'onToolClick',
    'readOnly',
    'record',
    'rendition',
    'rtl',
    'scrollable',
    'span',
    'status',
    'strictRecordMapping',
    'text',
    'theme',
    'title',
    'tools',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumDemoCodeEditor.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'state',
    'values'
];
//# sourceMappingURL=BryntumDemoCodeEditor.js.map