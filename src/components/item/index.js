// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import Player from '../player';
import TrackParts from '../track-parts';
import { onLoad } from '../../youtube';
import store from '../../storage';

import type { ItemData } from '../app';

type Props = {|
    params: {|
        id: string,
    |}
|}

type State = {|
    item: ?ItemData,
    isYTLoaded: boolean,
|}

export default class Item extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const items = store.get('items') || [];

        const item = items.find(item => item.id === props.params.id);

        this.state = {
            item,
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
        const { item, isYTLoaded } = this.state;

        if (!item) {
            return (
                <div className="b-item">
                    Item not found
                </div>
            );
        }

        if (!isYTLoaded) {
            return (
                <div className="b-item" />
            );
        }

        return (
            <div className="b-item">
                <div className="b-item__side">
                    <TrackParts item={item}/>
                </div>
                <div className="b-item__side">
                    <Player videoId={item.videoId} />
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
