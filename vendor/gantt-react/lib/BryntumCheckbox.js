import React from 'react';
import { Checkbox } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumCheckbox extends React.Component {
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
        const className = `b-react-checkbox-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumCheckbox.instanceClass = Checkbox;
BryntumCheckbox.instanceName = 'Checkbox';
BryntumCheckbox.configNames = [
    'adopt',
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'autoCollapse',
    'autoComplete',
    'autoSelect',
    'bubbleEvents',
    'centered',
    'checkedValue',
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
    'monitorResize',
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
    'text',
    'textAlign',
    'title',
    'type',
    'ui',
    'uncheckedValue',
    'validateOnInput',
    'weight'
];
BryntumCheckbox.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'badge',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'checked',
    'cls',
    'column',
    'dataset',
    'disabled',
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
    'name',
    'onAction',
    'onBeforeChange',
    'onBeforeDestroy',
    'onBeforeHide',
    'onBeforeShow',
    'onCatchAll',
    'onChange',
    'onClear',
    'onClick',
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
    'readOnly',
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
BryntumCheckbox.propertyNames = [
    'anchorSize',
    'content',
    'editable',
    'focusVisible',
    'html',
    'input',
    'parent',
    'placeholder',
    'scrollable'
];
//# sourceMappingURL=BryntumCheckbox.js.map