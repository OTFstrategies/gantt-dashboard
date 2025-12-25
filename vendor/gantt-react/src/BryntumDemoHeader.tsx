/**
 * Header for Bryntum demos
 */

import React, { Component, createRef, Fragment, ReactNode, RefObject } from 'react';
import { BryntumFullscreenButton } from './BryntumFullscreenButton';
import { BryntumButton } from './BryntumButton';
import { BryntumThemeCombo } from './BryntumThemeCombo';
import { AjaxHelper, CSSHelper, DemoCodeEditor } from '@bryntum/gantt';

export type BryntumDemoHeaderProps = {
    /**
     * Insert children to demo header
     */
    children?: ReactNode | ReactNode[]
    /**
     * Demo title for header
     */
    title?: string
    /**
     * Display <BryntumThemeCombo/> component when set to `true`
     */
    themeCombo?: boolean
}

interface DemoCodeEditorState {
    hiddenEditor: boolean
}

export class BryntumDemoHeader extends Component<BryntumDemoHeaderProps, DemoCodeEditorState> {

    static defaultProps: BryntumDemoHeaderProps = {
        themeCombo : true
    };

    codeButtonRef: RefObject<BryntumButton> = createRef<BryntumButton>();

    downloadButtonRef: RefObject<BryntumButton> = createRef<BryntumButton>();

    isTest = document.location.search.includes('test');


    isThin = document.location.href.includes('-thin');

    demoProduct = document.location.href.match(/\/(\w+)(-trial)?\/[-\w]*examples\//)?.[1].toLowerCase() || 'gantt';

    downloadLink = `https://bryntum.com/download/?product=${this.demoProduct}`;

    appFolder = '../';

    constructor(props: any) {
        super(props);
        this.state = {
            hiddenEditor : !Boolean(DemoCodeEditor.monacoCodePath)
        };
    }

    codeEditor?: DemoCodeEditor;

    getLink(): string {
        // Convert:
        // https://bryntum.com/products/schedulerpro/examples-scheduler/frameworks/react/javascript/basic/build/
        // https://bryntum.com/products/schedulerpro/examples/frameworks/react/javascript/basic/build/
        // To:
        // https://bryntum.com/products/schedulerpro/examples/#example-examples-scheduler-frameworks-react-basic
        // https://bryntum.com/products/schedulerpro/examples/#example-frameworks-react-basic

        const match = /(.*?\/)(examples.*?\/frameworks\/.*?)\/(build|out|dist)/.exec(document.location.href);
        return match ? `${match[1]}examples/#example-${match[2].replace(/\//gm, '-').replace('examples-frameworks', 'frameworks')}` : '#';
    }

    getTitle(): string {
        return this.props.title || document.title.split(' - ')[1] || document.title;
    }

    shouldComponentUpdate(nextProps: Readonly<BryntumDemoHeaderProps>): boolean {
        return nextProps.title !== this.props.title;
    }

    toggleCodeEditor = async() => {
        this.codeEditor = await DemoCodeEditor.toggleCodeEditor(
            this.codeEditor,
            this.codeButtonRef!.current!.instance,
            {
                appFolder        : this.appFolder,
                preferredSources : [
                    /App\.[jt]sx?/,
                    /\w+Config\.[jt]sx?/
                ]
            }
        );
    };

    async componentDidMount() {
        if (!this.state.hiddenEditor) {
            CSSHelper.insertRule('body { flex-direction : row !important }');
            CSSHelper.insertRule('#root, #container { flex: 1 !important; overflow : hidden !important }');
            CSSHelper.insertRule('#tools .b-widget { height: 2.5em !important }');

            const appConfig = (await AjaxHelper.get(`${this.appFolder}app.config.json`, { parseJson : true })).parsedJson;
            if (appConfig.zip || this.isTest) {
                const downloadButton  = this.downloadButtonRef!.current!.instance;
                downloadButton.hidden = false;
                downloadButton.href   = `${this.appFolder}${appConfig.zip}`;
            }
        }

        // Enables special styling when generating screenshots
        const params = new URLSearchParams(window.location.search);
        if (params.has('screenshot')) {
            document.body.classList.add('b-screenshot');
            if (window.bryntum) {
                (window.bryntum as any).noAnimations = true;
            }
        }
    }

    render(): ReactNode {
        return (
            <Fragment>
                <header className="demo-header b-bryntum">
                    <a id="title" className="title" href={this.getLink()}>
                        <h1>
                            <svg viewBox="0 0 354.9 144.52" xmlns="http://www.w3.org/2000/svg">
                                <g><path d="m305.63 144.52c-12.47 0-23.53-4.83-31.58-13.28v11.06h-25.54v-142.3h26.75v48.58c7.84-7.64 18.5-12.07 30.37-12.07 27.15 0 49.28 23.33 49.28 54.1s-22.12 53.9-49.28 53.9zm-3.82-83.47c-14.68 0-26.55 13.27-26.55 29.77s11.87 29.16 26.55 29.16 26.55-12.67 26.55-29.16-11.87-29.77-26.55-29.77z"/><path d="m148.02 0h74.01v29.78h-74.01z"/><path d="m0 56.26h222.03v29.78h-222.03z"/><path d="m74.01 112.52h148.02v29.6h-148.02z"/></g>
                            </svg>
                            {this.getTitle()}
                        </h1>
                    </a>
                    <div id="tools" className="tools">
                        {this.props.children}
                        {this.props.themeCombo && !this.isThin && <BryntumThemeCombo/>}
                        <BryntumButton
                            text="Download Trial"
                            href={this.downloadLink}
                            rendition="filled"
                        />
                        <BryntumButton
                            ref={this.codeButtonRef}
                            hidden={this.state.hiddenEditor}
                            icon="b-icon-code"
                            onClick={this.toggleCodeEditor}
                            tooltip={'Click to show the code viewer'}
                            rendition="text"
                        />
                        <BryntumButton
                            ref={this.downloadButtonRef}
                            hidden={true}
                            icon="b-icon-download"
                            href={'#'}
                            tooltip={'Download this demo zip archive'}
                            rendition="text"
                        />
                        <BryntumFullscreenButton/>
                    </div>
                </header>
            </Fragment>
        );
    }
}
