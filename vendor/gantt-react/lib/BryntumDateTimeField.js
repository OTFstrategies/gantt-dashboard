import React from 'react';
import { DateTimeField } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumDateTimeField extends React.Component {
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
        const className = `b-react-date-time-field-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumDateTimeField.instanceClass = DateTimeField;
BryntumDateTimeField.instanceName = 'DateTimeField';
BryntumDateTimeField.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoSelect',
    'bubbleEvents',
    'centered',
    'clearable',
    'color',
    'config',
    'constrainTo',
    'container',
    'containValues',
    'contentElementCls',
    'dataField',
    'dateField',
    'defaultBindProperty',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
    'floating',
    'hideAnimation',
    'highlightExternalChange',
    'hint',
    'hintHtml',
    'ignoreParentReadOnly',
    'inline',
    'inputTag',
    'keyStrokeChangeDelay',
    'labelCls',
    'labelPosition',
    'labels',
    'labelWidth',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'monitorResize',
    'name',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'revertOnEscape',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAnimation',
    'showTooltipWhenDisabled',
    'skipValidation',
    'tab',
    'textAlign',
    'timeField',
    'title',
    'type',
    'ui',
    'weekStartDay',
    'weight'
];
BryntumDateTimeField.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'badge',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'column',
    'dataset',
    'disabled',
    'editable',
    'extraData',
    'flex',
    'height',
    'hidden',
    'id',
    'insertBefore',
    'insertFirst',
    'keyMap',
    'label',
    'margin',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'minHeight',
    'minWidth',
    'onAction',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeShow',
    'onCatchAll',
    'onChange',
    'onClear',
    'onDestroy',
    'onElementCreated',
    'onFocusIn',
    'onFocusOut',
    'onHide',
    'onInput',
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onShow',
    'onTrigger',
    'placeholder',
    'readOnly',
    'rendition',
    'required',
    'rtl',
    'showRequiredIndicator',
    'span',
    'tooltip',
    'triggers',
    'value',
    'width',
    'x',
    'y'
];
BryntumDateTimeField.propertyNames = [
    'anchorSize',
    'content',
    'focusVisible',
    'html',
    'input',
    'parent',
    'scrollable'
];
//# sourceMappingURL=BryntumDateTimeField.js.map