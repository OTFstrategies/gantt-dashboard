import React from 'react';
import { GridChartDesigner } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumGridChartDesigner extends React.Component {
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
        const className = `b-react-grid-chart-designer-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumGridChartDesigner.instanceClass = GridChartDesigner;
BryntumGridChartDesigner.instanceName = 'GridChartDesigner';
BryntumGridChartDesigner.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'bubbleEvents',
    'centered',
    'color',
    'config',
    'constrainTo',
    'contentElementCls',
    'dataField',
    'defaultBindProperty',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
    'floating',
    'grid',
    'hideAnimation',
    'htmlCls',
    'ignoreParentReadOnly',
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
    'showAnimation',
    'showTooltipWhenDisabled',
    'sync',
    'tab',
    'tag',
    'textAlign',
    'title',
    'type',
    'ui',
    'weight'
];
BryntumGridChartDesigner.propertyConfigNames = [
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
    'insertBefore',
    'insertFirst',
    'keyMap',
    'margin',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'minHeight',
    'minWidth',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeShow',
    'onCatchAll',
    'onDestroy',
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
    'rtl',
    'scrollable',
    'span',
    'tooltip',
    'width',
    'x',
    'y'
];
BryntumGridChartDesigner.propertyNames = [
    'anchorSize',
    'focusVisible',
    'parent'
];
//# sourceMappingURL=BryntumGridChartDesigner.js.map