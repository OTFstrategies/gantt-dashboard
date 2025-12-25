import React from 'react';
import ReactDOM, { flushSync } from 'react-dom';
import { DomHelper, StringHelper, Widget } from '@bryntum/gantt';
function devWarning(clsName, msg) {
    var _a;
    if (((_a = window.bryntum) === null || _a === void 0 ? void 0 : _a.isTestEnv) || process.env.NODE_ENV === 'development') {
        console.warn(`Bryntum${clsName}Component development warning!\n${msg}\n` +
            'Please check React integration guide: https://bryntum.com/products/gantt/docs/guide/Gantt/integration/react/guide');
    }
}
function devWarningContainer(clsName, containerParam) {
    devWarning(clsName, `Using "${containerParam}" parameter for configuration is not recommended.\n` +
        "Widget is placed automatically inside it's container element.\n" +
        `Solution: remove "${containerParam}" parameter from configuration.`);
}
function devWarningConfigProp(clsName, prop) {
    devWarning(clsName, `Using "${prop}" parameter for configuration is not recommended.\n` +
        `Solution: Use separate parameter for each "${prop}" value to enable reactive updates of the API instance`);
}
function devWarningProjectProp(clsName) {
    devWarning(clsName, 'Using the "project" prop with inner store configurations is not recommended.\n' +
        `Solution: Use an instance of the 'ProjectModel' class or the '<Bryntum${clsName}ProjectModel/>' component`);
}
function isReactElement(element) {
    return Boolean((element === null || element === void 0 ? void 0 : element.$$typeof) === Symbol.for('react.element') || (element === null || element === void 0 ? void 0 : element.$$typeof) === Symbol.for('react.transitional.element'));
}
function createConfig(reactInstance) {
    const { element, props, constructor } = reactInstance, { instanceClass, instanceName, isView } = constructor, filter = (arr) => arr.filter(prop => props[prop] !== undefined), configNames = filter(constructor.configNames || []), propertyConfigNames = filter(constructor.propertyConfigNames || []), propertyNames = filter(constructor.propertyNames || []), featureNames = filter(constructor.featureNames || []), bryntumConfig = {
        adopt: undefined,
        appendTo: undefined,
        href: undefined,
        reactComponent: reactInstance,
        listeners: {},
        features: {},
        hasFrameworkRenderer: isView ? hasFrameworkRenderer : undefined,
        processCellContent: isView ? processCellContent : undefined,
        processCellEditor: isView ? processCellEditor : undefined,
        processEventContent: isView ? processEventContent : undefined,
        processTaskItemContent: isView ? processTaskItemContent : undefined,
        processResourceHeader: isView ? processResourceHeader : undefined
    };
    const isDataStoreConfig = (prop) => {
        if (reactInstance.dataStores) {
            const dataStoreNames = Object.values(reactInstance.dataStores);
            return dataStoreNames.includes(prop) || dataStoreNames.includes(`${prop}Data`);
        }
    };
    configNames
        .concat(propertyConfigNames)
        .concat(featureNames)
        .forEach(prop => {
        applyPropValue(bryntumConfig, prop, props[prop]);
        if (['features', 'config'].includes(prop) && !isDataStoreConfig(prop)) {
            devWarningConfigProp(instanceClass.$name, prop);
        }
        if (prop === 'project' && reactInstance.projectStores) {
            if (Object.values(reactInstance.dataStores).some(store => props[prop][store])) {
                devWarningProjectProp(instanceClass.$name);
            }
        }
    });
    reactInstance.configNames = configNames;
    reactInstance.propertyNames = configNames
        .concat(propertyNames)
        .concat(propertyConfigNames)
        .concat(featureNames);
    if (reactInstance.dataStores) {
        Object.values(reactInstance.dataStores).forEach((dataName) => {
            if (props[dataName]) {
                bryntumConfig[dataName] = props[dataName];
            }
        });
    }
    if (reactInstance.propertyConfigNames) {
        delete reactInstance.propertyConfigNames;
    }
    if (reactInstance.featureNames) {
        delete reactInstance.featureNames;
    }
    const containerParam = ['adopt', 'appendTo', 'insertAfter', 'insertBefore'].find(prop => bryntumConfig[prop]);
    if (!containerParam) {
        if (instanceName === 'Button') {
            bryntumConfig.appendTo = element;
        }
        else {
            bryntumConfig.adopt = element;
        }
    }
    else {
        devWarningContainer(instanceClass.$name, containerParam);
    }
    return bryntumConfig;
}
function applyPropValue(configOrInstance, prop, value, isConfig = true) {
    var _a;
    if ((_a = value === null || value === void 0 ? void 0 : value.current) === null || _a === void 0 ? void 0 : _a.instance) {
        value = value.current.instance;
    }
    if (prop === 'features' && typeof value === 'object') {
        Object.keys(value).forEach(key => applyPropValue(configOrInstance, `${key}Feature`, value[key], isConfig));
    }
    else if (prop === 'config' && typeof value === 'object') {
        Object.keys(value).forEach(key => applyPropValue(configOrInstance, key, value[key], isConfig));
    }
    else if (prop === 'columns' && !isConfig) {
        configOrInstance.columns = value;
    }
    else if (prop.endsWith('Feature')) {
        const { features } = configOrInstance, featureName = prop.replace('Feature', '');
        if (isConfig) {
            features[featureName] = value;
        }
        else {
            const feature = features[featureName];
            if (feature) {
                feature.setConfig(value);
            }
        }
    }
    else {
        configOrInstance[prop] = value;
    }
}
function createWidget(component) {
    const { instanceClass, isView } = component.constructor, config = createConfig(component), instance = instanceClass.$name === 'Widget' ? Widget.create(config) : new instanceClass(config);
    if (isView) {
        component[StringHelper.uncapitalize(instanceClass.$name) + 'Instance'] = instance;
    }
    if (isView) {
        component[StringHelper.uncapitalize(instanceClass.$name) + 'Instance'] = instance;
        const subscribeStores = (storeInstance, stores) => {
            if (stores) {
                Object.keys(stores).forEach(storeName => {
                    const store = storeInstance[storeName];
                    if (store) {
                        if (store.syncDataOnLoad == null && !store.readUrl && !store.lazyLoad && (!store.crudManager || !store.crudManager.loadUrl)) {
                            store.syncDataOnLoad = true;
                        }
                        store.on('beforeRemove', (context) => beforeRemoveRecords(component, context));
                    }
                });
            }
        };
        subscribeStores(component.projectStores ? instance.project : instance, component.dataStores);
    }
    if (config['data']) {
        instance.lastDataset = config['data'].slice();
    }
    return instance;
}
function getPortalId(id, columnId) {
    return `portal-${id}-${columnId}`;
}
function deletePortal(component, portalId) {
    var _a;
    const portal = component.state.portals.get(portalId);
    if (portal) {
        const portalContainer = portal.containerInfo;
        component.state.portals.delete(portalId);
        (_a = portalContainer.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(portalContainer);
    }
}
function releaseReactCell(component, cellElement) {
    const { id, columnId, hasPortal } = cellElement._domData;
    if (hasPortal) {
        const portalId = getPortalId(id, columnId);
        deletePortal(component, portalId);
    }
}
function beforeRemoveRecords(component, { records, removingAll }) {
    const { instance } = component;
    if (removingAll) {
        [...component.state.portals.keys()].forEach(portalId => deletePortal(component, portalId));
    }
    else {
        records.forEach(record => {
            const row = instance.getRowById ? instance.getRowById(record.id) : undefined;
            if (row) {
                row.cells.forEach((cell) => {
                    releaseReactCell(component, cell);
                });
            }
        });
    }
}
function updateGeneration(component, thisTick = false, callback = () => { }) {
    const updateState = () => {
        component.setState((currentState) => {
            return Object.assign(Object.assign({}, currentState), { generation: currentState.generation + 1 });
        }, callback);
    };
    if (thisTick) {
        updateState();
    }
    else {
        requestAnimationFrame(updateState);
    }
}
function shouldComponentUpdate(component, nextProps, nextState) {
    var _a;
    const { props, instance, propertyNames } = component;
    propertyNames.forEach((prop) => {
        if (props[prop] !== nextProps[prop]) {
            applyPropValue(instance, prop, nextProps[prop], false);
        }
    });
    return (nextState === null || nextState === void 0 ? void 0 : nextState.generation) !== ((_a = component.state) === null || _a === void 0 ? void 0 : _a.generation);
}
function hasFrameworkRenderer({ cellContent }) {
    return DomHelper.isReactElement(cellContent);
}
function processCellContent({ rendererData, cellElementData, rendererHtml }) {
    const component = this.reactComponent, { state, portalsCache, portalContainerClass } = component, { cellElement, column, record } = rendererData, portalId = getPortalId(record.id, column.id), renderElement = cellElement.querySelector(column.editTargetSelector) || cellElement;
    if (!renderElement) {
        return;
    }
    if (rendererHtml &&
        DomHelper.isReactElement(rendererHtml) &&
        !record.meta.specialRow) {
        if (renderElement.portalContainer &&
            renderElement.portalContainer.dataset.portalId === portalId) {
            portalsCache.appendChild(renderElement.portalContainer);
            renderElement.portalContainer = null;
        }
        let portal = state.portals.get(portalId), forceFlushSync = false;
        if (rendererData.isMeasuring) {
            if (portal) {
                const portalContainer = portal.containerInfo, parent = portalContainer.parentNode;
                cellElement.style.width = 'auto';
                const cellElementWidth = cellElement.offsetWidth;
                cellElement.appendChild(portalContainer);
                const width = portalContainer.offsetWidth;
                parent.appendChild(portalContainer);
                cellElement.style.width = `${width + cellElementWidth}px`;
            }
            return;
        }
        if (portal && (portal.generation !== record.generation || this.isExporting || this.$isCollapsing)) {
            deletePortal(component, portalId);
            portal = null;
            forceFlushSync = true;
        }
        const childPortalContainer = renderElement.querySelector(`.${portalContainerClass}`);
        if (childPortalContainer && childPortalContainer.dataset.portalId !== portalId) {
            portalsCache.appendChild(childPortalContainer);
        }
        if (renderElement.textContent && renderElement === cellElement) {
            renderElement.textContent = '';
        }
        if (portal) {
            renderElement.appendChild(portal.containerInfo);
            renderElement.portalContainer = portal.containerInfo;
        }
        else {
            const portalContainer = DomHelper.append(renderElement, {
                tag: 'div',
                className: portalContainerClass,
                dataset: { portalId }
            });
            renderElement.portalContainer = portalContainer;
            portal = ReactDOM.createPortal(rendererHtml, portalContainer, portalId);
            state.portals.set(portalId, portal);
            if (forceFlushSync) {
                flushSync(() => updateGeneration(component, true));
                forceFlushSync = false;
            }
            else {
                updateGeneration(component, this.isExporting);
            }
        }
        cellElementData.hasPortal = true;
        portal.generation = record.generation;
    }
    else if (!rendererHtml && cellElementData.hasPortal) {
        cellElement.portalContainer.remove();
        cellElementData.hasPortal = false;
    }
}
function processCellEditor({ editor, field }) {
    const component = this.reactComponent;
    if (!component || typeof editor !== 'function') {
        return;
    }
    const wrapperWidget = new Widget({
        name: field,
        allowMouseEvents: true,
        assignValue(values, key, value) {
            this.setValue(value);
        }
    });
    const widgetRef = React.createRef();
    wrapperWidget['reactRef'] = widgetRef;
    const editorComponent = editor(widgetRef, this);
    if (!DomHelper.isReactElement(editorComponent)) {
        throw new Error('Expect a React element');
    }
    let editorValidityChecked = false;
    wrapperWidget.setValue = async (value) => {
        const widget = widgetRef.current;
        if (widget) {
            if (!editorValidityChecked) {
                const cellMethods = ['setValue', 'getValue', 'isValid', 'focus'], misses = cellMethods.filter(fn => !(fn in widget));
                if (misses.length > 0) {
                    throw new Error(`Missing method(s) ${misses.join(', ')} in ${widget.constructor.name}. Cell editors must ${cellMethods.join(', ')}`);
                }
                editorValidityChecked = true;
            }
            const context = wrapperWidget.owner['cellEditorContext'];
            await widget.setValue(value, context);
        }
        else {
            wrapperWidget.firstValue = value;
        }
    };
    Object.defineProperty(wrapperWidget, 'value', {
        enumerable: true,
        configurable: true,
        get() {
            const widget = widgetRef.current;
            return widget === null || widget === void 0 ? void 0 : widget.getValue();
        }
    });
    Object.defineProperty(wrapperWidget, 'isValid', {
        enumerable: true,
        configurable: true,
        get() {
            const widget = widgetRef.current;
            return widget === null || widget === void 0 ? void 0 : widget.isValid();
        }
    });
    wrapperWidget.focus = () => {
        var _a;
        const widget = widgetRef.current;
        if (!widget) {
            wrapperWidget.focusPending = true;
        }
        else {
            (_a = widget.focus) === null || _a === void 0 ? void 0 : _a.call(widget);
        }
    };
    const portal = ReactDOM.createPortal(editorComponent, wrapperWidget.element);
    wrapperWidget['reactPortal'] = portal;
    const { state } = component;
    state.portals.set(`portal-${field}`, portal);
    updateGeneration(component, true, () => {
        if (wrapperWidget.firstValue !== undefined) {
            wrapperWidget.setValue(wrapperWidget.firstValue);
            delete wrapperWidget.firstValue;
        }
        if (wrapperWidget.focusPending) {
            wrapperWidget.focus();
            delete wrapperWidget.focusPending;
        }
    });
    return { editor: wrapperWidget };
}
function processWidgetContent({ reactElement, widget, reactComponent, contentElement }) {
    var _a;
    const portals = (_a = reactComponent === null || reactComponent === void 0 ? void 0 : reactComponent.state) === null || _a === void 0 ? void 0 : _a.portals, portalId = widget === null || widget === void 0 ? void 0 : widget.id;
    if (isReactElement(reactElement)) {
        if (!portals.has(portalId) && widget.html) {
            widget.contentElement.innerHTML = '';
        }
        const portal = ReactDOM.createPortal(reactElement, contentElement || widget.contentElement);
        portals.set(portalId, portal);
        if (widget.isTooltip && !widget.html) {
            flushSync(() => updateGeneration(reactComponent, true));
        }
        else {
            updateGeneration(reactComponent, true);
        }
        return portal;
    }
    else if (portals === null || portals === void 0 ? void 0 : portals.has(portalId)) {
        portals.delete(portalId);
        flushSync(() => updateGeneration(reactComponent, true));
    }
}
function processTaskItemContent({ jsx, targetElement, reactComponent, domConfig }) {
    if (!reactComponent || !jsx) {
        return;
    }
    const { state } = reactComponent, { portals } = state, cardElement = targetElement.closest('.b-task-board-card'), portalId = `task-item-${domConfig.reference}-${cardElement === null || cardElement === void 0 ? void 0 : cardElement.elementData.taskId}`, portal = ReactDOM.createPortal(jsx, targetElement, portalId);
    portals.set(portalId, portal);
    updateGeneration(reactComponent);
}
function processCalendarEventContent({ jsx, action, domConfig, targetElement, reactComponent }) {
    var _a, _b, _c, _d, _e;
    const me = this, returnValue = false, { state } = reactComponent, { portals } = state, wrap = targetElement.closest('.b-cal-event-wrap'), dataHolder = targetElement.closest('[data-date]'), refHolder = targetElement.closest('[data-ref]'), mode = typeof this.mode === 'string' ? this.mode : (_b = (_a = this.mode) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.slice(0, 4), lastPortalId = wrap === null || wrap === void 0 ? void 0 : wrap.dataset.lastPortalId, portalKey = ((_c = domConfig.dataset) === null || _c === void 0 ? void 0 : _c.date) || ((_d = (dataHolder)) === null || _d === void 0 ? void 0 : _d.dataset.date), containerRef = (_e = refHolder === null || refHolder === void 0 ? void 0 : refHolder.dataset) === null || _e === void 0 ? void 0 : _e.ref;
    reactComponent.syncContent = reactComponent.syncContent || function (fn) {
        flushSync(fn);
    };
    let portalId = `portal-${mode}-${wrap === null || wrap === void 0 ? void 0 : wrap.dataset.eventId}`;
    me.portalKey = portalKey === undefined ? me.portalKey : portalKey;
    me.containerRef = containerRef === undefined ? me.containerRef : containerRef;
    if (action === 'none' || action === 'reuseElement') {
        return returnValue;
    }
    if (action === 'removeElement' && lastPortalId) {
        portals.delete(lastPortalId);
        updateGeneration(reactComponent);
    }
    if (jsx && wrap) {
        portalId = `${portalId}-${me.portalKey}-${me.containerRef}`;
        const parent = wrap.querySelector('.b-cal-event-desc');
        parent.innerHTML = '';
        const jsxContainer = DomHelper.createElement({
            className: 'b-jsx-container',
            parent,
            retainElement: true
        }), portal = ReactDOM.createPortal(jsx, jsxContainer);
        portals.set(portalId, portal);
        reactComponent.syncContent(() => {
            updateGeneration(reactComponent, true);
        });
        wrap.dataset.lastPortalId = portalId;
    }
    return returnValue;
}
function processEventContent({ jsx, action, targetElement, isRelease, reactComponent, scrolling, domConfig }) {
    var _a, _b, _c, _d, _e;
    if (this.type === 'calendar' && this.mode !== 'timeline' && ((_a = this.mode) === null || _a === void 0 ? void 0 : _a.type) !== 'scheduler') {
        return processCalendarEventContent.call(this, arguments[0]);
    }
    const { eventResize, eventDrag, eventEdit } = this.features;
    if (!reactComponent || action === 'none' || ((eventResize === null || eventResize === void 0 ? void 0 : eventResize.isResizing) && !eventResize.dragging.completed && !scrolling)) {
        return false;
    }
    const domConfigData = this.isVertical ? (_b = domConfig === null || domConfig === void 0 ? void 0 : domConfig.elementData) === null || _b === void 0 ? void 0 : _b.renderData : domConfig === null || domConfig === void 0 ? void 0 : domConfig.elementData;
    let wrap = targetElement, parent = null, segment = '', returnValue = false;
    if (jsx) {
        if ((_c = domConfig === null || domConfig === void 0 ? void 0 : domConfig.dataset) === null || _c === void 0 ? void 0 : _c.isMilestone) {
            wrap = targetElement.parentElement.parentElement.parentElement;
            parent = targetElement.parentElement;
        }
        else {
            wrap = targetElement.parentElement.parentElement;
            parent = targetElement;
        }
        if (!wrap.elementData) {
            wrap = wrap.closest('.b-sch-event-wrap');
            segment = ((_d = parent.parentElement.dataset) === null || _d === void 0 ? void 0 : _d.segment) || '';
        }
    }
    else if (!(domConfigData === null || domConfigData === void 0 ? void 0 : domConfigData.isWrap) || domConfigData.eventRecord.isResourceTimeRange) {
        return returnValue;
    }
    const wrapData = this.isVertical ? wrap.elementData.renderData : wrap.elementData, currentData = domConfigData !== null && domConfigData !== void 0 ? domConfigData : wrapData, { assignmentRecord, eventRecord } = currentData, { state } = reactComponent, { portals } = state, isRecurring = eventRecord.isRecurring || eventRecord.isOccurrence, isExporting = this.isExporting, portalId = `assignment-${assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.id}${isRecurring ? '-' + (((_e = eventRecord.recurrence) === null || _e === void 0 ? void 0 : _e.id) || '') : ''}${segment ? '-' + segment : ''}${this.isExporting ? '-export' : ''}`;
    reactComponent.syncContent = reactComponent.syncContent || function (fn) {
        flushSync(fn);
    };
    if (isRelease && !isRecurring) {
        if (portals.has(portalId)) {
            deletePortal(reactComponent, portalId);
            updateGeneration(reactComponent, true);
        }
    }
    else {
        jsx = jsx || (action === 'reuseOwnElement' && wrap.lastJSX);
        if (jsx) {
            parent = parent || wrap.querySelector('.b-sch-event-content');
            const portal = portals.get(portalId), updateContent = () => {
                parent.innerHTML = '';
                const jsxContainer = DomHelper.createElement({
                    className: 'b-jsx-container b-event-text-wrap',
                    parent,
                    retainElement: true
                }), portal = ReactDOM.createPortal(jsx, jsxContainer);
                portal.eventGeneration = wrap.elementData.eventGeneration;
                wrap.lastJSX = jsx;
                portals.set(portalId, portal);
                if (isExporting) {
                    flushSync(() => updateGeneration(reactComponent, true));
                }
                else {
                    updateGeneration(reactComponent, true);
                }
            }, isEditing = eventEdit === null || eventEdit === void 0 ? void 0 : eventEdit.isEditing, isDragging = eventDrag === null || eventDrag === void 0 ? void 0 : eventDrag.isDragging;
            if (!portal || isRecurring || isExporting || portal.eventGeneration !== wrap.elementData.eventGeneration) {
                if ((scrolling || !isDragging) && !isEditing) {
                    updateContent();
                }
                else {
                    reactComponent.syncContent(updateContent);
                }
            }
            returnValue = true;
        }
    }
    return returnValue;
}
function processResourceHeader({ jsx, targetElement }) {
    if (!jsx) {
        return;
    }
    const { reactComponent } = this, { state } = reactComponent, { portals } = state, portalId = `resource-header-${targetElement.dataset.resourceId}`;
    if (portals.has(portalId)) {
        portals.delete(portalId);
        updateGeneration(reactComponent, true);
    }
    portals.set(portalId, ReactDOM.createPortal(jsx, targetElement));
    updateGeneration(reactComponent);
}
function handleReactElement(widget, element) {
    var _a;
    const parent = widget.closest((c) => Boolean(c.reactComponent)), reactComponent = (parent === null || parent === void 0 ? void 0 : parent.reactComponent) ||
        ((_a = Widget.query((c) => { var _a; return Boolean((_a = c.reactComponent) === null || _a === void 0 ? void 0 : _a.state); })) === null || _a === void 0 ? void 0 : _a.reactComponent);
    reactComponent === null || reactComponent === void 0 ? void 0 : reactComponent.processWidgetContent({
        reactElement: element,
        widget,
        reactComponent
    });
}
function handleReactHeaderElement(column, headerElement, html) {
    const { reactComponent } = column.grid, contentElement = headerElement.querySelector('.b-grid-header-text-content');
    reactComponent === null || reactComponent === void 0 ? void 0 : reactComponent.processWidgetContent({
        reactElement: html,
        widget: { id: column.id },
        reactComponent,
        contentElement
    });
}
export { createWidget, shouldComponentUpdate, processWidgetContent };
window.bryntum = window.bryntum || {};
window.bryntum.react = {
    isReactElement,
    handleReactHeaderElement,
    handleReactElement
};
//# sourceMappingURL=WrapperHelper.js.map