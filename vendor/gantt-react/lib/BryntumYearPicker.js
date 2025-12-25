import React from 'react';
import { YearPicker } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumYearPicker extends React.Component {
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
        const className = `b-react-year-picker-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumYearPicker.instanceClass = YearPicker;
BryntumYearPicker.instanceName = 'YearPicker';
BryntumYearPicker.configNames = [
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
    'maxYear',
    'minYear',
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
    'weight',
    'yearButtonCount'
];
BryntumYearPicker.propertyConfigNames = [
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
    'onSelect',
    'onShow',
    'onToolClick',
    'readOnly',
    'record',
    'rendition',
    'rtl',
    'scrollable',
    'span',
    'startYear',
    'strictRecordMapping',
    'title',
    'tools',
    'tooltip',
    'width',
    'x',
    'y',
    'year'
];
BryntumYearPicker.propertyNames = [
    'anchorSize',
    'focusVisible',
    'hasChanges',
    'isSettingValues',
    'isValid',
    'parent',
    'state',
    'value',
    'values'
];
//# sourceMappingURL=BryntumYearPicker.js.map