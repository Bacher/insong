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
            <div>
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
