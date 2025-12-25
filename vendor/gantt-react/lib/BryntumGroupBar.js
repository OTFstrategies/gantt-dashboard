import React from 'react';
import { GroupBar } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumGroupBar extends React.Component {
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
        const className = `b-react-group-bar-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumGroupBar.instanceClass = GroupBar;
BryntumGroupBar.instanceName = 'GroupBar';
BryntumGroupBar.configNames = [
    'activateOnMouseover',
    'adopt',
    'align',
    'allowGroupSelect',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'bubbleEvents',
    'centered',
    'clearSelectionOnEmptySpaceClick',
    'closable',
    'closeHandler',
    'color',
    'config',
    'constrainTo',
    'contentElementCls',
    'dataField',
    'defaultBindProperty',
    'detectCSSCompatibilityIssues',
    'displayField',
    'dock',
    'draggable',
    'elementAttributes',
    'floating',
    'getItemCls',
    'getItemStyle',
    'groupHeaderTpl',
    'hideAnimation',
    'htmlCls',
    'iconTpl',
    'ignoreParentReadOnly',
    'isSelectable',
    'itemTpl',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'monitorResize',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'selectAllItem',
    'showAnimation',
    'showTooltipWhenDisabled',
    'tab',
    'tag',
    'textAlign',
    'tooltipTemplate',
    'type',
    'ui',
    'weight'
];
BryntumGroupBar.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'collapsibleGroups',
    'column',
    'content',
    'dataset',
    'disabled',
    'emptyText',
    'extraData',
    'flex',
    'height',
    'hidden',
    'html',
    'id',
    'insertBefore',
    'insertFirst',
    'items',
    'keyMap',
    'margin',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'minHeight',
    'minWidth',
    'multiSelect',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeItem',
    'onBeforeShow',
    'onCatchAll',
    'onDestroy',
    'onElementCreated',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onItem',
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onSelectionChange',
    'onShow',
    'onToggleGroup',
    'onToggleNode',
    'readOnly',
    'rtl',
    'scrollable',
    'selected',
    'span',
    'store',
    'title',
    'toggleAllIfCtrlPressed',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumGroupBar.propertyNames = [
    'anchorSize',
    'focusVisible',
    'parent'
];
//# sourceMappingURL=BryntumGroupBar.js.map