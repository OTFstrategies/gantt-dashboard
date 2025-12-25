import React from 'react';
import { NumberField } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumNumberField extends React.Component {
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
        const className = `b-react-number-field-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumNumberField.instanceClass = NumberField;
BryntumNumberField.instanceName = 'NumberField';
BryntumNumberField.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoComplete',
    'autoSelect',
    'bubbleEvents',
    'centered',
    'changeOnSpin',
    'clearable',
    'color',
    'config',
    'constrainTo',
    'container',
    'containValues',
    'contentElementCls',
    'dataField',
    'defaultBindProperty',
    'detectCSSCompatibilityIssues',
    'dock',
    'draggable',
    'elementAttributes',
    'floating',
    'format',
    'hideAnimation',
    'highlightExternalChange',
    'hint',
    'hintHtml',
    'ignoreParentReadOnly',
    'inline',
    'inputAlign',
    'inputAttributes',
    'inputTag',
    'inputType',
    'inputWidth',
    'keyStrokeChangeDelay',
    'labelCls',
    'labelPosition',
    'labels',
    'labelWidth',
    'largeStep',
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'max',
    'min',
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
    'spellCheck',
    'tab',
    'tabIndex',
    'textAlign',
    'title',
    'type',
    'ui',
    'validateOnInput',
    'weight',
    'wrapAround'
];
BryntumNumberField.propertyConfigNames = [
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
    'step',
    'tooltip',
    'triggers',
    'value',
    'width',
    'x',
    'y'
];
BryntumNumberField.propertyNames = [
    'anchorSize',
    'content',
    'focusVisible',
    'html',
    'input',
    'parent',
    'scrollable'
];
//# sourceMappingURL=BryntumNumberField.js.map