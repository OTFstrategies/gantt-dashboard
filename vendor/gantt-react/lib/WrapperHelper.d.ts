import React from 'react';
import { Widget } from '@bryntum/gantt';
declare global {
    interface Window {
        bryntum: {
            isTestEnv?: boolean;
            react?: {
                isReactElement?: (element: any) => boolean;
                handleReactElement?: (widget: Widget, element: any) => void;
                handleReactHeaderElement?: (column: {
                    grid: any;
                    id: string;
                }, headerElement: HTMLElement, html: any) => void;
            };
        };
    }
}
declare function createWidget(component: any): any;
declare function shouldComponentUpdate(component: any, nextProps: Readonly<any>, nextState: Readonly<any>): boolean;
declare function processWidgetContent({ reactElement, widget, reactComponent, contentElement }: {
    reactElement: any;
    widget: any;
    reactComponent: any;
    contentElement: any;
}): React.ReactPortal | undefined;
export { createWidget, shouldComponentUpdate, processWidgetContent };
