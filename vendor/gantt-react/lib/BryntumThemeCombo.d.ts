import { ReactNode, Component } from 'react';
import { Store, StoreConfig } from '@bryntum/gantt';
export declare type BryntumThemeComboProps = {
    container?: string | Element;
    store?: Store | object | StoreConfig;
    label?: string;
    width?: string;
    position?: string;
};
export declare class BryntumThemeCombo extends Component<BryntumThemeComboProps> {
    private elRef;
    private combo?;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: Readonly<BryntumThemeComboProps>): boolean;
    render(): ReactNode;
}
