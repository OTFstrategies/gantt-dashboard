/**
 * React wrapper for Bryntum ProjectModel
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { RefObject } from 'react';
import { AbstractCrudManager, AssignmentModel, AssignmentModelConfig, AssignmentStore, AssignmentStoreConfig, Base, CalendarManagerStore, CalendarManagerStoreConfig, CalendarModel, CalendarModelConfig, CoreStateTrackingManager, CrudManagerRequestResponse, CrudManagerStoreDescriptor, DependencyModel, DependencyModelConfig, DependencyStore, DependencyStoreConfig, DurationUnit, EventSegmentModel, LazyLoadCrudManagerRequestParams, Model, ModelConfig, ProjectModel, ProjectModelListeners, ResourceModel, ResourceModelConfig, ResourceStore, ResourceStoreConfig, StateTrackingManagerConfig, Store, StoreConfig, TaskModel, TaskModelConfig, TaskStore, TaskStoreConfig, TimeRangeModel, TimeRangeModelConfig, TimeRangeStore, TimeRangeStoreConfig, TimeSpan, TimeSpanConfig } from '@bryntum/gantt';

import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';

export type BryntumGanttProjectModelProps = {
    // Configs
    /**
     * If this flag is set to `true` (default) when a start/end date is set on the event, a corresponding
     * `start-no-earlier/later-than` constraint is added, automatically. This is done in order to
     * keep the event "attached" to this date, according to the user intention.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-addConstraintOnDateSet)
     */
    addConstraintOnDateSet? : boolean
    /**
     * This config manages DST correction in the scheduling engine. It only has effect when DST transition hour is
     * working time. Usually DST transition occurs on Sunday, so with non working weekends the DST correction logic
     * is not involved.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-adjustDurationToDST)
     */
    adjustDurationToDST? : boolean
    /**
     * If this field is set to `true` scheduling conflicts
     * will include an additional resolution option to "postpone" the conflict resolution.
     * The conflict then is stored in the task
     * [postponedConflict](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-postponedConflict) field
     * and can be visualized with the [TaskInfoColumn](https://bryntum.com/products/gantt/docs/api/Gantt/column/TaskInfoColumn).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-allowPostponedConflicts)
     */
    allowPostponedConflicts? : boolean
    /**
     * The constructor of the assignment model class, to be used in the project. Will be set as the [modelClass](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-modelClass)
     * property of the [assignmentStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-assignmentStore)
     */
    assignmentModelClass? : typeof AssignmentModel
    /**
     * Data use to fill the [assignmentStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-assignmentStore). Should be an array of
     * [AssignmentModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/AssignmentModel) or its configuration objects.
     */
    assignments? : AssignmentModel[]|AssignmentModelConfig[]
    /**
     * The initial data, to fill the [assignmentStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-assignmentStore) with.
     * Should be an array of [AssignmentModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/AssignmentModel) or configuration objects.
     * @deprecated 6.3.0 Use [assignments](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-assignments) instead
     */
    assignmentsData? : AssignmentModelConfig[]|AssignmentModel[]
    /**
     * An [AssignmentStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/AssignmentStore) instance or a config object.
     */
    assignmentStore? : AssignmentStore|AssignmentStoreConfig
    /**
     * The constructor to create a dependency store instance with. Should be a class, subclassing the [AssignmentStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/AssignmentStore)
     */
    assignmentStoreClass? : typeof AssignmentStore
    /**
     * `true` to enable automatic [% done](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-percentDone) calculation for summary
     * tasks, `false` to disable it.
     */
    autoCalculatePercentDoneForParentTasks? : boolean
    /**
     * Specify `true` to automatically call [load](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) method on the next frame after creation.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-autoLoad)
     */
    autoLoad? : boolean
    /**
     * When `true` (default) adjacent or overlapping task segments get merged automatically.
     */
    autoMergeAdjacentSegments? : boolean
    /**
     * If this field is set to `true` scheduling conflicts
     * will not show the conflict resolution popup but instead will be saved into
     * tasks [postponedConflict](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-postponedConflict) field.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-autoPostponeConflicts)
     */
    autoPostponeConflicts? : boolean
    /**
     * If this field is set to `true` scheduling conflicts
     * will not show the conflict resolution popup but instead will be saved into
     * tasks [postponedConflict](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel#field-postponedConflict) field.
     * @deprecated Please use [autoPostponeConflicts](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#field-autoPostponeConflicts) field name.
     */
    autoPostponedConflicts? : boolean
    /**
     * When this flag is enabled (default), manually scheduled tasks are scheduled automatically on the 2nd scheduling pass.
     * This is a backward pass ("late" start/end dates) for forward-scheduled project and forward pass
     * ("early" start/end dates) for backward-scheduled project. Because of it, manually scheduled tasks
     * may have non-zero slack.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-autoScheduleManualTasksOnSecondPass)
     */
    autoScheduleManualTasksOnSecondPass? : boolean
    /**
     * When set to `true`, pins a task at its starting date. Otherwise, it is rescheduled to the
     * project's starting date if there is no predecessor or constraint supplied.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-autoSetConstraints)
     */
    autoSetConstraints? : boolean
    /**
     * `true` to automatically persist store changes after edits are made in any of the stores monitored.
     * Please note that sync request will not be invoked immediately but only after
     * [autoSyncTimeout](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-autoSyncTimeout) interval.
     */
    autoSync? : boolean
    /**
     * The timeout in milliseconds to wait before persisting changes to the server.
     * Used when [autoSync](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-autoSync) is set to `true`.
     */
    autoSyncTimeout? : number
    /**
     * An object where property names with a truthy value indicate which events should bubble up the ownership
     * hierarchy when triggered.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-bubbleEvents)
     */
    bubbleEvents? : object
    /**
     * Enables backward compatible conflicts postponing logic
     * covering only conflicts between a task constraint and its incoming dependencies.
     * @deprecated The flag is added as a temporary solution and is going to be removed in a next release. Please contact us if you need that old behavior.
     */
    bwcConflictPostpone? : boolean
    /**
     * The project calendar.
     */
    calendar? : string|CalendarModelConfig|CalendarModel
    /**
     * A [CalendarManagerStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/CalendarManagerStore) instance or a config object.
     */
    calendarManagerStore? : CalendarManagerStore|CalendarManagerStoreConfig
    /**
     * The constructor to create a calendar store instance with. Should be a class, subclassing the [CalendarManagerStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/CalendarManagerStore)
     */
    calendarManagerStoreClass? : typeof CalendarManagerStore
    /**
     * The constructor of the calendar model class, to be used in the project. Will be set as the [modelClass](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-modelClass)
     * property of the [calendarManagerStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-calendarManagerStore)
     */
    calendarModelClass? : typeof CalendarModel
    /**
     * Data use to fill the [calendarManagerStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-calendarManagerStore). Should be a
     * [CalendarModel](https://bryntum.com/products/gantt/docs/api/Gantt/model/CalendarModel) array or its configuration objects.
     */
    calendars? : CalendarModel[]|CalendarModelConfig[]
    /**
     * The initial data, to fill the [calendarManagerStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-calendarManagerStore) with.
     * Should be an array of [CalendarModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/CalendarModel) or configuration objects.
     * @deprecated 6.3.0 Use [calendars](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-calendars) instead
     */
    calendarsData? : CalendarModelConfig[]|CalendarModel[]
    /**
     * Set to `true` to call onXXX method names (e.g. `onShow`, `onClick`), as an easy way to listen for events.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-callOnFunctions)
     */
    callOnFunctions? : boolean
    /**
     * By default, if an event handler throws an exception, the error propagates up the stack and the
     * application state is undefined. Code which follows the event handler will *not* be executed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-catchEventHandlerExceptions)
     */
    catchEventHandlerExceptions? : boolean
    /**
     * Child nodes. To allow loading children on demand, specify `children : true` in your data. Omit the field for leaf
     * tasks.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-children)
     */
    children? : boolean|object[]|Model[]|ModelConfig[]
    /**
     * Sets the list of stores controlled by the CRUD manager.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-crudStores)
     */
    crudStores? : Store[]|string[]|CrudManagerStoreDescriptor[]|StoreConfig[]
    /**
     * The number of days per month.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-daysPerMonth)
     */
    daysPerMonth? : number
    /**
     * The number of days per week.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-daysPerWeek)
     */
    daysPerWeek? : number
    /**
     * Enables early rendering in Gantt, by postponing calculations to after the first refresh.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-delayCalculation)
     */
    delayCalculation? : boolean
    /**
     * Data use to fill the [dependencyStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-dependencyStore). Should be an array of
     * [DependencyModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/DependencyModel) or its configuration objects.
     */
    dependencies? : DependencyModel[]|DependencyModelConfig[]
    /**
     * The source of the calendar for dependencies (the calendar used for taking dependencies lag into account).
     * Possible values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-dependenciesCalendar)
     */
    dependenciesCalendar? : 'ToEvent'|'FromEvent'|'Project'|'AllWorking'
    /**
     * The initial data, to fill the [dependencyStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-dependencyStore) with.
     * Should be an array of [DependencyModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/DependencyModel) or configuration objects.
     * @deprecated 6.3.0 Use [dependencies](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-dependencies) instead
     */
    dependenciesData? : DependencyModelConfig[]|DependencyModel[]
    /**
     * The constructor of the dependency model class, to be used in the project. Will be set as the [modelClass](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-modelClass)
     * property of the [dependencyStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-dependencyStore)
     */
    dependencyModelClass? : typeof DependencyModel
    /**
     * A [DependencyStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/DependencyStore) instance or a config object.
     */
    dependencyStore? : DependencyStore|DependencyStoreConfig
    /**
     * The constructor to create a dependency store instance with. Should be a class, subclassing the [DependencyStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/DependencyStore)
     */
    dependencyStoreClass? : typeof DependencyStore
    /**
     * Description of the project
     */
    description? : string
    /**
     * The scheduling direction of the project tasks.
     * The `Forward` direction corresponds to the As-Soon-As-Possible (ASAP) scheduling,
     * `Backward` - to As-Late-As-Possible (ALAP).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-direction)
     */
    direction? : 'Forward'|'Backward'
    /**
     * Set to `true` to enable calculation progress notifications.
     * When enabled, the project fires [progress](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-progress) events and the Gantt chart load mask reacts by showing a progress bar for the Engine calculations.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-enableProgressNotifications)
     */
    enableProgressNotifications? : boolean
    /**
     * Configuration of the JSON encoder used by the *Crud Manager*.
     */
    encoder? : {
        requestData?: object
    }
    /**
     * End date of the project in the ISO 8601 format.
     * The value is calculated as the latest date among all tasks.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-endDate)
     */
    endDate? : string|Date
    /**
     * Alias to [tasksData](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-tasksData).
     * @deprecated 6.3.0 Use [tasks](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-tasks) instead
     */
    eventsData? : TaskModelConfig[]|TaskModel[]
    /**
     * A [TaskStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/TaskStore) instance or a config object.
     */
    eventStore? : TaskStore|TaskStoreConfig
    /**
     * Start expanded or not (only valid for tree data)
     */
    expanded? : boolean
    /**
     * Specify as `true` to force sync requests to be sent when calling `sync()`, even if there are no local
     * changes. Useful in a polling scenario, to keep client up to date with the backend.
     */
    forceSync? : boolean
    /**
     * The number of hours per day.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-hoursPerDay)
     */
    hoursPerDay? : number
    /**
     * Unique identifier for the record. Might be mapped to another dataSource using idField, but always exposed as
     * record.id. Will get a generated value if none is specified in records data.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-id)
     */
    id? : string|number
    /**
     * <strong>This option is experimental and subject for possible change</strong>.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-ignoreConstraintsOnConflictDuringSecondPass)
     * @deprecated The option is no longer needed since the code now by default ignores conflicts faced on the second pass.
     */
    ignoreConstraintsOnConflictDuringSecondPass? : boolean
    /**
     * Set to `true` to make STM ignore changes coming from the backend. This will allow user to only undo redo
     * local changes.
     */
    ignoreRemoteChangesInSTM? : boolean
    /**
     * Whether to include "As soon as possible" and "As late as possible" in the list of the constraints,
     * for compatibility with the MS Project. Enabled by default.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-includeAsapAlapAsConstraints)
     */
    includeAsapAlapAsConstraints? : boolean
    /**
     * Set to `false` to only include the id of a removed parent node in the request to the backend (also
     * affects programmatic calls to get [changes](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#property-changes) etc.), and not the ids of its children.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-includeChildrenInRemoveRequest)
     */
    includeChildrenInRemoveRequest? : boolean
    /**
     * Whether to include legacy data properties in the JSON / inlineData output. The legacy data properties are
     * the `xxData` (`eventsData`, `resourcesData` etc.) properties that are deprecated and will be removed in
     * the future.
     * @deprecated 6.3.0 This config will be removed when the eventsData, resourcesData etc. properties are removed in a future release.
     */
    includeLegacyDataProperties? : boolean
    /**
     * This field is added to the class at runtime when the Store is configured with
     * [lazyLoad](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-lazyLoad). If set on a parent record at load time, that parent will not cause any
     * more child load requests. If omitted, it will be automatically set to `true` when a load request receives fewer
     * child records than requested.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-isFullyLoaded)
     */
    isFullyLoaded? : boolean
    /**
     * Project data as a JSON string, used to populate its stores.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-json)
     */
    json? : string
    /**
     * If set to `true`, or a config object, this makes the CrudManager load records only when needed. When a record
     * or a date range that is not already loaded is requested, a load request will be made to the specified URL.
     * More more details about lazy loading, see the [guide](https://bryntum.com/products/gantt/docs/api/Grid/guides/data/lazyloading.md)
     * @param {object} lazyLoad Lazy load config
     * @param {number} lazyLoad.chunkSize The number of records to be loaded before and after the requested index (only affects the ResourceStore).
     * @param {DurationUnit} bufferUnit Used together with bufferAmount to calculate the start and end dates of each load request. The value is added to the current visible start or end date. Defaults to the visible time span length (does not affect ResourceStore).
     * @param {number} bufferAmount See `bufferUnit`
     */
    lazyLoad? : boolean|{lazyLoad: { chunkSize: number }, bufferUnit: DurationUnit, bufferAmount: number}
    /**
     * The listener set for this object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-listeners)
     */
    listeners? : ProjectModelListeners
    /**
     * Convenience shortcut to set only the url to load from, when you do not need to supply any other config
     * options in the `load` section of the `transport` config.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-loadUrl)
     */
    loadUrl? : string
    /**
     * Maximum range the project calendars can iterate.
     * The value is defined in milliseconds and by default equals `5 years` roughly.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-maxCalendarRange)
     */
    maxCalendarRange? : number
    /**
     * The maximum number of *critical paths* to collect in [criticalPaths](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-criticalPaths).
     * When critical tasks connectivity is high (there are many of such tasks having many
     * critical predecessors) the tasks might produce a huge number of critical paths which
     * can't really be handled by a browser.
     * So this value limits the number of paths to collect to protect from such cases.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-maxCriticalPathsCount)
     */
    maxCriticalPathsCount? : number
    /**
     * Name of the project
     */
    name? : string
    /**
     * This is a read-only field provided in server synchronization packets to specify
     * which position the node takes in the parent's ordered children array.
     * This index is set on load and gets updated on reordering nodes in tree. Sorting and filtering
     * have no effect on it.
     */
    orderedParentIndex? : number
    /**
     * The number of Resource records each page should contain, when using [remotePaging](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/mixin/LazyLoadCrudManager#config-remotePaging)
     */
    pageSize? : number
    /**
     * This is a read-only field provided in server synchronization packets to specify
     * which record id is the parent of the record.
     */
    parentId? : string|number|null
    /**
     * This is a read-only field provided in server synchronization packets to specify
     * which position the node takes in the parent's children array.
     * This index is set on load and gets updated automatically after row reordering, sorting, etc.
     * To save the order, need to persist the field on the server and when data is fetched to be loaded,
     * need to sort by this field.
     */
    parentIndex? : number
    /**
     * Field name to be used to transfer a phantom record identifier.
     */
    phantomIdField? : string
    /**
     * Field name to be used to transfer a phantom parent record identifier.
     */
    phantomParentIdField? : string
    /**
     * Flag the record as read-only on the UI level, preventing the end user from manipulating it using editing
     * features such as cell editing and event dragging.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-readOnly)
     */
    readOnly? : boolean
    /**
     * This field is added to the class at runtime when the Store is configured with
     * [lazyLoad](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-lazyLoad). The
     * number specified should reflect the <strong>total</strong> amount of children of a parent node, including nested descendants.
     * @deprecated This field has been deprecated. Please read the [guide](https://bryntum.com/products/gantt/docs/api/Grid/guides/data/lazyloading.md) to find out if your app needs to use the new [isFullyLoaded](https://bryntum.com/products/gantt/docs/api/Core/data/mixin/TreeNode#field-isFullyLoaded) field.
     */
    remoteChildCount? : number
    /**
     * If set to `true`, this makes the CrudManager load pages of data, instead of loading the complete dataset at
     * once. The requests made to the [loadUrl](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-loadUrl) will contain
     * params with info about the current dataset being requested:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-remotePaging)
     */
    remotePaging? : boolean
    /**
     * When the CrudManager/Project is configured with [lazyLoad](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/mixin/LazyLoadCrudManager#config-lazyLoad) set to `true`, you can configure
     * your own data fetching logic by implementing this function. Doing this will override the built-in fetching
     * mechanism using the [loadUrl](https://bryntum.com/products/gantt/docs/api/Scheduler/data/CrudManager#config-loadUrl).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-requestData)
     * @param {LazyLoadCrudManagerRequestParams} params Object containing info of what data is requested
     * @returns {CrudManagerRequestResponse}
     */
    requestData? : (params: LazyLoadCrudManagerRequestParams) => Promise<CrudManagerRequestResponse>
    /**
     * `True` to reset identifiers (defined by `idField` config) of phantom records before submitting them
     * to the server.
     */
    resetIdsBeforeSync? : boolean
    /**
     * Set to `true` to reset the undo/redo queues of the internal [StateTrackingManager](https://bryntum.com/products/gantt/docs/api/Core/data/stm/StateTrackingManager)
     * after the Project has loaded. Defaults to `false`
     */
    resetUndoRedoQueuesAfterLoad? : boolean
    /**
     * The constructor of the resource model class, to be used in the project. Will be set as the [modelClass](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-modelClass)
     * property of the [resourceStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-resourceStore)
     */
    resourceModelClass? : typeof ResourceModel
    /**
     * Data use to fill the [resourceStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-resourceStore). Should be an array of
     * [ResourceModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/ResourceModel) or its configuration objects.
     */
    resources? : ResourceModel[]|ResourceModelConfig[]
    /**
     * The initial data, to fill the [resourceStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-resourceStore) with.
     * Should be an array of [ResourceModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/ResourceModel) or configuration objects.
     * @deprecated 6.3.0 Use [resources](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-resources) instead
     */
    resourcesData? : ResourceModelConfig[]|ResourceModel[]
    /**
     * A [ResourceStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/ResourceStore) instance or a config object.
     */
    resourceStore? : ResourceStore|ResourceStoreConfig
    /**
     * The constructor to create a dependency store instance with. Should be a class, subclassing the [ResourceStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/ResourceStore)
     */
    resourceStoreClass? : typeof ResourceStore
    /**
     * Experimental hook that lets the app determine if a bound dataset needs syncing with the store or not, and
     * if it does - which records that should be processed. Only called for stores that are configured with
     * `syncDataOnLoad: true` (which is the default in the React, Angular and Vue wrappers).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-shouldSyncDataOnLoad)
     * @param {object} options Options passed by the store to this hook
     * @param {Core.data.Store} options.store Store about to be synced
     * @param {Core.data.Model} options.records Records currently in the store
     * @param {object[]} options.data Incoming data
     * @returns {Set<any>,boolean} Return `false` to prevent the store from syncing, or a set of record ids that need further processing (for records that has some kind of change, eg. an update, removal or addition)
     */
    shouldSyncDataOnLoad? : (options: { store: Store, records: Model, data: object[] }) => Set<any>|boolean
    /**
     * Silences propagations caused by the project loading.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-silenceInitialCommit)
     */
    silenceInitialCommit? : boolean
    /**
     * When `true` the project's manually scheduled tasks duration will include only working periods of time.
     * When `false` such tasks will ignore working time calendars and treat all intervals as working.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-skipNonWorkingTimeInDurationWhenSchedulingManually)
     */
    skipNonWorkingTimeInDurationWhenSchedulingManually? : boolean
    /**
     * When `true` the project manually scheduled tasks will adjust their proposed start/end dates
     * to skip non working time.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-skipNonWorkingTimeWhenSchedulingManually)
     */
    skipNonWorkingTimeWhenSchedulingManually? : boolean
    /**
     * When `true` treats parsed responses without `success` property as successful.
     * In this mode a parsed response is treated as invalid if it has explicitly set `success : false`.
     */
    skipSuccessProperty? : boolean
    /**
     * Start date of the project in the ISO 8601 format. Setting this date will constrain all other tasks in the
     * project to start no earlier than it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-startDate)
     */
    startDate? : string|Date
    /**
     * Specifies how started tasks are scheduled. Possible values are:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-startedTaskScheduling)
     */
    startedTaskScheduling? : string
    /**
     * The status date of the project. It is just a date, that sets a reference point to various reporting facilities,
     * like [ProgressLine](https://bryntum.com/products/gantt/docs/api/Gantt/feature/ProgressLine) or [PlannedPercentDoneColumn](#Gantt/column/PlannedPercentDoneColumn).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-statusDate)
     */
    statusDate? : Date
    /**
     * Configuration options to provide to the STM manager
     */
    stm? : StateTrackingManagerConfig|CoreStateTrackingManager
    /**
     * Name of a store property to retrieve store identifiers from. Make sure you have an instance of a
     * store to use it by id. Store identifier is used as a container name holding corresponding store data
     * while transferring them to/from the server. By default, `id` property is used. And in case a
     * container identifier has to differ this config can be used:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-storeIdProperty)
     */
    storeIdProperty? : string
    /**
     * When `true` the Crud Manager does not require all updated and removed records to be mentioned in the
     * *sync* response. In this case response should include only server side changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-supportShortSyncResponse)
     */
    supportShortSyncResponse? : boolean
    /**
     * An array of store identifiers sets an alternative sync responses apply order.
     * By default, the order in which sync responses are applied to the stores is the same as they
     * registered in. But in case of some tricky dependencies between stores this order can be changed:
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-syncApplySequence)
     */
    syncApplySequence? : string[]|CrudManagerStoreDescriptor[]
    /**
     * Convenience shortcut to set only the url to sync to, when you do not need to supply any other config
     * options in the `sync` section of the `transport` config.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-syncUrl)
     */
    syncUrl? : string
    /**
     * The constructor of the event model class, to be used in the project. Will be set as the [modelClass](https://bryntum.com/products/gantt/docs/api/Core/data/Store#config-modelClass)
     * property of the [eventStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-eventStore)
     */
    taskModelClass? : typeof TaskModel
    /**
     * Data use to fill the [taskStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-taskStore). Should be an array of
     * [TaskModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel) or its configuration objects.
     */
    tasks? : TaskModel[]|TaskModelConfig[]
    /**
     * The initial data, to fill the [taskStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-taskStore) with.
     * Should be an array of [TaskModels](https://bryntum.com/products/gantt/docs/api/Gantt/model/TaskModel) or configuration objects.
     * @deprecated 6.3.0 Use [tasks](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-tasks) instead
     */
    tasksData? : TaskModelConfig[]|TaskModel[]
    /**
     * An alias for the [eventStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-eventStore).
     */
    taskStore? : TaskStore|TaskStoreConfig
    /**
     * The constructor to create an task store instance with. Should be a class, subclassing the [TaskStore](https://bryntum.com/products/gantt/docs/api/Gantt/data/TaskStore)
     */
    taskStoreClass? : typeof TaskStore
    /**
     * Data use to fill the [timeRangeStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-timeRangeStore). Should be an array of
     * [TimeRangeModels](https://bryntum.com/products/gantt/docs/api/Scheduler/model/TimeRangeModel) or its configuration objects.
     */
    timeRanges? : TimeRangeModel[]|TimeRangeModelConfig[]
    /**
     * The initial data, to fill the [timeRangeStore](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#property-timeRangeStore) with.
     * Should be an array of [TimeRangeModels](https://bryntum.com/products/gantt/docs/api/Scheduler/model/TimeRangeModel) or configuration objects.
     * @deprecated 6.3.0 Use [timeRanges](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-timeRanges) instead
     */
    timeRangesData? : TimeSpanConfig[]|TimeSpan[]
    /**
     * Store that holds time ranges - instances of [TimeRangeModel](https://bryntum.com/products/gantt/docs/api/Scheduler/model/TimeRangeModel) for the
     * [TimeRanges](https://bryntum.com/products/gantt/docs/api/Scheduler/feature/TimeRanges) feature. A store will be automatically created if none is specified.
     */
    timeRangeStore? : TimeRangeStoreConfig|TimeRangeStore
    /**
     * Set to a IANA time zone (i.e. `Europe/Stockholm`) or a UTC offset in minutes (i.e. `-120`). This will
     * convert all events, tasks and time ranges to the specified time zone or offset. It will also affect the
     * displayed timeline's headers as well at the start and end date of it.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-timeZone)
     */
    timeZone? : string|number
    /**
     * Specifies the output format of [toJSON](https://bryntum.com/products/gantt/docs/api/Scheduler/model/mixin/ProjectModelCommon#function-toJSON).
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-toJSONResultFormat)
     */
    toJSONResultFormat? : 'inlineData'|'model'
    /**
     * If `true`, project [changes](https://bryntum.com/products/gantt/docs/api/SchedulerPro/data/mixin/ProjectCrudManager#property-changes) API will also report project model changes: start/end date,
     * calendar, effort, duration, etc.
     */
    trackProjectModelChanges? : boolean
    /**
     * When `true` forces the CRUD manager to process responses depending on their `type` attribute.
     * So `load` request may be responded with `sync` response for example.
     * Can be used for smart server logic allowing the server to decide when it's better to respond with a
     * complete data set (`load` response) or it's enough to return just a delta (`sync` response).
     */
    trackResponseType? : boolean
    /**
     * Configuration of the AJAX requests used by *Crud Manager* to communicate with a server-side.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-transport)
     */
    transport? : {
        load?: object
        sync?: object
    }
    /**
     * By default, the stores of a project use the raw data objects passed to them as the data source for their
     * records if data is loaded remotely (using an `AjaxStore` or a `CrudManager`). For data supplied inline,
     * the data objects are instead by default cloned to avoid the original data object being modified by the
     * store.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-useRawData)
     */
    useRawData? : boolean
    /**
     * This config validates the response structure for requests made by the Crud Manager.
     * When `true`, the Crud Manager checks every parsed response structure for errors
     * and if the response format is invalid, a warning is logged to the browser console.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-validateResponse)
     */
    validateResponse? : boolean
    /**
     * `true` to write all fields from the record to the server.
     * If set to `false` it will only send the fields that were modified.
     * Note that any fields that have [persist](https://bryntum.com/products/gantt/docs/api/Core/data/field/DataField#config-persist) set to `false` will
     * still be ignored and fields having [alwaysWrite](https://bryntum.com/products/gantt/docs/api/Core/data/field/DataField#config-alwaysWrite) set to `true`
     * will always be included.
     */
    writeAllFields? : boolean

    // Events
    /**
     * Fires before an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onBeforeDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Fires before [load request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) is sent. Return `false` to cancel load request.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.pack The data package which contains data for all stores managed by the crud manager.
     */
    onBeforeLoad? : ((event: { source: AbstractCrudManager, pack: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before loaded data get applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.response The decoded server response object.
     * @param {object} event.options Options provided to the [load](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) method.
     */
    onBeforeLoadApply? : ((event: { source: AbstractCrudManager, response: object, options: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before server response gets applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {'sync','load'} event.requestType The request type (`sync` or `load`).
     * @param {object} event.response The decoded server response object.
     */
    onBeforeResponseApply? : ((event: { source: AbstractCrudManager, requestType: 'sync'|'load', response: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before a request is sent to the server.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-beforeSend)
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.crudManager The CRUD manager.
     * @param {object} event.params HTTP request params to be passed in the request URL.
     * @param {'sync','load'} event.requestType CrudManager request type (`load`/`sync`)
     * @param {object} event.requestConfig Configuration object for Ajax request call
     */
    onBeforeSend? : ((event: { crudManager: AbstractCrudManager, params: object, requestType: 'sync'|'load', requestConfig: object }) => Promise<void>)|string
    /**
     * Fires before [sync request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) is sent. Return `false` to cancel sync request.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-beforeSync)
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.pack The data package which contains data for all stores managed by the crud manager.
     */
    onBeforeSync? : ((event: { source: AbstractCrudManager, pack: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires before sync response data get applied to the stores. Return `false` to prevent data applying.
     * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.response The decoded server response object.
     */
    onBeforeSyncApply? : ((event: { source: AbstractCrudManager, response: object }) => Promise<boolean>|boolean|void)|string
    /**
     * Fires when any other event is fired from the object.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-catchAll)
     * @param {object} event Event object
     * @param {{[key: string]: any, type: string}} event.event The Object that contains event details
     * @param {string} event.event.type The type of the event which is caught by the listener
     */
    onCatchAll? : ((event: {[key: string]: any, type: string}) => void)|string
    /**
     * Fired when data in any of the projects stores changes.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-change)
     * @param {object} event Event object
     * @param {Gantt.model.ProjectModel} event.source This project
     * @param {Core.data.Store} event.store Affected store
     * @param {'remove','removeAll','add','clearchanges','filter','update','dataset','replace'} event.action Name of action which triggered the change. May be one of the options listed above.
     * @param {Core.data.Model} event.record Changed record, for actions that affects exactly one record (`'update'`)
     * @param {Core.data.Model[]} event.records Changed records, passed for all actions except `'removeAll'`
     * @param {object} event.changes Passed for the `'update'` action, info on which record fields changed
     */
    onChange? : ((event: { source: ProjectModel, store: Store, action: 'remove'|'removeAll'|'add'|'clearchanges'|'filter'|'update'|'dataset'|'replace', record: Model, records: Model[], changes: object }) => void)|string
    /**
     * Fired when the Engine detects a computation cycle.
     * @param {object} event Event object
     * @param {object} event.schedulingIssue Scheduling error describing the case:
     * @param {Function} event.schedulingIssue.getDescription Returns the cycle description
     * @param {object} event.schedulingIssue.cycle Object providing the cycle info
     * @param {Function} event.schedulingIssue.getResolutions Returns possible resolutions
     * @param {Function} event.continueWithResolutionResult Function to call after a resolution is chosen to proceed with the Engine calculations: ```javascript project.on('cycle', ({ continueWithResolutionResult }) => {     // cancel changes in case of a cycle     continueWithResolutionResult(EffectResolutionResult.Cancel); }) ``` Where `EffectResolutionResult.Cancel` results in cancelling the changes.
     */
    onCycle? : ((event: { schedulingIssue: { getDescription: Function, cycle: object, getResolutions: Function }, continueWithResolutionResult: Function }) => void)|string
    /**
     * Fired when the engine has finished its calculations and the results has been written back to the records.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-dataReady)
     * @param {object} event Event object
     * @param {Gantt.model.ProjectModel} event.source The project
     * @param {boolean} event.isInitialCommit Flag that shows if this commit is initial
     * @param {Set<any>} event.records Set of all [Model](https://bryntum.com/products/gantt/docs/api/Core/data/Model)s that were modified in the completed transaction. Use the [modifications](https://bryntum.com/products/gantt/docs/api/Core/data/Model#property-modifications) property of each Model to identify modified fields.
     */
    onDataReady? : ((event: { source: ProjectModel, isInitialCommit: boolean, records: Set<any> }) => void)|string
    /**
     * Fires when an object is destroyed.
     * @param {object} event Event object
     * @param {Core.Base} event.source The Object that is being destroyed.
     */
    onDestroy? : ((event: { source: Base }) => void)|string
    /**
     * Fired when the Engine detects a calendar misconfiguration when the calendar does
     * not provide any working periods of time which makes usage impossible.
     * @param {object} event Event object
     * @param {object} event.schedulingIssue Scheduling error describing the case:
     * @param {Function} event.schedulingIssue.getDescription Returns the error description
     * @param {Function} event.schedulingIssue.getCalendar Returns the calendar that must be fixed
     * @param {Function} event.schedulingIssue.getResolutions Returns possible resolutions
     * @param {Function} event.continueWithResolutionResult Function to call after a resolution is chosen to proceed with the Engine calculations: ```javascript project.on('emptyCalendar', ({ schedulingIssue, continueWithResolutionResult }) => {     // apply the first resolution and continue     schedulingIssue.getResolutions()[0].resolve();     continueWithResolutionResult(EffectResolutionResult.Resume); }) ```
     */
    onEmptyCalendar? : ((event: { schedulingIssue: { getDescription: Function, getCalendar: Function, getResolutions: Function }, continueWithResolutionResult: Function }) => void)|string
    /**
     * Fires when data in any of the registered data stores is changed.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-hasChanges)
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     */
    onHasChanges? : ((event: { source: AbstractCrudManager }) => void)|string
    /**
     * Fires on successful [load request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) completion after data gets loaded to the stores.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.response The decoded server response object.
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onLoad? : ((event: { source: AbstractCrudManager, response: object, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string
    /**
     * Fired after [load request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) was canceled by some [beforeLoad](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeLoad)
     * listener or due to incomplete prior load request.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.pack The data package which contains data for all stores managed by the crud manager.
     */
    onLoadCanceled? : ((event: { source: AbstractCrudManager, pack: object }) => void)|string
    /**
     * Fires when a [load request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) fails.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager instance.
     * @param {object} event.response The decoded server response object.
     * @param {string} event.responseText The raw server response text
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onLoadFail? : ((event: { source: AbstractCrudManager, response: object, responseText: string, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string
    /**
     * Fires when registered stores get into state when they don't have any
     * not persisted change. This happens after [load](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-load) or [sync](#Scheduler/crud/AbstractCrudManagerMixin#function-sync) request
     * completion. Or this may happen after a record update which turns its fields back to their original state.
     * ...
     * [View online docs...](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#event-noChanges)
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     */
    onNoChanges? : ((event: { source: AbstractCrudManager }) => void)|string
    /**
     * Fired during the Engine calculation if [enableProgressNotifications](https://bryntum.com/products/gantt/docs/api/Gantt/model/ProjectModel#config-enableProgressNotifications) config is `true`
     * @param {object} event Event object
     * @param {Gantt.model.ProjectModel} event.source The owning project
     * @param {number} event.total The total number of operations
     * @param {number} event.remaining The number of remaining operations
     * @param {'storePopulation','propagating'} event.phase The phase of the calculation, either 'storePopulation' when data is getting loaded, or 'propagating' when data is getting calculated
     */
    onProgress? : ((event: { source: ProjectModel, total: number, remaining: number, phase: 'storePopulation'|'propagating' }) => void)|string
    /**
     * Fires on successful request completion after data gets applied to the stores.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {'sync','load'} event.requestType The request type (`sync` or `load`).
     * @param {object} event.response The decoded server response object.
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onRequestDone? : ((event: { source: AbstractCrudManager, requestType: 'sync'|'load', response: object, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string
    /**
     * Fires when a request fails.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager instance.
     * @param {'sync','load'} event.requestType The request type (`sync` or `load`).
     * @param {object} event.response The decoded server response object.
     * @param {string} event.responseText The raw server response text
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onRequestFail? : ((event: { source: AbstractCrudManager, requestType: 'sync'|'load', response: object, responseText: string, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string
    /**
     * This event triggers when a new revision is added to the project. It is used to notify the backend about the
     * new revision.
     * @param {object} event Event object
     * @param {string} event.localRevisionId ID of the local revision. Backend should send it in the broadcast channel
     * @param {string} event.conflictResolutionFor ID of the revision with a conflict which was resolved by this revision
     * @param {string} event.clientId ID of the client instance. Used to distinguish own revisions from the broadcast channel
     * @param {object} event.changes Object with changes constituting revision
     */
    onRevisionNotification? : ((event: { localRevisionId: string, conflictResolutionFor?: string, clientId: string, changes: object }) => void)|string
    /**
     * Fired when the Engine detects a scheduling conflict.
     * @param {object} event Event object
     * @param {object} event.schedulingIssue The conflict details:
     * @param {Function} event.schedulingIssue.getDescription Returns the conflict description
     * @param {object[]} event.schedulingIssue.intervals Array of conflicting intervals
     * @param {Function} event.schedulingIssue.getResolutions Function to get possible resolutions
     * @param {Function} event.continueWithResolutionResult Function to call after a resolution is chosen to proceed with the Engine calculations: ```javascript project.on('schedulingConflict', ({ schedulingIssue, continueWithResolutionResult }) => {     // apply the first resolution and continue     schedulingIssue.getResolutions()[0].resolve();     continueWithResolutionResult(EffectResolutionResult.Resume); }) ``` Where `EffectResolutionResult.Resume` results in a resolution being applied and current transaction should be continued.
     */
    onSchedulingConflict? : ((event: { schedulingIssue: { getDescription: Function, intervals: object[], getResolutions: Function }, continueWithResolutionResult: Function }) => void)|string
    /**
     * Fires on successful [sync request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) completion.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.response The decoded server response object.
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onSync? : ((event: { source: AbstractCrudManager, response: object, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string
    /**
     * Fires after [sync request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) was canceled by some [beforeSync](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeSync) listener.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.pack The data package which contains data for all stores managed by the crud manager.
     */
    onSyncCanceled? : ((event: { source: AbstractCrudManager, pack: object }) => void)|string
    /**
     * Fires after [sync request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) was delayed due to incomplete previous one.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager.
     * @param {object} event.arguments The arguments of [sync](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) call.
     */
    onSyncDelayed? : ((event: { source: AbstractCrudManager, arguments: object }) => void)|string
    /**
     * Fires when a [sync request](https://bryntum.com/products/gantt/docs/api/Scheduler/crud/AbstractCrudManagerMixin#function-sync) fails.
     * @param {object} event Event object
     * @param {Scheduler.crud.AbstractCrudManager} event.source The CRUD manager instance.
     * @param {object} event.response The decoded server response object.
     * @param {string} event.responseText The raw server response text
     * @param {object} event.responseOptions [DEPRECATED] see `requestOptions`
     * @param {object} event.requestOptions The request options passed to the request.
     * @param {Response} event.rawResponse The native Response object
     */
    onSyncFail? : ((event: { source: AbstractCrudManager, response: object, responseText: string, responseOptions: object, requestOptions: object, rawResponse: any }) => void)|string

}

export class BryntumGanttProjectModel extends React.Component<BryntumGanttProjectModelProps> {

    static instanceClass = ProjectModel;

    static instanceName = 'ProjectModel';

    processWidgetContent = processWidgetContent;

    dataStores = {
        'assignmentStore': 'assignments',
        'calendarManagerStore': 'calendars',
        'dependencyStore': 'dependencies',
        'eventStore': 'events',
        'resourceStore': 'resources',
        'taskStore': 'tasks',
        'timeRangeStore': 'timeRanges'
    };

    static configNames = [
        'adjustDurationToDST',
        'assignmentModelClass',
        'assignmentsData',
        'assignmentStoreClass',
        'autoLoad',
        'autoSetConstraints',
        'autoSync',
        'autoSyncTimeout',
        'bubbleEvents',
        'bwcConflictPostpone',
        'calendarManagerStoreClass',
        'calendarModelClass',
        'calendarsData',
        'children',
        'delayCalculation',
        'dependenciesData',
        'dependencyModelClass',
        'dependencyStoreClass',
        'encoder',
        'eventsData',
        'expanded',
        'includeAsapAlapAsConstraints',
        'includeChildrenInRemoveRequest',
        'listeners',
        'maxCalendarRange',
        'orderedParentIndex',
        'pageSize',
        'parentIndex',
        'phantomIdField',
        'phantomParentIdField',
        'remotePaging',
        'requestData',
        'resetIdsBeforeSync',
        'resetUndoRedoQueuesAfterLoad',
        'resourceModelClass',
        'resourcesData',
        'resourceStoreClass',
        'silenceInitialCommit',
        'skipSuccessProperty',
        'storeIdProperty',
        'supportShortSyncResponse',
        'taskModelClass',
        'tasksData',
        'taskStoreClass',
        'timeRangesData',
        'toJSONResultFormat',
        'trackResponseType',
        'transport',
        'useRawData',
        'validateResponse',
        'writeAllFields'
    ];

    static propertyConfigNames = [
        'addConstraintOnDateSet',
        'allowPostponedConflicts',
        'assignments',
        'assignmentStore',
        'autoCalculatePercentDoneForParentTasks',
        'autoMergeAdjacentSegments',
        'autoPostponeConflicts',
        'autoPostponedConflicts',
        'autoScheduleManualTasksOnSecondPass',
        'calendar',
        'calendarManagerStore',
        'calendars',
        'callOnFunctions',
        'catchEventHandlerExceptions',
        'crudStores',
        'daysPerMonth',
        'daysPerWeek',
        'dependencies',
        'dependenciesCalendar',
        'dependencyStore',
        'description',
        'direction',
        'enableProgressNotifications',
        'endDate',
        'eventStore',
        'forceSync',
        'hoursPerDay',
        'id',
        'ignoreConstraintsOnConflictDuringSecondPass',
        'ignoreRemoteChangesInSTM',
        'includeLegacyDataProperties',
        'isFullyLoaded',
        'json',
        'lazyLoad',
        'loadUrl',
        'maxCriticalPathsCount',
        'name',
        'onBeforeDestroy',
        'onBeforeLoad',
        'onBeforeLoadApply',
        'onBeforeResponseApply',
        'onBeforeSend',
        'onBeforeSync',
        'onBeforeSyncApply',
        'onCatchAll',
        'onChange',
        'onCycle',
        'onDataReady',
        'onDestroy',
        'onEmptyCalendar',
        'onHasChanges',
        'onLoad',
        'onLoadCanceled',
        'onLoadFail',
        'onNoChanges',
        'onProgress',
        'onRequestDone',
        'onRequestFail',
        'onRevisionNotification',
        'onSchedulingConflict',
        'onSync',
        'onSyncCanceled',
        'onSyncDelayed',
        'onSyncFail',
        'parentId',
        'readOnly',
        'remoteChildCount',
        'resources',
        'resourceStore',
        'shouldSyncDataOnLoad',
        'skipNonWorkingTimeInDurationWhenSchedulingManually',
        'skipNonWorkingTimeWhenSchedulingManually',
        'startDate',
        'startedTaskScheduling',
        'statusDate',
        'stm',
        'syncApplySequence',
        'syncUrl',
        'tasks',
        'taskStore',
        'timeRanges',
        'timeRangeStore',
        'timeZone',
        'trackProjectModelChanges'
    ];

    static propertyNames = [
        'allChildren',
        'allUnfilteredChildren',
        'criticalPaths',
        'descendantCount',
        'hasGeneratedId',
        'inlineData',
        'internalId',
        'isCommitting',
        'isCreating',
        'isValid',
        'previousSiblingsTotalCount',
        'segmentModelClass',
        'visibleDescendantCount'
    ];

    // Component instance
    instance!: ProjectModel;

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
    shouldComponentUpdate(nextProps: Readonly<BryntumGanttProjectModelProps>, nextState: Readonly<{}>): boolean {
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render(): React.ReactNode {

        return null

    }
}
