import React, { createRef, Component } from 'react';
import { Combo, DomHelper, BrowserHelper } from '@bryntum/gantt';
export class BryntumThemeCombo extends Component {
    constructor() {
        super(...arguments);
        this.elRef = createRef();
    }
    componentDidMount() {
        const { container, store = {
            data: [
                { id: 'svalbard-light', text: 'Svalbard Light' },
                { id: 'svalbard-dark', text: 'Svalbard Dark' },
                { id: 'visby-light', text: 'Visby Light' },
                { id: 'visby-dark', text: 'Visby Dark' },
                { id: 'stockholm-light', text: 'Stockholm Light' },
                { id: 'stockholm-dark', text: 'Stockholm Dark' },
                { id: 'material3-light', text: 'Material3 Light' },
                { id: 'material3-dark', text: 'Material3 Dark' },
                { id: 'fluent2-light', text: 'Fluent2 Light' },
                { id: 'fluent2-dark', text: 'Fluent2 Dark' },
                { id: 'high-contrast-light', text: 'High Contrast Light' },
                { id: 'high-contrast-dark', text: 'High Contrast Dark' }
            ]
        }, label = 'Theme', width = '16em', position = 'insertFirst' } = this.props;
        const element = this.elRef.current || container;
        this.combo = new Combo({
            [position]: element,
            store,
            label,
            width,
            value: 'svalbard-light',
            editable: false,
            labelPosition: 'before',
            listeners: {
                change({ value }) {
                    DomHelper.setTheme(value).then((context) => {
                        if (context) {
                            const { theme, prev } = context;
                            document.body.classList.remove(`b-theme-${prev}`);
                            document.body.classList.add(`b-theme-${theme}`);
                        }
                    });
                }
            }
        });
        const theme = BrowserHelper.searchParam('theme');
        if (theme) {
            this.combo.value = theme;
        }
    }
    componentWillUnmount() {
        if (this.combo) {
            this.combo.destroy();
        }
    }
    shouldComponentUpdate(nextProps) {
        const { combo } = this;
        if (combo) {
            if (nextProps.store) {
                combo.store = nextProps.store;
            }
            if (nextProps.label) {
                combo.label = nextProps.label;
            }
            if (nextProps.width) {
                combo.width = nextProps.width;
            }
        }
        return true;
    }
    render() {
        return this.props.container ? null : React.createElement("div", { className: "b-theme-combo", ref: this.elRef });
    }
}
//# sourceMappingURL=BryntumThemeCombo.js.map