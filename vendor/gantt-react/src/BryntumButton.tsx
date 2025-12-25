/**
 * React wrapper for Bryntum Button
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AlignSpec, Base, Button, ButtonListeners, ContainerItemConfig, DomConfig, KeyMapConfig, MaskConfig, Menu, MenuConfig, MenuItemConfig, PopupConfig, Rectangle, Scroller, ScrollerConfig, TabConfig, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumButtonProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-align)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Initial text to show in badge.
     */
    badge? : string
    /**
     * The button behavioral type, will be applied as a `type` attribute to this button's element.
     */
    behaviorType? : 'button'|'submit'|'reset'
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to centre the Widget in browser viewport space.
     */
    centered? : boolean
    /**
     * Custom CSS classes to add to element.
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-cls)
     */
    cls? : string|object
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-color)
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
     * The HTML content that coexists with sibling elements which may have been added to the
     * [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement) by plugins and features.
     * When specifying html, this widget's element will also have the [htmlCls](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-htmlCls)
     * class added to its classList, to allow targeted styling.
     */
    content? : string
    /**
     * Custom CSS classes to add to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-contentElementCls)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-disabled)
     */
    disabled? : boolean|'inert'
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * Set to `true` to be able to drag a widget freely on the page. Or set to an object with a ´handleSelector´
     * property which controls when a drag should start.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-draggable)
     */
    draggable? : boolean|{
        handleSelector?: string
    }
    /**
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-elementAttributes)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-hideAnimation)
     */
    hideAnimation? : boolean|object
    /**
     * If provided, turns the button into a link.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-href)
     */
    href? : string
    /**
     * The HTML to display initially or a function returning the markup (called at widget construction time).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-html)
     * @param {Core.widget.Widget} widget The calling Widget
     * @returns {string}
     */
    html? : string|((widget: Widget) => string)|DomConfig|DomConfig[]|VueConfig
    /**
     * The CSS class(es) to add when HTML content is being applied to this widget.
     */
    htmlCls? : string|object
    /**
     * Button icon class, a developer-defined CSS class string which results in the desired icon.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-icon)
     */
    icon? : string
    /**
     * Button icon alignment. May be `'start'` or `'end'`. Defaults to `'start'`
     */
    iconAlign? : 'start'|'end'
    /**
     * Widget id, if not specified one will be generated. Also used for lookups through Widget.getById
     */
    id? : string
    /**
     * Determines if the widgets read-only state should be controlled by its parent.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-keyMap)
     */
    keyMap? : Record<string, KeyMapConfig>
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-listeners)
     */
    listeners? : ButtonListeners
    /**
     * A class translations of which are used for translating this entity.
     * This is often used when translations of an item are defined on its container class.
     * For example:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-localeClass)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-localizableProperties)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-maximizeOnMobile)
     */
    maximizeOnMobile? : number|string
    /**
     * The elements maxWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    maxWidth? : string|number
    /**
     * A submenu configuration object, or an array of MenuItem configuration objects from which to create a
     * submenu which is shown when this button is pressed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-menu)
     */
    menu? : Record<string, MenuItemConfig|ContainerItemConfig>|(MenuItemConfig|ContainerItemConfig)[]|MenuConfig|PopupConfig
    /**
     * The menu icon class to show when the button has a menu. Set to `null` to not show a menu icon.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-menuIcon)
     */
    menuIcon? : string
    /**
     * The element's minHeight. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [height](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-height), *reading* the value will return the numeric value in pixels.
     */
    minHeight? : string|number
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-monitorResize)
     */
    monitorResize? : boolean|{
        immediate?: boolean
    }
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-owner)
     */
    owner? : Widget|any
    /**
     * Set to `true` when a widget is rendered into another widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement), but must
     * not participate in the standard layout of that widget, and must be positioned relatively to that
     * widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-positioned)
     */
    positioned? : boolean
    /**
     * Initially pressed or not. Only applies with `toggleable = true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-pressed)
     */
    pressed? : boolean
    /**
     * A CSS class to add to the pressed state of the button. A `b-pressed` CSS class is always added,
     * when a button is pressed.
     */
    pressedCls? : string
    /**
     * Icon class for the buttons pressed state, a developer-defined CSS class string which results in the
     * desired icon. Only applies to toggle buttons
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-pressedIcon)
     */
    pressedIcon? : string
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * Whether this widget is read-only.  This is only valid if the widget is an input
     * field, <strong>or contains input fields at any depth</strong>.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-readOnly)
     */
    readOnly? : boolean
    relayStoreEvents? : boolean
    /**
     * Predefined style to use for the button. Possible values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-rendition)
     */
    rendition? : 'elevated'|'filled'|'tonal'|'outlined'|'text'|string
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-ripple)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-rtl)
     */
    rtl? : boolean
    /**
     * Specifies whether (and optionally in which axes) a Widget may scroll. `true` means this widget may scroll
     * in both axes. May be an object containing boolean `overflowX` and `overflowY` properties which are
     * applied to CSS style properties `overflowX` and `overflowY`. If they are boolean, they are translated to
     * CSS overflow properties thus:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-scrollable)
     */
    scrollable? : boolean|ScrollerConfig|Scroller
    /**
     * Defines what to do if document is scrolled while Widget is visible (only relevant when floating is set to `true`).
     * Valid values: ´null´: do nothing, ´hide´: hide the widget or ´realign´: realign to the target if possible.
     */
    scrollAction? : 'hide'|'realign'|null
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-showAnimation)
     */
    showAnimation? : boolean|object
    /**
     * Set to `false` to not show the tooltip when this widget is [disabled](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-disabled)
     */
    showTooltipWhenDisabled? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * Set to `true` to create a split button. A split button has a main action and a dropdown arrow to show a menu.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-split)
     */
    split? : boolean|'mouseover'|'hover'
    /**
     * Set to `true` to perform action on clicking the button if it's already pressed
     * and belongs to a [toggleGroup](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-toggleGroup).
     */
    supportsPressedClick? : boolean
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * The tab index of the button, or `null` for natural tab order (recommended). Setting to `0` is equivalent
     * to natural tab order, but is unnecessary for buttons since they are naturally tabbable (i.e., accessible
     * via the TAB key). Setting to `-1` disables tabbability but allows for focus to be set to the element
     * programmatically.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-tabIndex)
     */
    tabIndex? : number
    /**
     * The tag name of this Widget's root element
     */
    tag? : string
    /**
     * The `target` attribute for the [href](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-href) config
     */
    target? : string
    /**
     * The button's text. You can also supply a [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) or an array of DomConfigs for complex button
     * content.
     */
    text? : string|DomConfig|DomConfig[]
    /**
     * Text alignment: 'left', 'center' or 'right'. Also accepts direction neutral 'start' and 'end'.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-textAlign)
     */
    textAlign? : 'left'|'center'|'right'|'start'|'end'
    /**
     * A title to display for the widget. Only in effect when inside a container that uses it (such as TabPanel)
     */
    title? : string
    /**
     * Enabled toggling of the button (stays pressed when pressed).
     */
    toggleable? : boolean
    /**
     * Indicates that this button is part of a group where only one button can be pressed. Assigning a value
     * also sets `toggleable` to `true`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-toggleGroup)
     */
    toggleGroup? : string
    /**
     * Tooltip for the widget, either as a string or as a Tooltip config object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-tooltip)
     */
    tooltip? : string|TooltipConfig|null
    type? : 'button'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-ui)
     */
    ui? : string|object
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-x)
     */
    x? : number
    /**
     * The y position for the widget.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-y)
     */
    y? : number

    // Events
    /**
     * Fires when the default action is performed (the button is clicked)
     * @param {object} event Event object
     * @param {Core.widget.Button} event.source The button
     * @param {Event} event.event DEPRECATED - Use domEvent instead.
     * @param {Event} event.domEvent The triggering DOM event. Using the `pointerType` property of this event can help determine if it was a mouse, touch or pen action.
     */
    onAction? : ((event: { source: Button, event: Event, domEvent: Event }) => void)|string
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
     * This event is triggered when the button's menu is about to be shown.
     * @param {object} event Event object
     * @param {Core.widget.Button} event.source This Button instance.
     * @param {Core.widget.Menu} event.menu This button's menu instance.
     * @param {boolean} event.userAction `true` if the toggle was triggered by a user action (click), `false` if it was triggered programmatically.
     * @param {Event} event.domEvent The original DOM event that triggered the action, if any. Using the `pointerType` property of this event can help determine if it was a mouse, touch or pen action.
     */
    onBeforeShowMenu? : ((event: { source: Button, menu: Menu, userAction: boolean, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before the button is toggled (the [pressed](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#property-pressed) state is changed). If the button is part of
     * a [toggleGroup](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-toggleGroup) and you need to process the pressed button only, consider using
     * [click](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#event-click) event or [action](#Core/widget/Button#event-action) event.
     * Return `false` to prevent the toggle to the new pressed state.
     * @param {object} event Event object
     * @param {Core.widget.Button} event.source Toggled button
     * @param {boolean} event.pressed New pressed state
     * @param {boolean} event.userAction `true` if the toggle was triggered by a user action (click), `false` if it was triggered programmatically.
     * @param {Event} event.domEvent The original DOM event that triggered the action, if any. Using the `pointerType` property of this event can help determine if it was a mouse, touch or pen action.
     */
    onBeforeToggle? : ((event: { source: Button, pressed: boolean, userAction: boolean, domEvent: Event }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires when any other event is fired from the object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#event-catchAll)
     * @param {object} event Event object
     * @param {{[key: string]: any, type: string}} event.event The Object that contains event details
     * @param {string} event.event.type The type of the event which is caught by the listener
     */
    onCatchAll? : ((event: {[key: string]: any, type: string}) => void)|string
    /**
     * Fires when the button is clicked
     * @param {object} event Event object
     * @param {Core.widget.Button} event.source The button
     * @param {Event} event.event DEPRECATED - Use domEvent instead.
     * @param {Event} event.domEvent The triggering DOM event. Using the `pointerType` property of this event can help determine if it was a mouse, touch or pen action.
     */
    onClick? : ((event: { source: Button, event: Event, domEvent: Event }) => void)|string
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
     * Triggered when a widget which had been in a non-visible state for any reason
     * achieves visibility.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#event-paint)
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
     * Fires when the button is toggled via a UI interaction (the [pressed](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#property-pressed) state is changed). If the button is part of a
     * [toggleGroup](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#config-toggleGroup) and you need to process the pressed button only, consider using
     * [click](https://bryntum.com/products/gantt/docs/api/Core/widget/Button#event-click) event or [action](#Core/widget/Button#event-action) event.
     * @param {object} event Event object
     * @param {Core.widget.Button} event.source Toggled button
     * @param {boolean} event.pressed New pressed state
     * @param {boolean} event.userAction `true` if the toggle was triggered by a user action (click), `false` if it was triggered programmatically.
     * @param {Event} event.domEvent The original DOM event that triggered the action, if any. Using the `pointerType` property of this event can help determine if it was a mouse, touch or pen action.
     */
    onToggle? : ((event: { source: Button, pressed: boolean, userAction: boolean, domEvent: Event }) => void)|string

}

export class BryntumButton extends React.Component<BryntumButtonProps> {

    static instanceClass = Button;

    static instanceName = 'Button';

    processWidgetContent = processWidgetContent;

    static configNames = [
        'adopt',
        'align',
        'anchor',
        'ariaDescription',
        'ariaLabel',
        'bubbleEvents',
        'centered',
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
        'htmlCls',
        'ignoreParentReadOnly',
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
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showTooltipWhenDisabled',
        'supportsPressedClick',
        'tab',
        'tag',
        'textAlign',
        'title',
        'type',
        'ui',
        'weight'
    ];

    static propertyConfigNames = [
        'alignSelf',
        'appendTo',
        'badge',
        'behaviorType',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'cls',
        'column',
        'content',
        'dataset',
        'disabled',
        'extraData',
        'flex',
        'height',
        'hidden',
        'href',
        'html',
        'icon',
        'iconAlign',
        'id',
        'insertBefore',
        'insertFirst',
        'keyMap',
        'margin',
        'maxHeight',
        'maximizeOnMobile',
        'maxWidth',
        'menu',
        'menuIcon',
        'minHeight',
        'minWidth',
        'onAction',
        'onBeforeDestroy',
        'onBeforeHide',
        'onBeforeShow',
        'onBeforeShowMenu',
        'onBeforeToggle',
        'onCatchAll',
        'onClick',
        'onDestroy',
        'onElementCreated',
        'onFocusIn',
        'onFocusOut',
        'onHide',
        'onPaint',
        'onReadOnly',
        'onRecompose',
        'onResize',
        'onShow',
        'onToggle',
        'pressed',
        'pressedCls',
        'pressedIcon',
        'readOnly',
        'rendition',
        'rtl',
        'scrollable',
        'span',
        'split',
        'tabIndex',
        'target',
        'text',
        'toggleable',
        'toggleGroup',
        'tooltip',
        'width',
        'x',
        'y'
    ];

    static propertyNames = [
        'anchorSize',
        'focusVisible',
        'parent'
    ];

    // Component instance
    instance!: Button;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumButtonProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-button-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
