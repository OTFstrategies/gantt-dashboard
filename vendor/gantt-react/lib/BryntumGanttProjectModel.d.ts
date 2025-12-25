import React from 'react';
import { AbstractCrudManager, AssignmentModel, AssignmentModelConfig, AssignmentStore, AssignmentStoreConfig, Base, CalendarManagerStore, CalendarManagerStoreConfig, CalendarModel, CalendarModelConfig, CoreStateTrackingManager, CrudManagerRequestResponse, CrudManagerStoreDescriptor, DependencyModel, DependencyModelConfig, DependencyStore, DependencyStoreConfig, DurationUnit, LazyLoadCrudManagerRequestParams, Model, ModelConfig, ProjectModel, ProjectModelListeners, ResourceModel, ResourceModelConfig, ResourceStore, ResourceStoreConfig, StateTrackingManagerConfig, Store, StoreConfig, TaskModel, TaskModelConfig, TaskStore, TaskStoreConfig, TimeRangeModel, TimeRangeModelConfig, TimeRangeStore, TimeRangeStoreConfig, TimeSpan, TimeSpanConfig } from '@bryntum/gantt';
import { processWidgetContent } from './WrapperHelper.js';
export declare type BryntumGanttProjectModelProps = {
    addConstraintOnDateSet?: boolean;
    adjustDurationToDST?: boolean;
    allowPostponedConflicts?: boolean;
    assignmentModelClass?: typeof AssignmentModel;
    assignments?: AssignmentModel[] | AssignmentModelConfig[];
    assignmentsData?: AssignmentModelConfig[] | AssignmentModel[];
    assignmentStore?: AssignmentStore | AssignmentStoreConfig;
    assignmentStoreClass?: typeof AssignmentStore;
    autoCalculatePercentDoneForParentTasks?: boolean;
    autoLoad?: boolean;
    autoMergeAdjacentSegments?: boolean;
    autoPostponeConflicts?: boolean;
    autoPostponedConflicts?: boolean;
    autoScheduleManualTasksOnSecondPass?: boolean;
    autoSetConstraints?: boolean;
    autoSync?: boolean;
    autoSyncTimeout?: number;
    bubbleEvents?: object;
    bwcConflictPostpone?: boolean;
    calendar?: string | CalendarModelConfig | CalendarModel;
    calendarManagerStore?: CalendarManagerStore | CalendarManagerStoreConfig;
    calendarManagerStoreClass?: typeof CalendarManagerStore;
    calendarModelClass?: typeof CalendarModel;
    calendars?: CalendarModel[] | CalendarModelConfig[];
    calendarsData?: CalendarModelConfig[] | CalendarModel[];
    callOnFunctions?: boolean;
    catchEventHandlerExceptions?: boolean;
    children?: boolean | object[] | Model[] | ModelConfig[];
    crudStores?: Store[] | string[] | CrudManagerStoreDescriptor[] | StoreConfig[];
    daysPerMonth?: number;
    daysPerWeek?: number;
    delayCalculation?: boolean;
    dependencies?: DependencyModel[] | DependencyModelConfig[];
    dependenciesCalendar?: 'ToEvent' | 'FromEvent' | 'Project' | 'AllWorking';
    dependenciesData?: DependencyModelConfig[] | DependencyModel[];
    dependencyModelClass?: typeof DependencyModel;
    dependencyStore?: DependencyStore | DependencyStoreConfig;
    dependencyStoreClass?: typeof DependencyStore;
    description?: string;
    direction?: 'Forward' | 'Backward';
    enableProgressNotifications?: boolean;
    encoder?: {
        requestData?: object;
    };
    endDate?: string | Date;
    eventsData?: TaskModelConfig[] | TaskModel[];
    eventStore?: TaskStore | TaskStoreConfig;
    expanded?: boolean;
    forceSync?: boolean;
    hoursPerDay?: number;
    id?: string | number;
    ignoreConstraintsOnConflictDuringSecondPass?: boolean;
    ignoreRemoteChangesInSTM?: boolean;
    includeAsapAlapAsConstraints?: boolean;
    includeChildrenInRemoveRequest?: boolean;
    includeLegacyDataProperties?: boolean;
    isFullyLoaded?: boolean;
    json?: string;
    lazyLoad?: boolean | {
        lazyLoad: {
            chunkSize: number;
        };
        bufferUnit: DurationUnit;
        bufferAmount: number;
    };
    listeners?: ProjectModelListeners;
    loadUrl?: string;
    maxCalendarRange?: number;
    maxCriticalPathsCount?: number;
    name?: string;
    orderedParentIndex?: number;
    pageSize?: number;
    parentId?: string | number | null;
    parentIndex?: number;
    phantomIdField?: string;
    phantomParentIdField?: string;
    readOnly?: boolean;
    remoteChildCount?: number;
    remotePaging?: boolean;
    requestData?: (params: LazyLoadCrudManagerRequestParams) => Promise<CrudManagerRequestResponse>;
    resetIdsBeforeSync?: boolean;
    resetUndoRedoQueuesAfterLoad?: boolean;
    resourceModelClass?: typeof ResourceModel;
    resources?: ResourceModel[] | ResourceModelConfig[];
    resourcesData?: ResourceModelConfig[] | ResourceModel[];
    resourceStore?: ResourceStore | ResourceStoreConfig;
    resourceStoreClass?: typeof ResourceStore;
    shouldSyncDataOnLoad?: (options: {
        store: Store;
        records: Model;
        data: object[];
    }) => Set<any> | boolean;
    silenceInitialCommit?: boolean;
    skipNonWorkingTimeInDurationWhenSchedulingManually?: boolean;
    skipNonWorkingTimeWhenSchedulingManually?: boolean;
    skipSuccessProperty?: boolean;
    startDate?: string | Date;
    startedTaskScheduling?: string;
    statusDate?: Date;
    stm?: StateTrackingManagerConfig | CoreStateTrackingManager;
    storeIdProperty?: string;
    supportShortSyncResponse?: boolean;
    syncApplySequence?: string[] | CrudManagerStoreDescriptor[];
    syncUrl?: string;
    taskModelClass?: typeof TaskModel;
    tasks?: TaskModel[] | TaskModelConfig[];
    tasksData?: TaskModelConfig[] | TaskModel[];
    taskStore?: TaskStore | TaskStoreConfig;
    taskStoreClass?: typeof TaskStore;
    timeRanges?: TimeRangeModel[] | TimeRangeModelConfig[];
    timeRangesData?: TimeSpanConfig[] | TimeSpan[];
    timeRangeStore?: TimeRangeStoreConfig | TimeRangeStore;
    timeZone?: string | number;
    toJSONResultFormat?: 'inlineData' | 'model';
    trackProjectModelChanges?: boolean;
    trackResponseType?: boolean;
    transport?: {
        load?: object;
        sync?: object;
    };
    useRawData?: boolean;
    validateResponse?: boolean;
    writeAllFields?: boolean;
    onBeforeDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onBeforeLoad?: ((event: {
        source: AbstractCrudManager;
        pack: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeLoadApply?: ((event: {
        source: AbstractCrudManager;
        response: object;
        options: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeResponseApply?: ((event: {
        source: AbstractCrudManager;
        requestType: 'sync' | 'load';
        response: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeSend?: ((event: {
        crudManager: AbstractCrudManager;
        params: object;
        requestType: 'sync' | 'load';
        requestConfig: object;
    }) => Promise<void>) | string;
    onBeforeSync?: ((event: {
        source: AbstractCrudManager;
        pack: object;
    }) => Promise<boolean> | boolean | void) | string;
    onBeforeSyncApply?: ((event: {
        source: AbstractCrudManager;
        response: object;
    }) => Promise<boolean> | boolean | void) | string;
    onCatchAll?: ((event: {
        [key: string]: any;
        type: string;
    }) => void) | string;
    onChange?: ((event: {
        source: ProjectModel;
        store: Store;
        action: 'remove' | 'removeAll' | 'add' | 'clearchanges' | 'filter' | 'update' | 'dataset' | 'replace';
        record: Model;
        records: Model[];
        changes: object;
    }) => void) | string;
    onCycle?: ((event: {
        schedulingIssue: {
            getDescription: Function;
            cycle: object;
            getResolutions: Function;
        };
        continueWithResolutionResult: Function;
    }) => void) | string;
    onDataReady?: ((event: {
        source: ProjectModel;
        isInitialCommit: boolean;
        records: Set<any>;
    }) => void) | string;
    onDestroy?: ((event: {
        source: Base;
    }) => void) | string;
    onEmptyCalendar?: ((event: {
        schedulingIssue: {
            getDescription: Function;
            getCalendar: Function;
            getResolutions: Function;
        };
        continueWithResolutionResult: Function;
    }) => void) | string;
    onHasChanges?: ((event: {
        source: AbstractCrudManager;
    }) => void) | string;
    onLoad?: ((event: {
        source: AbstractCrudManager;
        response: object;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
    onLoadCanceled?: ((event: {
        source: AbstractCrudManager;
        pack: object;
    }) => void) | string;
    onLoadFail?: ((event: {
        source: AbstractCrudManager;
        response: object;
        responseText: string;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
    onNoChanges?: ((event: {
        source: AbstractCrudManager;
    }) => void) | string;
    onProgress?: ((event: {
        source: ProjectModel;
        total: number;
        remaining: number;
        phase: 'storePopulation' | 'propagating';
    }) => void) | string;
    onRequestDone?: ((event: {
        source: AbstractCrudManager;
        requestType: 'sync' | 'load';
        response: object;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
    onRequestFail?: ((event: {
        source: AbstractCrudManager;
        requestType: 'sync' | 'load';
        response: object;
        responseText: string;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
    onRevisionNotification?: ((event: {
        localRevisionId: string;
        conflictResolutionFor?: string;
        clientId: string;
        changes: object;
    }) => void) | string;
    onSchedulingConflict?: ((event: {
        schedulingIssue: {
            getDescription: Function;
            intervals: object[];
            getResolutions: Function;
        };
        continueWithResolutionResult: Function;
    }) => void) | string;
    onSync?: ((event: {
        source: AbstractCrudManager;
        response: object;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
    onSyncCanceled?: ((event: {
        source: AbstractCrudManager;
        pack: object;
    }) => void) | string;
    onSyncDelayed?: ((event: {
        source: AbstractCrudManager;
        arguments: object;
    }) => void) | string;
    onSyncFail?: ((event: {
        source: AbstractCrudManager;
        response: object;
        responseText: string;
        responseOptions: object;
        requestOptions: object;
        rawResponse: any;
    }) => void) | string;
};
export declare class BryntumGanttProjectModel extends React.Component<BryntumGanttProjectModelProps> {
    static instanceClass: typeof ProjectModel;
    static instanceName: string;
    processWidgetContent: typeof processWidgetContent;
    dataStores: {
        assignmentStore: string;
        calendarManagerStore: string;
        dependencyStore: string;
        eventStore: string;
        resourceStore: string;
        taskStore: string;
        timeRangeStore: string;
    };
    static configNames: string[];
    static propertyConfigNames: string[];
    static propertyNames: string[];
    instance: ProjectModel;
    element: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumGanttProjectModelProps>, nextState: Readonly<{}>): boolean;
    render(): React.ReactNode;
}
