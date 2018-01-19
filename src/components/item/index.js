// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import Player from '../player';
import TrackParts from '../track-parts';
import { onLoad } from '../../youtube';

type Props = {|
|}

type State = {|
    isYTLoaded: boolean,
|}

export default class Item extends Component<Props, State> {

    constructor(props: Props) {
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

        if (!isYTLoaded) {
            return (
                <div className="b-item" />
            );
        }

        return (
            <div className="b-item">
                <div className="b-item__side">
                    <TrackParts />
                </div>
                <div className="b-item__side">
                    <Player />
                </div>
            </div>
        );
    }

    _onYoutubeLoaded() {
        this.setState({
            isYTLoaded: true,
        });
    }

}
