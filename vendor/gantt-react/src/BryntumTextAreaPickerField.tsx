/**
 * React wrapper for Bryntum TextAreaPickerField
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AlignSpec, Base, ContainerItemConfig, DomConfig, Field, FieldContainer, FieldContainerConfig, FieldTriggerConfig, KeyMapConfig, MaskConfig, Model, Rectangle, Scroller, TabConfig, TextAreaPickerField, TextAreaPickerFieldListeners, TooltipConfig, VueConfig, Widget, WidgetConfig } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumTextAreaPickerFieldProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-align)
     */
    align? : AlignSpec|string
    /**
     * When this widget is a child of a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container), it will by default be participating in a
     * flexbox layout. This config allows you to set this widget's
     * [align-self](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self) style.
     */
    alignSelf? : string
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating) and being shown through [showBy](#Core/widget/Widget#function-showBy).*
     * `true` to show a connector arrow pointing to the align target.
     */
    anchor? : boolean
    /**
     * Element (or the id of an element) to append this widget's element to. Can be configured, or set once at
     * runtime. To access the element of a rendered widget, see [element](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-element).
     */
    appendTo? : HTMLElement|string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject
     * into an element which will be linked using the `aria-describedby` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Sets the native `autocomplete` property of the underlying input element. For more information, please refer to
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
     */
    autoComplete? : string
    /**
     * Configure as `true` to have the picker expand upon focus enter.
     */
    autoExpand? : boolean
    /**
     * Specify `true` to auto select field contents on focus
     */
    autoSelect? : boolean
    /**
     * Initial text to show in badge.
     */
    badge? : string
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to centre the Widget in browser viewport space.
     */
    centered? : boolean
    /**
     * Show a trigger to clear field, if this field is not [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-readOnly). The trigger is available
     * in the [triggers](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-triggers) object under the name `clear`. May also be an object which
     * configures the `clear` [trigger](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-triggers).
     */
    clearable? : boolean|FieldTriggerConfig
    /**
     * Custom CSS classes to add to element.
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-cls)
     */
    cls? : string|object
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-color)
     */
    color? : string
    /**
     * Programmatic control over which column to start in when used in a grid layout.
     */
    column? : number
    config? : object
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating) or [positioned](#Core/widget/Widget#config-positioned).*
     * Element, Widget or Rectangle to which this Widget is constrained.
     */
    constrainTo? : HTMLElement|Widget|Rectangle
    /**
     * The configuration for additional items associated to this field. This is typically used to add contextual
     * fields related to a [checkbox](https://bryntum.com/products/gantt/docs/api/Core/widget/Checkbox) or [radio button](#Core/widget/Radio). See
     * these classes for examples of nested fields.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-container)
     */
    container? : Record<string, ContainerItemConfig>|ContainerItemConfig[]|FieldContainerConfig|FieldContainer
    /**
     * The config controls how the value of nested items are handled when a parent container gets or sets its
     * [values](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-values).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-containValues)
     * @param {Core.widget.Field} field Field instance
     * @returns {boolean}
     */
    containValues? : boolean|string|((field: Field) => boolean)
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-contentElementCls)
     */
    contentElementCls? : string|object
    /**
     * When this Widget configuration is used in the Grid's RowExpander feature's `widget` config, provide the
     * field on the expanded record to use for populating this widget's store (if applicable)
     */
    dataField? : string
    /**
     * Object to apply to elements dataset (each key will be used as a data-attribute on the element)
     */
    dataset? : Record<string, string>
    /**
     * The name of the property to set when a single value is to be applied to this Widget. Such as when used
     * in a grid WidgetColumn, this is the property to which the column's `field` is applied.
     */
    defaultBindProperty? : string
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-disabled)
     */
    disabled? : boolean|'inert'
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to be able to drag a widget freely on the page. Or set to an object with a ´handleSelector´
     * property which controls when a drag should start.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-draggable)
     */
    draggable? : boolean|{
        handleSelector?: string
    }
    /**
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-elementAttributes)
     */
    elementAttributes? : Record<string, string|null>
    extraData? : any
    /**
     * When this widget is a child of a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container), it will by default be participating in a
     * flexbox layout. This config allows you to set this widget's
     * [flex](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) style.
     * This may be configured as a single number or a `&lt;flex-grow&gt; &lt;flex-shrink&gt; &lt;flex-basis&gt;` format string.
     * numeric-only values are interpreted as the `flex-grow` value.
     */
    flex? : number|string
    /**
     * Set to `true` to move the widget out of the document flow and position it
     * absolutely in browser viewport space.
     */
    floating? : boolean
    /**
     * Widget's height, used to set element `style.height`. Either specify a valid height string or a number,
     * which will get 'px' appended. We recommend using CSS as the primary way to control height, but in some
     * cases this config is convenient.
     */
    height? : string|number
    /**
     * Configure with true to make widget initially hidden.
     */
    hidden? : boolean
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-hideAnimation)
     */
    hideAnimation? : boolean|object
    /**
     * Specify `true` to highlight field after external value changes
     */
    highlightExternalChange? : boolean
    /**
     * An optional string to display inside the input field as an overlay. This can be useful for displaying
     * a field's units.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-hint)
     * @param {object} data A data object
     * @param {Core.widget.Field} data.source A reference to the field instance
     * @param {any} data.value The current value of the field
     * @returns {string}
     */
    hint? : string|((data: { source: Field, value: any }) => string)
    /**
     * This config is similar to [hint](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-hint) except that this config is used to display HTML content.
     * Since this can allow malicious content to be executed, be sure not to include user-entered data or to
     * encode such data (see [encodeHtml](https://bryntum.com/products/gantt/docs/api/Core/helper/StringHelper#function-encodeHtml-static)).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-hintHtml)
     * @param {object} data A data object
     * @param {Core.widget.Field} data.source A reference to the field instance
     * @param {any} data.value The current value of the field
     * @returns {string}
     */
    hintHtml? : string|((data: { source: Field, value: any }) => string)
    /**
     * Widget id, if not specified one will be generated. Also used for lookups through Widget.getById
     */
    id? : string
    /**
     * Determines if the widgets read-only state should be controlled by its parent.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Set this config to `true` to always display items horizontally along with this field. This assigns an
     * [hbox](https://bryntum.com/products/gantt/docs/api/Core/widget/layout/Box) as the [layout](#Core/widget/Container#config-layout) to the
     * [container](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-container).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-inline)
     */
    inline? : boolean
    /**
     * Text alignment for the input field.
     */
    inputAlign? : string
    /**
     * Sets custom attributes of the underlying input element. For more information, please refer to
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes)
     */
    inputAttributes? : Record<string, string>
    /**
     * If you need to use something else than a default `input` element, as the input element, provide the tag
     * name here. Please note that this is used for advanced usage only, for example when using WebComponents
     * (custom elements), and that the configured element must fulfil the same contract as a regular input
     * element.
     */
    inputTag? : string
    /**
     * Sets the `type` attribute of the underlying input element (password, hidden, date, color, etc.).
     */
    inputType? : string
    /**
     * The width to apply to the `.b-field-inner` element, which encompasses the `input` element and any
     * triggers. If a number is specified, `px` will be used.
     */
    inputWidth? : string|number
    /**
     * Element (or element id) to insert this widget before. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertBefore? : HTMLElement|string
    /**
     * Element (or element id) to append this widget element to, as a first child. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertFirst? : HTMLElement|string
    /**
     * An object whose keys are the [key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) name
     * and optional modifier prefixes: `'Ctrl+'`, `'Alt+'`, `'Meta+'`, and `'Shift+'` (case-insensitive). The values
     * are the name of the instance method to call when the keystroke is received.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-keyMap)
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * The delay in milliseconds to wait after the last keystroke before triggering a change event.
     * Set to 0 to not trigger change events from keystrokes (listen for input event instead to have
     * immediate feedback, change will still be triggered on blur).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-keyStrokeChangeDelay)
     */
    keyStrokeChangeDelay? : number
    /**
     * Label, prepended to field
     */
    label? : string
    /**
     * CSS class name or class names to add to any configured [label](https://bryntum.com/products/gantt/docs/api/Core/widget/mixin/Labelable#config-label)
     */
    labelCls? : string|object
    /**
     * Label position, either 'before' the field or 'above' the field
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|null
    /**
     * The labels to add either before or after the input field.
     * Each label may have the following properties:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-labels)
     */
    labels? : object[]
    /**
     * The width to apply to the `&lt;label&gt;` element. If a number is specified, `px` will be used.
     */
    labelWidth? : string|number
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-listeners)
     */
    listeners? : TextAreaPickerFieldListeners
    /**
     * A class translations of which are used for translating this entity.
     * This is often used when translations of an item are defined on its container class.
     * For example:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-localeClass)
     */
    localeClass? : typeof Base
    /**
     * Set to `false` to disable localization of this object.
     */
    localizable? : boolean
    /**
     * List of properties which values should be translated automatically upon a locale applying.
     * In case there is a need to localize not typical value (not a String value or a field with re-defined setter/getter),
     * you could use 'localeKey' meta configuration.
     * Example:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-localizableProperties)
     */
    localizableProperties? : string[]
    /**
     * Widget's margin. This may be configured as a single number or a `TRBL` format string.
     * numeric-only values are interpreted as pixels.
     */
    margin? : number|string
    /**
     * This config object contains the defaults for the [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) created for the
     * [masked](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-masked) config. Any properties specified in the `masked` config will override these
     * values.
     */
    maskDefaults? : MaskConfig
    /**
     * Set to `true` to apply the default mask to the widget. Alternatively, this can be the mask message or a
     * [Mask](https://bryntum.com/products/gantt/docs/api/Core/widget/Mask) config object.
     */
    masked? : boolean|string|MaskConfig
    /**
     * The element's maxHeight. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [height](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-height), *reading* the value will return the numeric value in pixels.
     */
    maxHeight? : string|number
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-maximizeOnMobile)
     */
    maximizeOnMobile? : number|string
    /**
     * The max number of characters for the input field
     */
    maxLength? : number
    /**
     * The elements maxWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    maxWidth? : string|number
    /**
     * The element's minHeight. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [height](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-height), *reading* the value will return the numeric value in pixels.
     */
    minHeight? : string|number
    /**
     * The min number of characters for the input field
     */
    minLength? : number
    /**
     * The elements minWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    minWidth? : string|number
    /**
     * When this is configured as `true` a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
     * is used to monitor this element for size changes caused by either style manipulation, or by CSS
     * layout.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-monitorResize)
     */
    monitorResize? : boolean|{
        immediate?: boolean
    }
    /**
     * Name of the field which is used as a key to get/set values from/to the field.
     * Used prior to [ref](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-ref) and [id](#Core/widget/Widget#config-id) in
     * [Container.values](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-values).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-name)
     */
    name? : string
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-owner)
     */
    owner? : Widget|any
    /**
     * Configuration object for the [picker](https://bryntum.com/products/gantt/docs/api/Core/widget/List) on initialization. Returns the
     * [picker](https://bryntum.com/products/gantt/docs/api/Core/widget/List) instance at runtime.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-picker)
     */
    picker? : object|Widget|WidgetConfig
    /**
     * The name of the element property to which the picker should size and align itself.
     */
    pickerAlignElement? : string
    /**
     * Text to display in empty field.
     */
    placeholder? : string
    /**
     * Set to `true` when a widget is rendered into another widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement), but must
     * not participate in the standard layout of that widget, and must be positioned relatively to that
     * widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-positioned)
     */
    positioned? : boolean
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * Makes the field unmodifiable by user action. The input area is not editable, and triggers
     * are unresponsive.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-readOnly)
     */
    readOnly? : boolean
    relayStoreEvents? : boolean
    /**
     * Predefined style to use for the field. Possible values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-rendition)
     */
    rendition? : 'outlined'|'filled'|string
    /**
     * Configure as `true` to indicate that a `null` field value is to be marked as invalid. This will
     * optionally append a * to the field label if [showRequiredIndicator](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-showRequiredIndicator) is set.
     */
    required? : boolean
    /**
     * The resize style to apply to the `&lt;textarea&gt;` element.
     */
    resize? : 'none'|'both'|'horizontal'|'vertical'
    /**
     * If this field is not [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-readOnly), then setting this option means that pressing
     * the `ESCAPE` key after editing the field will revert the field to the value it had when
     * the user focused the field. If the field is *not* changed from when focused, the [clearable](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-clearable)
     * behaviour will be activated.
     */
    revertOnEscape? : boolean
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-ripple)
     */
    ripple? : boolean|{
        delegate?: string
        color?: string
        radius?: number
        clip?: string
    }
    /**
     * If you are rendering this widget to a shadow root inside a web component, set this config to the shadowRoot. If not inside a web component, set it to `document.body`
     */
    rootElement? : ShadowRoot|HTMLElement
    /**
     * This may be configured as `true` to make the widget's element use the `direction:rtl` style.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-rtl)
     */
    rtl? : boolean
    /**
     * Defines what to do if document is scrolled while Widget is visible (only relevant when floating is set to `true`).
     * Valid values: ´null´: do nothing, ´hide´: hide the widget or ´realign´: realign to the target if possible.
     */
    scrollAction? : 'hide'|'realign'|null
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-showAnimation)
     */
    showAnimation? : boolean|object
    /**
     * `true` to automatically display a * after the label for this field when it is [required](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-required).
     */
    showRequiredIndicator? : string
    /**
     * Set to `false` to not show the tooltip when this widget is [disabled](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-disabled)
     */
    showTooltipWhenDisabled? : boolean
    /**
     * Set to `true`, completely bypasses validation logic (could be userful if your field is not `editable`
     * to the user).
     */
    skipValidation? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * Sets the native `spellcheck` property of the underlying input element. For more information, please refer to
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck)
     */
    spellCheck? : boolean
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * The tab index of the input field or fields, or `null` for natural tab order (recommended). Setting to `0`
     * is equivalent to natural tab order, but is unnecessary for fields since they are naturally tabbable
     * (i.e., accessible via the TAB key). Setting to `-1` disables tabbability but allows for focus to be set
     * to the element programmatically.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-tabIndex)
     */
    tabIndex? : number
    /**
     * Text alignment: 'left', 'center' or 'right'. Also accepts direction neutral 'start' and 'end'.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-textAlign)
     */
    textAlign? : 'left'|'center'|'right'|'start'|'end'
    /**
     * A title to display for the widget. Only in effect when inside a container that uses it (such as TabPanel)
     */
    title? : string
    /**
     * Tooltip for the widget, either as a string or as a Tooltip config object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-tooltip)
     */
    tooltip? : string|TooltipConfig|null
    /**
     * The triggers to add either before or after the input field. Each property name is the reference by which
     * an instantiated Trigger Widget may be retrieved from the live `triggers` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-triggers)
     */
    triggers? : Record<string, FieldTriggerConfig>|Record<string, Widget>
    type? : 'textareapickerfield'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-ui)
     */
    ui? : string|object
    /**
     * Set to `false` to not highlight a field as invalid while typing, to instead show it on ENTER key press
     * or similar.
     */
    validateOnInput? : boolean
    /**
     * Default value
     */
    value? : string
    /**
     * A widgets weight determines its position among siblings when added to a [Container](https://bryntum.com/products/gantt/docs/api/Core/widget/Container).
     * Higher weights go further down.
     */
    weight? : number
    /**
     * Widget's width, used to set element `style.width`. Either specify a valid width string or a number, which
     * will get 'px' appended. We recommend using CSS as the primary way to control width, but in some cases
     * this config is convenient.
     */
    width? : string|number
    /**
     * The x position for the widget.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-x)
     */
    x? : number
    /**
     * The y position for the widget.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#config-y)
     */
    y? : number

    // Events
    /**
     * User performed default action (typed into this field).
     * @param {object} event Event object
     * @param {Core.widget.Field,any} event.source This Field
     * @param {string,number,boolean,any} event.value This field's value
     * @param {string,number,boolean,any} event.oldValue This field's previous value
     * @param {boolean} event.valid True if this field is in a valid state
     * @param {Event} event.event The triggering DOM event if any
     * @param {Core.data.Model} event.record Selected record. Available for fields with records selection functionality
     * @param {Core.data.Model[]} event.records Selected records as an array. Available for fields with records selection functionality
     * @param {boolean} event.userAction Triggered by user taking an action (`true`) or by setting a value (`false`)
     * @param {boolean} event.checked
     */
    onAction? : ((event: { source: Field|any, value: string|number|boolean|any, oldValue: string|number|boolean|any, valid: boolean, event: Event, record: Model, records: Model[], userAction: boolean, checked: boolean }) => void)|string
    /**
     * Fires before an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onBeforeDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Triggered before a widget is hidden. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget being hidden.
     */
    onBeforeHide? : ((event: { source: Widget }) => Promise<boolean>|boolean|void)|string
    /**
     * Triggered before a widget is shown. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Core.widget.Widget,any} event.source The widget being shown
     */
    onBeforeShow? : ((event: { source: Widget|any }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires when any other event is fired from the object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#event-catchAll)
     * @param {object} event Event object
     * @param {{[key: string]: any, type: string}} event.event The Object that contains event details
     * @param {string} event.event.type The type of the event which is caught by the listener
     */
    onCatchAll? : ((event: {[key: string]: any, type: string}) => void)|string
    /**
     * Fired when this field's value changes.
     * @param {object} event Event object
     * @param {Core.widget.Field,any} event.source This Field
     * @param {string,number,boolean,any} event.value This field's value
     * @param {string,number,boolean,any} event.oldValue This field's previous value
     * @param {boolean} event.valid True if this field is in a valid state
     * @param {Event} event.event The triggering DOM event if any
     * @param {boolean} event.userAction Triggered by user taking an action (`true`) or by setting a value (`false`)
     * @param {boolean} event.checked
     */
    onChange? : ((event: { source: Field|any, value: string|number|boolean|any, oldValue: string|number|boolean|any, valid: boolean, event: Event, userAction: boolean, checked: boolean }) => void)|string
    /**
     * Fired when this field is [cleared](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#function-clear).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#event-clear)
     * @param {object} event Event object
     * @param {Core.widget.Field,any} event.source This Field
     */
    onClear? : ((event: { source: Field|any }) => void)|string
    /**
     * Fires when an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Triggered when a widget's [element](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-element) is available.
     * @param {object} event Event object
     * @param {HTMLElement} event.element The Widget's element.
     */
    onElementCreated? : ((event: { element: HTMLElement }) => void)|string
    /**
     * Fired when focus enters this Widget.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {HTMLElement} event.fromElement The element which lost focus.
     * @param {HTMLElement} event.toElement The element which gained focus.
     * @param {Core.widget.Widget} event.fromWidget The widget which lost focus.
     * @param {Core.widget.Widget} event.toWidget The widget which gained focus.
     * @param {boolean} event.backwards `true` if the `toElement` is before the `fromElement` in document order.
     */
    onFocusIn? : ((event: { source: Widget, fromElement: HTMLElement, toElement: HTMLElement, fromWidget: Widget, toWidget: Widget, backwards: boolean }) => void)|string
    /**
     * Fired when focus exits this Widget's ownership tree. This is different from a `blur` event.
     * focus moving from within this Widget's ownership tree, even if there are floating widgets
     * will not trigger this event. This is when focus exits this widget completely.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {HTMLElement} event.fromElement The element which lost focus.
     * @param {HTMLElement} event.toElement The element which gained focus.
     * @param {Core.widget.Widget} event.fromWidget The widget which lost focus.
     * @param {Core.widget.Widget} event.toWidget The widget which gained focus.
     * @param {boolean} event.backwards `true` if the `toElement` is before the `fromElement` in document order.
     */
    onFocusOut? : ((event: { source: Widget, fromElement: HTMLElement, toElement: HTMLElement, fromWidget: Widget, toWidget: Widget, backwards: boolean }) => void)|string
    /**
     * Triggered after a widget was hidden
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget
     */
    onHide? : ((event: { source: Widget }) => void)|string
    /**
     * Fired when the user types into this field.
     * @param {object} event Event object
     * @param {Core.widget.Field,any} event.source This field
     * @param {string,number,boolean,any} event.value This field's value
     * @param {Event} event.event The triggering DOM event
     */
    onInput? : ((event: { source: Field|any, value: string|number|boolean|any, event: Event }) => void)|string
    /**
     * Triggered when a widget which had been in a non-visible state for any reason
     * achieves visibility.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/TextAreaPickerField#event-paint)
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget being painted.
     * @param {boolean} event.firstPaint `true` if this is the first paint.
     */
    onPaint? : ((event: { source: Widget, firstPaint: boolean }) => void)|string
    /**
     * Fired when a Widget's read only state is toggled
     * @param {object} event Event object
     * @param {boolean} event.readOnly Read only or not
     */
    onReadOnly? : ((event: { readOnly: boolean }) => void)|string
    /**
     * This event is fired after a widget's elements have been synchronized due to a direct or indirect call
     * to [recompose](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#function-recompose), if this results in some change to the widget's rendered DOM elements.
     */
    onRecompose? : (() => void)|string
    /**
     * Fired when the encapsulating element of a Widget resizes *only when [monitorResize](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-monitorResize) is `true`*.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source This Widget
     * @param {number} event.width The new width
     * @param {number} event.height The new height
     * @param {number} event.oldWidth The old width
     * @param {number} event.oldHeight The old height
     */
    onResize? : ((event: { source: Widget, width: number, height: number, oldWidth: number, oldHeight: number }) => void)|string
    /**
     * Triggered after a widget is shown.
     * @param {object} event Event object
     * @param {Core.widget.Widget} event.source The widget
     */
    onShow? : ((event: { source: Widget }) => void)|string
    /**
     * User clicked one of this field's [triggers](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-triggers)
     * @param {object} event Event object
     * @param {Core.widget.Field,any} event.source This field
     * @param {Core.widget.Widget} event.trigger The trigger activated by click or touch tap.
     */
    onTrigger? : ((event: { source: Field|any, trigger: Widget }) => void)|string

}

export class BryntumTextAreaPickerField extends React.Component<BryntumTextAreaPickerFieldProps> {

    static instanceClass = TextAreaPickerField;

    static instanceName = 'TextAreaPickerField';

    processWidgetContent = processWidgetContent;

    static configNames = [
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
        'resize',
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

    static propertyConfigNames = [
        'alignSelf',
        'appendTo',
        'badge',
        'callOnFunctions',
        'catchEventHandlerExceptions',
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

    static propertyNames = [
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

    // Component instance
    instance!: TextAreaPickerField;

    // Component element
    element! : HTMLElement;

    componentDidMount(): void {
        this.instance = createWidget(this);
    }

    componentWillUnmount(): void {
        // @ts-ignore
        this.instance?.destroy?.();
    }

    /**
     * Component about to be updated, from changing a prop using state.
     * React to it depending on what changed and prevent react from re-rendering our component.
     * @param nextProps
     * @param nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps: Readonly<BryntumTextAreaPickerFieldProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-text-area-picker-field-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
