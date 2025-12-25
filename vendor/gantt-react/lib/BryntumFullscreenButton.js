import React, { createRef, Component } from 'react';
import { Button, Fullscreen } from '@bryntum/gantt';
export class BryntumFullscreenButton extends Component {
    constructor() {
        super(...arguments);
        this.elRef = createRef();
    }
    componentDidMount() {
        if (Fullscreen.enabled) {
            this.button = new Button({
                adopt: this.elRef.current,
                icon: 'b-icon b-icon-fullscreen',
                tooltip: 'Fullscreen',
                rendition: 'text',
                onClick() {
                    if (Fullscreen.enabled) {
                        if (!Fullscreen.isFullscreen) {
                            Fullscreen.request(document.body);
                        }
                        else {
                            Fullscreen.exit();
                        }
                    }
                }
            });
        }
    }
    componentWillUnmount() {
        if (this.button) {
            this.button.destroy();
        }
    }
    render() {
        return (React.createElement("div", { ref: this.elRef }));
    }
}
//# sourceMappingURL=BryntumFullscreenButton.js.map