import React, { Component, createRef, Fragment } from 'react';
import { BryntumFullscreenButton } from './BryntumFullscreenButton';
import { BryntumButton } from './BryntumButton';
import { BryntumThemeCombo } from './BryntumThemeCombo';
import { AjaxHelper, CSSHelper, DemoCodeEditor } from '@bryntum/gantt';
export class BryntumDemoHeader extends Component {
    constructor(props) {
        var _a;
        super(props);
        this.codeButtonRef = createRef();
        this.downloadButtonRef = createRef();
        this.isTest = document.location.search.includes('test');
        this.isThin = document.location.href.includes('-thin');
        this.demoProduct = ((_a = document.location.href.match(/\/(\w+)(-trial)?\/[-\w]*examples\//)) === null || _a === void 0 ? void 0 : _a[1].toLowerCase()) || 'gantt';
        this.downloadLink = `https://bryntum.com/download/?product=${this.demoProduct}`;
        this.appFolder = '../';
        this.toggleCodeEditor = async () => {
            this.codeEditor = await DemoCodeEditor.toggleCodeEditor(this.codeEditor, this.codeButtonRef.current.instance, {
                appFolder: this.appFolder,
                preferredSources: [
                    /App\.[jt]sx?/,
                    /\w+Config\.[jt]sx?/
                ]
            });
        };
        this.state = {
            hiddenEditor: !Boolean(DemoCodeEditor.monacoCodePath)
        };
    }
    getLink() {
        const match = /(.*?\/)(examples.*?\/frameworks\/.*?)\/(build|out|dist)/.exec(document.location.href);
        return match ? `${match[1]}examples/#example-${match[2].replace(/\//gm, '-').replace('examples-frameworks', 'frameworks')}` : '#';
    }
    getTitle() {
        return this.props.title || document.title.split(' - ')[1] || document.title;
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.title !== this.props.title;
    }
    async componentDidMount() {
        if (!this.state.hiddenEditor) {
            CSSHelper.insertRule('body { flex-direction : row !important }');
            CSSHelper.insertRule('#root, #container { flex: 1 !important; overflow : hidden !important }');
            CSSHelper.insertRule('#tools .b-widget { height: 2.5em !important }');
            const appConfig = (await AjaxHelper.get(`${this.appFolder}app.config.json`, { parseJson: true })).parsedJson;
            if (appConfig.zip || this.isTest) {
                const downloadButton = this.downloadButtonRef.current.instance;
                downloadButton.hidden = false;
                downloadButton.href = `${this.appFolder}${appConfig.zip}`;
            }
        }
        const params = new URLSearchParams(window.location.search);
        if (params.has('screenshot')) {
            document.body.classList.add('b-screenshot');
            if (window.bryntum) {
                window.bryntum.noAnimations = true;
            }
        }
    }
    render() {
        return (React.createElement(Fragment, null,
            React.createElement("header", { className: "demo-header b-bryntum" },
                React.createElement("a", { id: "title", className: "title", href: this.getLink() },
                    React.createElement("h1", null,
                        React.createElement("svg", { viewBox: "0 0 354.9 144.52", xmlns: "http://www.w3.org/2000/svg" },
                            React.createElement("g", null,
                                React.createElement("path", { d: "m305.63 144.52c-12.47 0-23.53-4.83-31.58-13.28v11.06h-25.54v-142.3h26.75v48.58c7.84-7.64 18.5-12.07 30.37-12.07 27.15 0 49.28 23.33 49.28 54.1s-22.12 53.9-49.28 53.9zm-3.82-83.47c-14.68 0-26.55 13.27-26.55 29.77s11.87 29.16 26.55 29.16 26.55-12.67 26.55-29.16-11.87-29.77-26.55-29.77z" }),
                                React.createElement("path", { d: "m148.02 0h74.01v29.78h-74.01z" }),
                                React.createElement("path", { d: "m0 56.26h222.03v29.78h-222.03z" }),
                                React.createElement("path", { d: "m74.01 112.52h148.02v29.6h-148.02z" }))),
                        this.getTitle())),
                React.createElement("div", { id: "tools", className: "tools" },
                    this.props.children,
                    this.props.themeCombo && !this.isThin && React.createElement(BryntumThemeCombo, null),
                    React.createElement(BryntumButton, { text: "Download Trial", href: this.downloadLink, rendition: "filled" }),
                    React.createElement(BryntumButton, { ref: this.codeButtonRef, hidden: this.state.hiddenEditor, icon: "b-icon-code", onClick: this.toggleCodeEditor, tooltip: 'Click to show the code viewer', rendition: "text" }),
                    React.createElement(BryntumButton, { ref: this.downloadButtonRef, hidden: true, icon: "b-icon-download", href: '#', tooltip: 'Download this demo zip archive', rendition: "text" }),
                    React.createElement(BryntumFullscreenButton, null)))));
    }
}
BryntumDemoHeader.defaultProps = {
    themeCombo: true
};
//# sourceMappingURL=BryntumDemoHeader.js.map