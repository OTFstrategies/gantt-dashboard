import { Component, ReactNode, RefObject } from 'react';
import { BryntumButton } from './BryntumButton';
import { DemoCodeEditor } from '@bryntum/gantt';
export declare type BryntumDemoHeaderProps = {
    children?: ReactNode | ReactNode[];
    title?: string;
    themeCombo?: boolean;
};
interface DemoCodeEditorState {
    hiddenEditor: boolean;
}
export declare class BryntumDemoHeader extends Component<BryntumDemoHeaderProps, DemoCodeEditorState> {
    static defaultProps: BryntumDemoHeaderProps;
    codeButtonRef: RefObject<BryntumButton>;
    downloadButtonRef: RefObject<BryntumButton>;
    isTest: boolean;
    isThin: boolean;
    demoProduct: string;
    downloadLink: string;
    appFolder: string;
    constructor(props: any);
    codeEditor?: DemoCodeEditor;
    getLink(): string;
    getTitle(): string;
    shouldComponentUpdate(nextProps: Readonly<BryntumDemoHeaderProps>): boolean;
    toggleCodeEditor: () => Promise<void>;
    componentDidMount(): Promise<void>;
    render(): ReactNode;
}
export {};
