import React from 'react';
import { ResourceFilter } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumResourceFilter extends React.Component {
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
        const className = `b-react-resource-filter-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumResourceFilter.instanceClass = ResourceFilter;
BryntumResourceFilter.instanceName = 'ResourceFilter';
BryntumResourceFilter.configNames = [
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
    'eventStore',
    'filterResources',
    'floating',
    'getItemCls',
    'getItemStyle',
    'groupHeaderTpl',
    'hideAnimation',
    'htmlCls',
    'ignoreParentReadOnly',
    'isSelectable',
    'itemTpl',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'masterFilter',
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
    'useResourceColor',
    'weight'
];
BryntumResourceFilter.propertyConfigNames = [
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
    'onChange',
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
BryntumResourceFilter.propertyNames = [
    'anchorSize',
    'focusVisible',
    'parent'
];
//# sourceMappingURL=BryntumResourceFilter.js.map