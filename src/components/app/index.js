// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import Player from '../player';
import TrackParts from '../track-parts';
import { onLoad } from '../../youtube';

type State = {|
    isYTLoaded: boolean,
|}

export default class App extends Component<any, State> {

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

        if (isYTLoaded) {
            return (
                <div className="b-app">
                    <div className="b-app__side">
                        <TrackParts />
                    </div>
                    <div className="b-app__side">
                        <Player />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="b-app" />
            );
        }
    }

    _onYoutubeLoaded() {
        this.setState({
            isYTLoaded: true,
        });
    }

}
