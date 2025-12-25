import React from 'react';
import { PagingToolbar } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumPagingToolbar extends React.Component {
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
        const className = `b-react-paging-toolbar-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumPagingToolbar.instanceClass = PagingToolbar;
BryntumPagingToolbar.instanceName = 'PagingToolbar';
BryntumPagingToolbar.configNames = [
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
    'defaultBindProperty',
    'defaultFocus',
    'defaults',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
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
    'overflow',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
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
    'type',
    'ui',
    'weight',
    'widgetCls'
];
BryntumPagingToolbar.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'column',
    'content',
    'dataset',
    'disabled',
    'enableReordering',
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
    'onBeforeItemDragStart',
    'onBeforeSetRecord',
    'onBeforeShow',
    'onCatchAll',
    'onDestroy',
    'onDirtyStateChange',
    'onElementCreated',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onItemDragStart',
    'onItemDrop',
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
    'tools',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumPagingToolbar.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'values'
];
//# sourceMappingURL=BryntumPagingToolbar.js.map