import React from 'react';
import { AIFilterField } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumAIFilterField extends React.Component {
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
        const className = `b-react-a-i-filter-field-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumAIFilterField.instanceClass = AIFilterField;
BryntumAIFilterField.instanceName = 'AIFilterField';
BryntumAIFilterField.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoComplete',
    'autoSelect',
    'bubbleEvents',
    'centered',
    'clearable',
    'client',
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
    'listeners',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'maxLength',
    'minLength',
    'monitorResize',
    'name',
    'owner',
    'positioned',
    'preventTooltipOnTouch',
    'progressText',
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
    'weight'
];
BryntumAIFilterField.propertyConfigNames = [
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
BryntumAIFilterField.propertyNames = [
    'anchorSize',
    'content',
    'focusVisible',
    'formula',
    'html',
    'input',
    'parent',
    'scrollable'
];
//# sourceMappingURL=BryntumAIFilterField.js.map