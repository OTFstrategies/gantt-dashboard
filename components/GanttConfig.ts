'use client';
/**
 * Gantt configuration
 */
import { BryntumGanttProps } from '@bryntum/gantt-react';
import { StringHelper } from '@bryntum/gantt';

export const ganttProps: BryntumGanttProps = {
    project : {
        autoSetConstraints : true,
        autoLoad           : true,
        transport          : {
            load : {
                // We load data from a static JSON file in this example.
                // Please change this to load data from your server.
                url : 'data/launch-saas-2023.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    columns : [
        { type : 'name', field : 'name', width : 300 }
    ],
    timeRangesFeature : true,
    viewPreset        : 'weekAndDayLetter',
    barMargin         : 10,
    // Custom task content, display task name on child tasks
    taskRenderer({ taskRecord }): string {
        if (taskRecord.isLeaf && !taskRecord.isMilestone) {
            return StringHelper.encodeHtml(taskRecord.name);
        }
        return '';
    }
};

