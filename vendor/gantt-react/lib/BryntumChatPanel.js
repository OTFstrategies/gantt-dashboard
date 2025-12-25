import React from 'react';
import { ChatPanel } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumChatPanel extends React.Component {
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
        const className = `b-react-chat-panel-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumChatPanel.instanceClass = ChatPanel;
BryntumChatPanel.instanceName = 'ChatPanel';
BryntumChatPanel.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoUpdateRecord',
    'bbar',
    'bodyCls',
    'bubbleEvents',
    'centered',
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
BryntumChatPanel.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'avatar',
    'bubbleTools',
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
    'intro',
    'items',
    'keyMap',
    'labelPosition',
    'layout',
    'layoutStyle',
    'margin',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'messages',
    'minHeight',
    'minWidth',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeSetRecord',
    'onBeforeShow',
    'onBeforeStateApply',
    'onBeforeStateSave',
    'onBubbleToolClick',
    'onCatchAll',
    'onCollapse',
    'onDestroy',
    'onDirtyStateChange',
    'onElementCreated',
    'onExpand',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onLocalMessage',
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
    'showTimestamp',
    'span',
    'strictRecordMapping',
    'title',
    'tools',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumChatPanel.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'state',
    'store',
    'values'
];
//# sourceMappingURL=BryntumChatPanel.js.map