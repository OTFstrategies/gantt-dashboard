import React from 'react';
import { EventColorField } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumEventColorField extends React.Component {
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
        const className = `b-react-event-color-field-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumEventColorField.instanceClass = EventColorField;
BryntumEventColorField.instanceName = 'EventColorField';
BryntumEventColorField.configNames = [
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
    'tab',
    'tabIndex',
    'textAlign',
    'title',
    'type',
    'ui',
    'validateOnInput',
    'weight'
];
BryntumEventColorField.propertyConfigNames = [
    'addNoColorItem',
    'alignSelf',
    'appendTo',
    'badge',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'colors',
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
BryntumEventColorField.propertyNames = [
    'anchorSize',
    'content',
    'editable',
    'focusVisible',
    'formula',
    'html',
    'input',
    'parent',
    'scrollable'
];
//# sourceMappingURL=BryntumEventColorField.js.map