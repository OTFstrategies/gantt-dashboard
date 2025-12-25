/**
 * React wrapper for Bryntum DependencyField
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AlignSpec, Base, ChipViewConfig, CollectionCompareOperator, CollectionFilterConfig, Combo, ComboModel, ContainerItemConfig, DependencyField, DependencyFieldListeners, DependencyStore, DomConfig, Duration, DurationConfig, Field, FieldContainer, FieldContainerConfig, FieldTriggerConfig, KeyMapConfig, List, ListConfig, MaskConfig, Model, Rectangle, Scroller, Sorter, Store, StoreConfig, TabConfig, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumDependencyFieldProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-align)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-ariaLabel)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Enable caching of the last retrieved result until the timeout is reached.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-cacheLastResult)
     */
    cacheLastResult? : number|string|Duration|DurationConfig
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * Configure as `true` to force case matching when filtering the dropdown list based upon the typed value.
     */
    caseSensitive? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to centre the Widget in browser viewport space.
     */
    centered? : boolean
    /**
     * A config object to configure the [ChipView](https://bryntum.com/products/gantt/docs/api/Core/widget/ChipView) to display the
     * selected value set when [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) is `true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-chipView)
     */
    chipView? : ChipViewConfig
    /**
     * Show a trigger to clear field, if this field is not [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-readOnly). The trigger is available
     * in the [triggers](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-triggers) object under the name `clear`. May also be an object which
     * configures the `clear` [trigger](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-triggers).
     */
    clearable? : boolean|FieldTriggerConfig
    /**
     * `true` to clear value typed to a multiselect combo when picker is collapsed
     */
    clearTextOnPickerHide? : boolean
    /**
     * Specify `false` to not clear value typed to a multiselect combo when an item is selected.
     */
    clearTextOnSelection? : boolean
    /**
     * Set to `true` to clear this field when user empties the input element
     */
    clearWhenInputEmpty? : boolean
    /**
     * Custom CSS classes to add to element.
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-cls)
     */
    cls? : string|object
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-color)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-container)
     */
    container? : Record<string, ContainerItemConfig>|ContainerItemConfig[]|FieldContainerConfig|FieldContainer
    /**
     * The config controls how the value of nested items are handled when a parent container gets or sets its
     * [values](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-values).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-containValues)
     * @param {Core.widget.Field} field Field instance
     * @returns {boolean}
     */
    containValues? : boolean|string|((field: Field) => boolean)
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-contentElementCls)
     */
    contentElementCls? : string|object
    /**
     * If configured as `true`, this means that when an unmatched string is typed into the
     * combo's input field, and `ENTER`, or the [multiValueSeparator](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiValueSeparator) is typed,
     * a new record will be created using the typed string as the [displayField](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-displayField).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-createOnUnmatched)
     * @param {string} name Record name
     * @param {Core.widget.Combo} combo Combo instance
     * @returns {Core.data.Model} New record
     */
    createOnUnmatched? : ((name: string, combo: Combo) => Model)|string|boolean
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
     * Delimiter between dependency ids in the field
     */
    delimiter? : string
    /**
     * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked
     * tasks. Defaults to [Gantt#dependencyIdField](https://bryntum.com/products/gantt/docs/api/Gantt/view/GanttBase#config-dependencyIdField)
     */
    dependencyIdField? : string
    /**
     * The dependency store
     */
    dependencyStore? : DependencyStore
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-disabled)
     */
    disabled? : boolean|'inert'
    /**
     * Field used for item text when populating from store
     */
    displayField? : string
    /**
     * Template function that can be used to customize the displayed value
     * @param {Core.data.Model} record The record to provide a textual value for
     * @param {Core.widget.Combo} combo A reference to this Combo
     * @returns {string,void}
     */
    displayValueRenderer? : (record: Model|ComboModel, combo: Combo) => string|void
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to be able to drag a widget freely on the page. Or set to an object with a ´handleSelector´
     * property which controls when a drag should start.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-draggable)
     */
    draggable? : boolean|{
        handleSelector?: string
    }
    /**
     * User can edit text in text field (otherwise only pick from attached picker)
     */
    editable? : boolean
    /**
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-elementAttributes)
     */
    elementAttributes? : Record<string, string|null>
    /**
     * Text to display in the drop down when there are no items in the underlying store.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-emptyText)
     */
    emptyText? : string
    /**
     * A function which creates an array of values for the [filterParamName](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-filterParamName) to pass
     * any filters to the server upon load.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-encodeFilterParams)
     * @param {object[]} filters filters
     * @returns {object[]} array of values
     */
    encodeFilterParams? : (filters: object[]) => object[]
    extraData? : any
    /**
     * Set to `false` to hide the filter field
     */
    filterable? : boolean
    /**
     * If `false`, filtering will be triggered once you exceed [minChars](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-minChars). To filter only when
     * hitting Enter key, set this to `true`;
     */
    filterOnEnter? : boolean
    /**
     * The name of an operator type as implemented in [operator](https://bryntum.com/products/gantt/docs/api/Core/util/CollectionFilter#config-operator)
     * to use when filtering the dropdown list based upon the typed value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-filterOperator)
     */
    filterOperator? : CollectionCompareOperator
    /**
     * If the dropdown is to be populated with a filtered query to a remote server, specify the
     * name of the parameter to pass the typed string here. By default, the string is simply sent
     * as the value of the parameter. For special encoding, configure the combo with [encodeFilterParams](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-encodeFilterParams)
     */
    filterParamName? : string
    /**
     * When [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) is `true`, you may configure `filterSelected` as
     * `true` to hide items in the dropdown when they are added to the selection.
     * It will appear as if the requested item has "moved" into the field's
     * [ChipView](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-chipView).
     */
    filterSelected? : boolean
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-hideAnimation)
     */
    hideAnimation? : boolean|object
    /**
     * By default, the picker is hidden on selection in single select mode, and
     * remains to allow more selections when [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) is `true`.
     * Setting this to a `Boolean` value can override that default.
     */
    hidePickerOnSelect? : boolean
    /**
     * Configure as `true` to hide the expand trigger. This is automatically set to `true` if
     * remote filtering is enabled by setting the [filterParamName](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-filterParamName) config.
     */
    hideTrigger? : boolean
    /**
     * Specify `true` to highlight field after external value changes
     */
    highlightExternalChange? : boolean
    /**
     * An optional string to display inside the input field as an overlay. This can be useful for displaying
     * a field's units.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-hint)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-hintHtml)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Set this config to `true` to always display items horizontally along with this field. This assigns an
     * [hbox](https://bryntum.com/products/gantt/docs/api/Core/widget/layout/Box) as the [layout](#Core/widget/Container#config-layout) to the
     * [container](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#config-container).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-inline)
     */
    inline? : boolean
    /**
     * Configure this as `true` to render the dropdown list as a permanently visible list
     * in the document flow immediately below the input area instead of as a popup.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-inlinePicker)
     */
    inlinePicker? : boolean
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
     * Rows to display in the dropdown (list items).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-items)
     */
    items? : object[]|string[]|object
    /**
     * An object whose keys are the [key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) name
     * and optional modifier prefixes: `'Ctrl+'`, `'Alt+'`, `'Meta+'`, and `'Shift+'` (case-insensitive). The values
     * are the name of the instance method to call when the keystroke is received.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-keyMap)
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * The delay in milliseconds to wait after the last keystroke before triggering a change event.
     * Set to 0 to not trigger change events from keystrokes (listen for input event instead to have
     * immediate feedback, change will still be triggered on blur).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-keyStrokeChangeDelay)
     */
    keyStrokeChangeDelay? : number
    /**
     * The delay in milliseconds to wait after the last keystroke before filtering the list.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-keyStrokeFilterDelay)
     */
    keyStrokeFilterDelay? : number
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|null
    /**
     * The labels to add either before or after the input field.
     * Each label may have the following properties:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-labels)
     */
    labels? : object[]
    /**
     * The width to apply to the `&lt;label&gt;` element. If a number is specified, `px` will be used.
     */
    labelWidth? : string|number
    /**
     * CSS class to add to picker
     */
    listCls? : string
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-listeners)
     */
    listeners? : DependencyFieldListeners
    /**
     * Template string used to render the list items in the dropdown list
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-listItemTpl)
     * @param {Core.data.Model} record The record representing the item being rendered
     * @returns {string,void}
     */
    listItemTpl? : (record: Model|ComboModel) => string|void
    /**
     * A class translations of which are used for translating this entity.
     * This is often used when translations of an item are defined on its container class.
     * For example:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-localeClass)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-localizableProperties)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-maximizeOnMobile)
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
     * The minimum string length to trigger the filtering, only relevant when [editable](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-editable) is `true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-minChars)
     */
    minChars? : number
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-monitorResize)
     */
    monitorResize? : boolean|{
        immediate?: boolean
    }
    /**
     * Set to `true` to allow selection of multiple values from the dropdown list.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-multiSelect)
     */
    multiSelect? : boolean
    /**
     * A key value which, when typed in a [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) Combo, selects the
     * currently active item in the picker, and clears the input field ready for another
     * match to be typed.
     */
    multiValueSeparator? : string
    /**
     * Name of the field which is used as a key to get/set values from/to the field.
     * Used prior to [ref](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-ref) and [id](#Core/widget/Widget#config-id) in
     * [Container.values](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-values).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-name)
     */
    name? : string
    /**
     * The other task's relationship with this field's contextual task.
     * This will be `'from'` if we are editing predecessors, and `'to'` if
     * we are editing successors.
     */
    otherSide? : 'from'|'to'
    /**
     * This field's contextual task's relationship with the other task.
     * This will be `'to'` if we are editing predecessors, and `'from'` if
     * we are editing successors.
     */
    ourSide? : 'from'|'to'
    /**
     * This implies that the picker will display an anchor pointer, but also means that the picker will align closer
     * to the input field so that the pointer pierces the [pickerAlignElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-pickerAlignElement)
     */
    overlayAnchor? : boolean
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-owner)
     */
    owner? : Widget|any
    /**
     * Configuration object for the [picker](https://bryntum.com/products/gantt/docs/api/Core/widget/List) on initialization. Returns the
     * [picker](https://bryntum.com/products/gantt/docs/api/Core/widget/List) instance at runtime.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-picker)
     */
    picker? : ListConfig|List
    /**
     * The name of the element property to which the picker should size and align itself.
     */
    pickerAlignElement? : string
    /**
     * Width of picker, defaults to this combo's [pickerAlignElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-pickerAlignElement) width
     */
    pickerWidth? : number|string
    /**
     * Text to display in empty field.
     */
    placeholder? : string
    /**
     * Set to `true` when a widget is rendered into another widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement), but must
     * not participate in the standard layout of that widget, and must be positioned relatively to that
     * widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-positioned)
     */
    positioned? : boolean
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * Optionally a [Filter](https://bryntum.com/products/gantt/docs/api/Core/util/CollectionFilter) config object which the combo should use for
     * filtering using the typed value.
     * This may use a `filterBy` property to test its `value` against any field in the passed record.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-primaryFilter)
     */
    primaryFilter? : CollectionFilterConfig
    /**
     * Makes the field unmodifiable by user action. The input area is not editable, and triggers
     * are unresponsive.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-readOnly)
     */
    readOnly? : boolean
    relayStoreEvents? : boolean
    /**
     * Predefined style to use for the field. Possible values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-rendition)
     */
    rendition? : 'outlined'|'filled'|string
    /**
     * Configure as `true` to indicate that a `null` field value is to be marked as invalid. This will
     * optionally append a * to the field label if [showRequiredIndicator](https://bryntum.com/products/gantt/docs/api/Core/widget/Field#property-showRequiredIndicator) is set.
     */
    required? : boolean
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-ripple)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-rtl)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-showAnimation)
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
     * The sorters defining how to sort tasks in the drop down list, defaults to sorting by `name` field
     * ascending. See [StoreSort](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/StoreSort) for more information.
     */
    sorters? : Sorter[]|string[]
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
     * Store used to populate items. Also accepts a Store config object
     */
    store? : Store|StoreConfig
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * The tab index of the input field or fields, or `null` for natural tab order (recommended). Setting to `0`
     * is equivalent to natural tab order, but is unnecessary for fields since they are naturally tabbable
     * (i.e., accessible via the TAB key). Setting to `-1` disables tabbability but allows for focus to be set
     * to the element programmatically.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-tabIndex)
     */
    tabIndex? : number
    /**
     * Text alignment: 'left', 'center' or 'right'. Also accepts direction neutral 'start' and 'end'.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-textAlign)
     */
    textAlign? : 'left'|'center'|'right'|'start'|'end'
    /**
     * A title to display for the widget. Only in effect when inside a container that uses it (such as TabPanel)
     */
    title? : string
    /**
     * Tooltip for the widget, either as a string or as a Tooltip config object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-tooltip)
     */
    tooltip? : string|TooltipConfig|null
    /**
     * How to query the store upon click of the expand trigger. Specify one of these values:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-triggerAction)
     */
    triggerAction? : 'all'|'last'|null
    /**
     * The triggers to add either before or after the input field. Each property name is the reference by which
     * an instantiated Trigger Widget may be retrieved from the live `triggers` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-triggers)
     */
    triggers? : Record<string, FieldTriggerConfig>|Record<string, Widget>
    type? : 'dependencyfield'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-ui)
     */
    ui? : string|object
    /**
     * `true` to cause the field to be in an invalid state while the typed filter string does not match a record in the store.
     */
    validateFilter? : boolean
    /**
     * Set to `false` to not highlight a field as invalid while typing, to instead show it on ENTER key press
     * or similar.
     */
    validateOnInput? : boolean
    /**
     * The initial value of this Combo box. In single select mode (default) it's a simple string value, for
     * [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) mode, it should be an array of record ids.
     */
    value? : string|number|string[]|number[]
    /**
     * Field used for item value when populating from store. Setting this to `null` will
     * yield the selected record as the Combo's [value](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#property-value).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-valueField)
     */
    valueField? : string|null
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-x)
     */
    x? : number
    /**
     * The y position for the widget.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#config-y)
     */
    y? : number

    // Events
    /**
     * The default action was performed (an item in the list was selected)
     * @param {object} event Event object
     * @param {Core.widget.Combo} event.source The combo
     * @param {any} event.value The [value](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-valueField) of the selected record
     * @param {Core.data.Model} event.record Selected record
     * @param {Core.data.Model[]} event.records Selected records as an array if [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) is `true`
     * @param {boolean} event.userAction `true` if the value change is due to user interaction
     */
    onAction? : ((event: { source: Combo, value: any, record: Model, records: Model[], userAction: boolean }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#event-catchAll)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#event-clear)
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
     * User typed into the field. Please note that the value attached to this event is the raw input field value and
     * not the combos value
     * @param {object} event Event object
     * @param {Core.widget.Combo} event.source The combo.
     * @param {string} event.value Raw input value
     * @param {Event} event.event The triggering DOM event if any.
     */
    onInput? : ((event: { source: Combo, value: string, event: Event }) => void)|string
    /**
     * Triggered when a widget which had been in a non-visible state for any reason
     * achieves visibility.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/widget/DependencyField#event-paint)
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
     * An item in the list was selected
     * @param {object} event Event object
     * @param {Core.widget.Combo} event.source The combo
     * @param {Core.data.Model} event.record Selected record
     * @param {Core.data.Model[]} event.records Selected records as an array if [multiSelect](https://bryntum.com/products/gantt/docs/api/Core/widget/Combo#config-multiSelect) is `true`
     * @param {boolean} event.userAction `true` if the value change is due to user interaction
     */
    onSelect? : ((event: { source: Combo, record: Model, records: Model[], userAction: boolean }) => void)|string
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

export class BryntumDependencyField extends React.Component<BryntumDependencyFieldProps> {

    static instanceClass = DependencyField;

    static instanceName = 'DependencyField';

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
        'cacheLastResult',
        'caseSensitive',
        'centered',
        'chipView',
        'clearable',
        'clearTextOnPickerHide',
        'clearTextOnSelection',
        'clearWhenInputEmpty',
        'color',
        'config',
        'constrainTo',
        'container',
        'containValues',
        'contentElementCls',
        'createOnUnmatched',
        'dataField',
        'defaultBindProperty',
        'delimiter',
        'dependencyIdField',
        'dependencyStore',
        'detectCSSCompatibilityIssues',
        'displayField',
        'displayValueRenderer',
        'dock',
        'draggable',
        'elementAttributes',
        'emptyText',
        'encodeFilterParams',
        'filterable',
        'filterOnEnter',
        'filterParamName',
        'filterSelected',
        'floating',
        'hideAnimation',
        'hidePickerOnSelect',
        'hideTrigger',
        'highlightExternalChange',
        'hint',
        'hintHtml',
        'ignoreParentReadOnly',
        'inline',
        'inlinePicker',
        'inputAlign',
        'inputAttributes',
        'inputTag',
        'inputType',
        'inputWidth',
        'items',
        'keyStrokeChangeDelay',
        'keyStrokeFilterDelay',
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
        'maxLength',
        'minChars',
        'minLength',
        'monitorResize',
        'multiValueSeparator',
        'name',
        'otherSide',
        'ourSide',
        'overlayAnchor',
        'owner',
        'pickerAlignElement',
        'pickerWidth',
        'positioned',
        'preventTooltipOnTouch',
        'primaryFilter',
        'relayStoreEvents',
        'revertOnEscape',
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showTooltipWhenDisabled',
        'skipValidation',
        'sorters',
        'spellCheck',
        'tab',
        'tabIndex',
        'textAlign',
        'title',
        'triggerAction',
        'type',
        'ui',
        'validateFilter',
        'validateOnInput',
        'valueField',
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
        'editable',
        'extraData',
        'filterOperator',
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
        'multiSelect',
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
        'onSelect',
        'onShow',
        'onTrigger',
        'picker',
        'placeholder',
        'readOnly',
        'rendition',
        'required',
        'rtl',
        'showRequiredIndicator',
        'span',
        'store',
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
        'focusVisible',
        'formula',
        'html',
        'input',
        'parent',
        'scrollable'
    ];

    // Component instance
    instance!: DependencyField;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumDependencyFieldProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-dependency-field-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
