import React from 'react';
import { ProjectModel } from '@bryntum/gantt';
import { createWidget, shouldComponentUpdate, processWidgetContent } from './WrapperHelper.js';
export class BryntumGanttProjectModel extends React.Component {
    constructor() {
        super(...arguments);
        this.processWidgetContent = processWidgetContent;
        this.dataStores = {
            'assignmentStore': 'assignments',
            'calendarManagerStore': 'calendars',
            'dependencyStore': 'dependencies',
            'eventStore': 'events',
            'resourceStore': 'resources',
            'taskStore': 'tasks',
            'timeRangeStore': 'timeRanges'
        };
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
        return null;
    }
}
BryntumGanttProjectModel.instanceClass = ProjectModel;
BryntumGanttProjectModel.instanceName = 'ProjectModel';
BryntumGanttProjectModel.configNames = [
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
BryntumGanttProjectModel.propertyConfigNames = [
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
BryntumGanttProjectModel.propertyNames = [
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
//# sourceMappingURL=BryntumGanttProjectModel.js.map