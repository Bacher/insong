import React, { Component } from 'react';
import _ from 'lodash';
import Player from '../player';
import { onLoad } from '../../youtube';

type State = {|
    isYTLoaded: boolean,
|}

class App extends Component<any, State> {

    constructor(props: any) {
        super(props);

        this.state = {
            isYTLoaded: false,
        };

        _.bindAll(this, [
            '_onYoutubeLoaded',
        ]);
    }

    componentDidMount() {
        onLoad(this._onYoutubeLoaded);
    }

    render() {
        const { isYTLoaded } = this.state;

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                {isYTLoaded ? <Player /> : null}
            </div>
        );
    }

    _onYoutubeLoaded() {
        this.setState({
            isYTLoaded: true,
        });
    }

}

export default App;
