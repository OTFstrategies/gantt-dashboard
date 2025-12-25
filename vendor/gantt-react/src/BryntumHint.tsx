/**
 * React wrapper for Bryntum Hint
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AlignSpec, Base, ButtonConfig, Container, ContainerItemConfig, ContainerLayoutConfig, DomConfig, Hint, HintActions, HintListeners, KeyMapConfig, Layout, MaskConfig, MenuItemConfig, Model, PagingToolbarConfig, Panel, PanelCollapserConfig, PanelCollapserOverlayConfig, PanelHeader, Popup, Rectangle, Scroller, ScrollerConfig, StateProvider, TabConfig, Tool, ToolConfig, ToolbarConfig, ToolbarItems, TooltipConfig, VueConfig, Widget } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumHintProps = {
    // Configs
    /**
     * Element (or element id) to adopt as this Widget's encapsulating element. The widget's
     * content will be placed inside this element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-adopt)
     */
    adopt? : HTMLElement|string
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-align)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-ariaDescription)
     */
    ariaDescription? : string
    /**
     * A localizable string (May contain `'L{}'` tokens which resolve in the locale file) to inject as
     * the `aria-label` attribute.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-ariaLabel)
     */
    ariaLabel? : string
    /**
     * Either the number of milliseconds to wait before automatically moving to the next hint, or a CSS selector
     * to wait for before moving to the next hint.
     */
    autoNext? : string|number
    /**
     * Update assigned [record](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-record) automatically on field changes
     */
    autoUpdateRecord? : boolean
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar. Another way to add a bbar is to use [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-bbar)
     */
    bbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * Custom CSS classes to add to the panel's body element.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-bodyCls)
     */
    bodyCls? : string|object
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Overrides for buttons to show in the hint.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-buttons)
     */
    buttons? : Record<string, ButtonConfig>
    /**
     * Set to `false` to not call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * Close popup when `ESC` key is pressed.
     */
    closeOnEscape? : boolean
    /**
     * Custom CSS classes to add to element.
     * May be specified as a space separated string, or as an object in which property names
     * with truthy values are used as the class names:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-cls)
     */
    cls? : string|object
    /**
     * Controls whether the panel is collapsed (the body of the panel is hidden while only the header is
     * visible). Only valid if the panel is [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible).
     */
    collapsed? : boolean
    /**
     * This config enables collapsibility for the panel. See [collapsed](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsed).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-collapsible)
     */
    collapsible? : boolean|PanelCollapserConfig|PanelCollapserOverlayConfig
    /**
     * Applies the specified color to the widget, by setting the `--b-primary` CSS variable in the widgets
     * `style` block.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-color)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-contentElementCls)
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
     * A config object containing default settings to apply to all child widgets.
     */
    defaults? : ContainerItemConfig
    /**
     * Check for CSS compatibility issues when upgrading to v7. Performs the following checks:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-detectCSSCompatibilityIssues)
     */
    detectCSSCompatibilityIssues? : boolean
    /**
     * Disable or enable the widget. It is similar to [readOnly](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-readOnly) except a disabled widget
     * cannot be focused, uses a different rendition (usually greyish) and does not allow selecting its value.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-disabled)
     */
    disabled? : boolean|'inert'
    /**
     * Controls the placement of this widget when it is added to a [panel's ](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel)
     * [strips collection](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips). Typical values for this config are `'top'`,
     * `'bottom'`, `'left'`, or `'right'`, which cause the widget to be placed on that side of the panel's
     * body. Such widgets are called "edge strips".
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-dock)
     */
    dock? : 'top'|'bottom'|'left'|'right'|'start'|'end'|'header'|'pre-header'|object
    /**
     * Set to `false` to prevent dragging the popup element.
     */
    draggable? : boolean|{
        handleSelector?: string
    }
    /**
     * Make this Panel a docked drawer which slides out from one side of the browser viewport by default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-drawer)
     * @param {'start','left','end','right','top','bottom'} side The side of the viewport to dock the drawer to.  * `'start'` means the `inline-start` side. * `'end'` means the `inline-end` side.
     * @param {string,number} size The size of the drawer in its collapsible axis.
     * @param {boolean} inline If using the [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-appendTo) config to place the drawer inside a host widget, this may be set to `true` to make the drawer inline within that host. Note that, if using this, the layout of the host element must have `flex-direction` set appropriately.
     * @param {boolean,object} autoClose Specifies what user actions should automatically close the drawer. Defaults to closing when the user clicks outside of the drawer or when focus moves outside of the drawer.
     * @param {boolean,string} autoClose.mousedown If the user clicks outside of the drawer, the drawer will automatically be hidden. If the value is a string, it is used as a CSS selector to filter clicks which should close the drawer.
     * @param {boolean,string} autoClose.focusout If focus moves outside of the drawer, the drawer will automatically be hidden.
     * @param {string} autoClose.mouseout Hides the drawer when the mouse leaves the drawer after the `autoCloseDelay` period.
     * @param {number} autoCloseDelay When using `mouseout`, this is the delay in milliseconds
     */
    drawer? : boolean|{side?: 'start'|'left'|'end'|'right'|'top'|'bottom', size?: string|number, inline?: boolean, autoClose: { mousedown?: boolean|string, focusout?: boolean|string, mouseout?: string }, autoCloseDelay?: number}
    /**
     * An object specifying attributes to assign to the root element of this widget.
     * Set `null` value to attribute to remove it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-elementAttributes)
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
     * By default a Popup is focused when it is shown.
     * Configure this as `false` to prevent automatic focus on show.
     */
    focusOnToFront? : boolean
    /**
     * Config object of a footer. May contain a `dock`, `html` and a `cls` property. A footer is not a widget,
     * but rather plain HTML that follows the last element of the panel's body and [strips](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-strips).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-footer)
     */
    footer? : {
        dock?: 'top'|'right'|'bottom'|'left'|'start'|'end'
        html?: string
        cls?: string
    }|string
    /**
     * DOM element to attach popup.
     */
    forElement? : HTMLElement
    /**
     * A config [object](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#typedef-PanelHeader) for the panel's header or a string in place of a `title`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-header)
     */
    header? : string|boolean|PanelHeader
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-hideAnimation)
     */
    hideAnimation? : boolean|object
    /**
     * Specify `true` to make this container hide when it has no visible children (Either empty
     * or all children hidden).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-hideWhenEmpty)
     */
    hideWhenEmpty? : boolean
    /**
     * Specify as a truthy value to highlight the target element with a bright outline.
     */
    highlightTarget? : boolean|{
        ping?: boolean
        center?: string
        inflate?: number|number[]
    }
    /**
     * The HTML to display initially or a function returning the markup (called at widget construction time).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-html)
     * @param {Core.widget.Widget} widget The calling Widget
     * @returns {string}
     */
    html? : string|((widget: Widget) => string)|DomConfig|DomConfig[]|VueConfig
    /**
     * The CSS class(es) to add when HTML content is being applied to this widget.
     */
    htmlCls? : string|object
    /**
     * An icon to show before the [title](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-title). Either pass a CSS class as a string, or pass a
     * [DomConfig](https://bryntum.com/products/gantt/docs/api/Core/helper/DomHelper#typedef-DomConfig) object describing an element to represent the icon.
     */
    icon? : string|DomConfig
    /**
     * Widget id, if not specified one will be generated. Also used for lookups through Widget.getById
     */
    id? : string
    /**
     * Determines if the widgets read-only state should be controlled by its parent.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-ignoreParentReadOnly)
     */
    ignoreParentReadOnly? : boolean
    /**
     * Convenience setting to align input fields of child widgets. By default, the Field input element is
     * placed immediately following the `label`. If you prefer to have all input fields aligned to the
     * right, set this config to `'end'`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-inputFieldAlign)
     */
    inputFieldAlign? : 'start'|'end'
    /**
     * Element (or element id) to insert this widget before. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertBefore? : HTMLElement|string
    /**
     * Element (or element id) to append this widget element to, as a first child. If provided, [appendTo](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-appendTo) config is ignored.
     */
    insertFirst? : HTMLElement|string
    /**
     * An optional CSS class to add to child items of this container.
     */
    itemCls? : string
    /**
     * An object containing typed child widget config objects or Widgets. May also be specified
     * as an array.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-items)
     */
    items? : Record<string, ContainerItemConfig|MenuItemConfig|boolean|null>|(ContainerItemConfig|MenuItemConfig|Widget)[]
    /**
     * The mapping of key names to hint actions.
     * The actions are `previous`, `next`, and `stop`.
     * By default, the following key mappings are used:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-keyMap)
     */
    keyMap? : Record<string, 'previous'|'next'|'stop'>
    /**
     * Convenience setting to use same label placement on all child widgets.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-labelPosition)
     */
    labelPosition? : 'before'|'above'|'align-before'|'auto'|null
    /**
     * The short name of a helper class which manages rendering and styling of child items.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-layout)
     */
    layout? : string|ContainerLayoutConfig
    /**
     * The CSS style properties to apply to the [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-layoutStyle)
     */
    layoutStyle? : object
    /**
     * An array of [child item](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items) *config objects* which is to be converted into
     * instances only when this Container is rendered, rather than eagerly at construct time.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-lazyItems)
     */
    lazyItems? : Record<string, ContainerItemConfig>|ContainerItemConfig[]|Widget[]
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-listeners)
     */
    listeners? : HintListeners
    /**
     * A class translations of which are used for translating this entity.
     * This is often used when translations of an item are defined on its container class.
     * For example:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-localeClass)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-localizableProperties)
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
     * Show a tool in the header to maximize this popup
     */
    maximizable? : boolean
    /**
     * Set to `true` to make this widget take all available space in the visible viewport.
     */
    maximized? : boolean
    /**
     * *Only valid if this Widget is [floating](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-floating).*
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-maximizeOnMobile)
     */
    maximizeOnMobile? : number|string
    /**
     * How long in milliseconds to wait for a target to become available before giving up.
     */
    maxWait? : number
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
     * The elements minWidth. Can be either a String or a Number (which will have 'px' appended). Note that
     * like [width](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#config-width), *reading* the value will return the numeric value in pixels.
     */
    minWidth? : string|number
    /**
     * Optionally show an opaque mask below this Popup when shown.
     * Configure this as `true` to show the mask.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-modal)
     */
    modal? : boolean|{
        closeOnMaskTap?: boolean
        transparent?: boolean
    }
    /**
     * When this is configured as `true` a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
     * is used to monitor this element for size changes caused by either style manipulation, or by CSS
     * layout.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-monitorResize)
     */
    monitorResize? : boolean|{
        immediate?: boolean
    }
    /**
     * An object containing default config objects which may be referenced by name in the [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items)
     * config. For example, a specialized [Menu](https://bryntum.com/products/gantt/docs/api/Core/widget/Menu) subclass may have a `namedItems` default
     * value defined like this:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-namedItems)
     */
    namedItems? : Record<string, ContainerItemConfig>
    /**
     * The actions to take when the 'Next' button is clicked.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-nextAction)
     */
    nextAction? : HintActions|HintActions[]
    /**
     * The owning Widget of this Widget. If this Widget is directly contained (that is, it is one of the
     * [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-items) of a Container), this config will be ignored. In this case
     * the owner is <strong>always</strong> the encapsulating Container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-owner)
     */
    owner? : Widget|any
    /**
     * Set to `true` when a widget is rendered into another widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement), but must
     * not participate in the standard layout of that widget, and must be positioned relatively to that
     * widget's [contentElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-contentElement).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-positioned)
     */
    positioned? : boolean
    /**
     * Prevent tooltip from being displayed on touch devices. Useful for example for buttons that display a
     * menu on click etc, since the tooltip would be displayed at the same time.
     */
    preventTooltipOnTouch? : boolean
    /**
     * The actions to take when the 'Previous' button is clicked.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-previousAction)
     */
    previousAction? : HintActions|HintActions[]
    /**
     * Whether this widget is read-only.  This is only valid if the widget is an input
     * field, <strong>or contains input fields at any depth</strong>.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-readOnly)
     */
    readOnly? : boolean
    /**
     * [Record](https://bryntum.com/products/gantt/docs/api/Core/data/Model) whose values will be used to populate fields in the container.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-record)
     */
    record? : Model
    relayStoreEvents? : boolean
    /**
     * Either a default `rendition` to apply to all child widgets, or a map of renditions keyed by child widget
     * `type`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-rendition)
     */
    rendition? : string|Record<string, string>|null
    /**
     * Configure this property to allow the widget/component to be resized. Pressing <kbd>Shift</kbd> while resizing will
     * constrain the aspect ratio.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-resizable)
     */
    resizable? : boolean|{
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        handles?: object
    }
    /**
     * Configure as `true` to have the component display a translucent ripple when its
     * [focusElement](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-focusElement), or [element](#Core/widget/Widget#property-element) is tapped <em>if the
     * current theme supports ripples</em>. Out of the box, only the Material theme supports ripples.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-ripple)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-rtl)
     */
    rtl? : boolean
    /**
     * Specifies whether (and optionally in which axes) a Widget may scroll. `true` means this widget may scroll
     * in both axes. May be an object containing boolean `overflowX` and `overflowY` properties which are
     * applied to CSS style properties `overflowX` and `overflowY`. If they are boolean, they are translated to
     * CSS overflow properties thus:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-scrollable)
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-showAnimation)
     */
    showAnimation? : boolean|object
    /**
     * Show popup when user clicks the element that it is anchored to. Cannot be combined with showOnHover. Can
     * also be provided as the button number (0: main button, 2: right button).
     */
    showOnClick? : boolean|number
    /**
     * Set to `false` to not show the tooltip when this widget is [disabled](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-disabled)
     */
    showTooltipWhenDisabled? : boolean
    /**
     * Programmatic control over how many columns to span when used in a grid layout.
     */
    span? : number
    /**
     * This value can be one of the following:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-stateful)
     */
    stateful? : boolean|object|string[]
    /**
     * The events that, when fired by this component, should trigger it to save its state by calling
     * [saveState](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#function-saveState).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-statefulEvents)
     */
    statefulEvents? : object|string[]
    /**
     * The key to use when saving this object's state in the [stateProvider](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateProvider). If this config is
     * not assigned, and [stateful](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#config-stateful) is not set to `false`, the [id](#Core/widget/Widget#config-id)
     * (if explicitly specified) will be used as the `stateId`.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-stateId)
     */
    stateId? : string
    /**
     * The `StateProvider` to use to save and restore this object's [state](https://bryntum.com/products/gantt/docs/api/Core/mixin/State#property-state). By default, `state`
     * will be saved using the [default state provider](https://bryntum.com/products/gantt/docs/api/Core/state/StateProvider#property-instance-static).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-stateProvider)
     */
    stateProvider? : StateProvider
    /**
     * Specify `true` to match fields by their `name` property only when assigning a [record](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-record),
     * without falling back to `ref`.
     */
    strictRecordMapping? : boolean
    /**
     * An object containing widgets keyed by name. By default (when no `type` is given), strips are
     * [toolbars](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar). If you want to pass an array, you can use
     * the toolbar's [items](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#config-items).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-strips)
     */
    strips? : Record<string, ContainerItemConfig>
    /**
     * A configuration for the [tab](https://bryntum.com/products/gantt/docs/api/Core/widget/Tab) created for this widget when it is placed in a
     * [TabPanel](https://bryntum.com/products/gantt/docs/api/Core/widget/TabPanel). For example, this config can be used to control the icon of the `tab` for
     * this widget:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-tab)
     */
    tab? : boolean|TabConfig
    /**
     * When this container is used as a tab in a TabPanel, these items are added to the
     * [TabBar](https://bryntum.com/products/gantt/docs/api/Core/widget/TabBar) when this container is the active tab.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-tabBarItems)
     */
    tabBarItems? : ToolbarItems[]|Widget[]
    /**
     * The tag name of this Widget's root element
     */
    tag? : string
    /**
     * The target element to highlight, or a CSS selector to find the target element.
     */
    target? : string|HTMLElement
    /**
     * A Config object representing the configuration of a [Toolbar](https://bryntum.com/products/gantt/docs/api/Core/widget/Toolbar),
     * or array of config objects representing the child items of a Toolbar.
     * This creates a toolbar docked to the top of the panel immediately below the header.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-tbar)
     */
    tbar? : (ContainerItemConfig|string)[]|ToolbarConfig|PagingToolbarConfig|null
    /**
     * Text alignment: 'left', 'center' or 'right'. Also accepts direction neutral 'start' and 'end'.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-textAlign)
     */
    textAlign? : 'left'|'center'|'right'|'start'|'end'
    /**
     * Specify `true` for a container used to show text markup. It will apply the CSS class `b-text-content`
     * which specifies a default max-width that makes long text more readable.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-textContent)
     */
    textContent? : boolean
    /**
     * A title to display in the header or owning TabPanel. Causes creation and docking of a header
     * to the top if no header is configured.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-title)
     */
    title? : string
    /**
     * The [tools](https://bryntum.com/products/gantt/docs/api/Core/widget/Tool) to add either before or after the `title` in the Panel header. Each
     * property name is the reference by which an instantiated tool may be retrieved from the live
     * `[tools](https://bryntum.com/products/gantt/docs/api/Core/widget/mixin/Toolable#property-tools)` property.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-tools)
     */
    tools? : Record<string, ToolConfig>|null
    /**
     * Tooltip for the widget, either as a string or as a Tooltip config object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-tooltip)
     */
    tooltip? : string|TooltipConfig|null
    /**
     * By default, tabbing within a Popup is circular - that is it does not exit.
     * Configure this as `false` to allow tabbing out of the Popup.
     */
    trapFocus? : boolean
    type? : 'hint'
    /**
     * Custom CSS class name suffixes to apply to the elements rendered by this widget. This may be specified
     * as a space separated string, an array of strings, or as an object in which property names with truthy
     * values are used as the class names.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-ui)
     */
    ui? : 'plain'|'toolbar'|string|object
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-x)
     */
    x? : number
    /**
     * The y position for the widget.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#config-y)
     */
    y? : number

    // Events
    /**
     * Fired when the [close](https://bryntum.com/products/gantt/docs/api/Core/widget/Popup#function-close) method is called and the popup is not hidden.
     * May be vetoed by returning `false` from a handler.
     * @param {object} event Event object
     * @param {Core.widget.Popup} event.source This Popup
     */
    onBeforeClose? : ((event: { source: Popup }) => Promise<boolean>|boolean|void)|string
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
     * Fired before this container will load record values into its child fields. This is useful if you
     * want to modify the UI before data is loaded (e.g. set some input field to be readonly)
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The container
     * @param {Core.data.Model} event.record The record
     */
    onBeforeSetRecord? : ((event: { source: Container, record: Model }) => void)|string
    /**
     * Triggered before a widget is shown. Return `false` to prevent the action.
     * @param {object} event Event object
     * @param {Core.widget.Widget,any} event.source The widget being shown
     */
    onBeforeShow? : ((event: { source: Widget|any }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before state is applied to the source. Allows editing the state object or preventing the operation.
     * @param {object} event Event object
     * @param {any} event.state State object config
     */
    onBeforeStateApply? : ((event: { state: any }) => Promise<boolean>|boolean|void)|string
    /**
     * Fired before state is saved by the StateProvider. Allows editing the state object or preventing the operation.
     * @param {object} event Event object
     * @param {any} event.state State object config
     */
    onBeforeStateSave? : ((event: { state: any }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires when any other event is fired from the object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#event-catchAll)
     * @param {object} event Event object
     * @param {{[key: string]: any, type: string}} event.event The Object that contains event details
     * @param {string} event.event.type The type of the event which is caught by the listener
     */
    onCatchAll? : ((event: {[key: string]: any, type: string}) => void)|string
    /**
     * Fires when a Panel is collapsed using the [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible) setting.
     * @param {object} event Event object
     * @param {Core.widget.Panel} event.source This Panel.
     */
    onCollapse? : ((event: { source: Panel }) => void)|string
    /**
     * Fires when an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Fires when a field is mutated and the state of the [hasChanges](https://bryntum.com/products/gantt/docs/api/Core/widget/Container#property-hasChanges) property changes
     * @param {object} event Event object
     * @param {Core.widget.Container} event.source The container.
     * @param {boolean} event.dirty The dirty state of the Container - `true` if there are any fields which have been changed since initial load.
     */
    onDirtyStateChange? : ((event: { source: Container, dirty: boolean }) => void)|string
    /**
     * Triggered when a widget's [element](https://bryntum.com/products/gantt/docs/api/Core/widget/Widget#property-element) is available.
     * @param {object} event Event object
     * @param {HTMLElement} event.element The Widget's element.
     */
    onElementCreated? : ((event: { element: HTMLElement }) => void)|string
    /**
     * Fires when a Panel is expanded using the [collapsible](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-collapsible) setting.
     * @param {object} event Event object
     * @param {Core.widget.Panel} event.source This Panel.
     */
    onExpand? : ((event: { source: Panel }) => void)|string
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
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Core/widget/Hint#event-paint)
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
     * A header [tool](https://bryntum.com/products/gantt/docs/api/Core/widget/Panel#config-tools) has been clicked.
     * @param {object} event Event object
     * @param {Core.widget.Tool} event.source This Panel.
     * @param {Core.widget.Tool} event.tool The tool which is being clicked.
     */
    onToolClick? : ((event: { source: Tool, tool: Tool }) => void)|string

}

export class BryntumHint extends React.Component<BryntumHintProps> {

    static instanceClass = Hint;

    static instanceName = 'Hint';

    processWidgetContent = processWidgetContent;

    static configNames = [
        'adopt',
        'align',
        'anchor',
        'ariaDescription',
        'ariaLabel',
        'autoNext',
        'autoUpdateRecord',
        'bbar',
        'bodyCls',
        'bubbleEvents',
        'buttons',
        'closeOnEscape',
        'collapsible',
        'color',
        'config',
        'constrainTo',
        'contentElementCls',
        'dataField',
        'defaultBindProperty',
        'defaults',
        'detectCSSCompatibilityIssues',
        'dock',
        'draggable',
        'drawer',
        'elementAttributes',
        'floating',
        'focusOnToFront',
        'footer',
        'forElement',
        'header',
        'hideAnimation',
        'hideWhenEmpty',
        'highlightTarget',
        'htmlCls',
        'icon',
        'ignoreParentReadOnly',
        'itemCls',
        'lazyItems',
        'listeners',
        'localeClass',
        'localizable',
        'localizableProperties',
        'maskDefaults',
        'masked',
        'maximizable',
        'maxWait',
        'modal',
        'monitorResize',
        'namedItems',
        'nextAction',
        'owner',
        'positioned',
        'preventTooltipOnTouch',
        'previousAction',
        'relayStoreEvents',
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showOnClick',
        'showTooltipWhenDisabled',
        'stateful',
        'statefulEvents',
        'stateId',
        'stateProvider',
        'strips',
        'tab',
        'tabBarItems',
        'tag',
        'target',
        'tbar',
        'textAlign',
        'textContent',
        'trapFocus',
        'type',
        'ui',
        'weight'
    ];

    static propertyConfigNames = [
        'alignSelf',
        'appendTo',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'cls',
        'collapsed',
        'column',
        'content',
        'dataset',
        'disabled',
        'extraData',
        'flex',
        'height',
        'hidden',
        'html',
        'id',
        'inputFieldAlign',
        'insertBefore',
        'insertFirst',
        'items',
        'keyMap',
        'labelPosition',
        'layout',
        'layoutStyle',
        'margin',
        'maxHeight',
        'maximized',
        'maximizeOnMobile',
        'maxWidth',
        'minHeight',
        'minWidth',
        'onBeforeClose',
        'onBeforeDestroy',
        'onBeforeHide',
        'onBeforeSetRecord',
        'onBeforeShow',
        'onBeforeStateApply',
        'onBeforeStateSave',
        'onCatchAll',
        'onCollapse',
        'onDestroy',
        'onDirtyStateChange',
        'onElementCreated',
        'onExpand',
        'onFocusIn',
        'onFocusOut',
        'onHide',
        'onPaint',
        'onReadOnly',
        'onRecompose',
        'onResize',
        'onShow',
        'onToolClick',
        'readOnly',
        'record',
        'rendition',
        'resizable',
        'rtl',
        'scrollable',
        'span',
        'strictRecordMapping',
        'title',
        'tools',
        'tooltip',
        'width',
        'x',
        'y'
    ];

    static propertyNames = [
        'anchorSize',
        'focusVisible',
        'hasChanges',
        'isSettingValues',
        'isValid',
        'parent',
        'state',
        'values'
    ];

    // Component instance
    instance!: Hint;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumHintProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        const className = `b-react-hint-container`;
        return (
            <div className={className} ref={(element) => (this.element = element!)}></div>
        );

    }
}
