import React from 'react';
import { ViewPresetCombo } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumViewPresetCombo extends React.Component {
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
        const className = `b-react-view-preset-combo-container`;
        return (React.createElement("div", { className: className, ref: (element) => (this.element = element) }));
    }
}
BryntumViewPresetCombo.instanceClass = ViewPresetCombo;
BryntumViewPresetCombo.instanceName = 'ViewPresetCombo';
BryntumViewPresetCombo.configNames = [
    'align',
    'anchor',
    'ariaDescription',
    'ariaLabel',
    'bubbleEvents',
    'cacheLastResult',
    'centered',
    'clearTextOnSelection',
    'clearWhenInputEmpty',
    'client',
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
    'hideAnimation',
    'hidePickerOnSelect',
    'hint',
    'hintHtml',
    'ignoreParentReadOnly',
    'inputAlign',
    'inputAttributes',
    'inputTag',
    'inputWidth',
    'labelCls',
    'labelPosition',
    'labels',
    'labelWidth',
    'listCls',
    'listeners',
    'listItemTpl',
    'localeClass',
    'localizable',
    'localizableProperties',
    'maskDefaults',
    'masked',
    'monitorResize',
    'name',
    'overlayAnchor',
    'owner',
    'pickerWidth',
    'positioned',
    'presets',
    'preventTooltipOnTouch',
    'relayStoreEvents',
    'ripple',
    'rootElement',
    'scrollAction',
    'showAnimation',
    'showTooltipWhenDisabled',
    'skipValidation',
    'tab',
    'tabIndex',
    'textAlign',
    'type',
    'ui',
    'useFixedDuration',
    'weight'
];
BryntumViewPresetCombo.propertyConfigNames = [
    'alignSelf',
    'appendTo',
    'badge',
    'callOnFunctions',
    'catchEventHandlerExceptions',
    'cls',
    'column',
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
    'onPaint',
    'onReadOnly',
    'onRecompose',
    'onResize',
    'onSelect',
    'onShow',
    'onTrigger',
    'readOnly',
    'rendition',
    'rtl',
    'showRequiredIndicator',
    'span',
    'width',
    'x',
    'y'
];
BryntumViewPresetCombo.propertyNames = [
    'anchorSize',
    'focusVisible',
    'formula',
    'input',
    'multiSelect',
    'parent',
    'picker',
    'placeholder',
    'required',
    'tooltip',
    'value'
];
//# sourceMappingURL=BryntumViewPresetCombo.js.map