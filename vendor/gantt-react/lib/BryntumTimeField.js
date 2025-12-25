import React from 'react';
import { TimeField } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumTimeField extends React.Component {
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
        const className = `b-react-time-field-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumTimeField.instanceClass = TimeField;
BryntumTimeField.instanceName = 'TimeField';
BryntumTimeField.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoComplete',
    'autoExpand',
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
    'picker',
    'pickerAlignElement',
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
    'stepTriggers',
    'tab',
    'tabIndex',
    'textAlign',
    'title',
    'type',
    'ui',
    'validateOnInput',
    'weight'
];
BryntumTimeField.propertyConfigNames = [
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
    'format',
    'height',
    'hidden',
    'id',
    'insertBefore',
    'insertFirst',
    'keepDate',
    'keyMap',
    'label',
    'margin',
    'max',
    'maxHeight',
    'maximizeOnMobile',
    'maxWidth',
    'min',
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
BryntumTimeField.propertyNames = [
    'anchorSize',
    'content',
    'focusVisible',
    'formula',
    'html',
    'input',
    'parent',
    'scrollable'
];
//# sourceMappingURL=BryntumTimeField.js.map