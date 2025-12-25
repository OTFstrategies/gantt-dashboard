'use client';

import React from 'react';
import { BryntumGantt } from '@bryntum/gantt-react';
import { ganttProps } from './GanttConfig';

const Gantt: React.FC = () => {
    return <BryntumGantt {...ganttProps} />;
};

export default Gantt;
