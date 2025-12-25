'use client';

import React from 'react';
import { BryntumDemoHeader, BryntumGantt } from '@bryntum/gantt-react';
import { ganttProps } from './GanttConfig';

// Props are here for demonstration purposes only, but not used in this demo
const Gantt: React.FC = () => {
    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumGantt {...ganttProps} />
        </>
    );
};

export default Gantt;
