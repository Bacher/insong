// @flow

import React, { Component } from 'react';
import _ from 'lodash';

type Props = {|
    videoId: string,
|}

type State = {|
|}

const OPTIONS = {
    controls:       1,
    disablekb:      1,
    fs:             0,
    loop:           0,
    showinfo:       0,
    modestbranding: 1,
    rel:            0,
};

export default class Player extends Component<Props, State> {

    _videoEl: any;
    _player: any;

    constructor(props: Props) {
        super(props);

        _.bindAll(this, [
            '_onPlayerRef',
        ]);
    }

    componentWillReceiveProps(props: Props) {
        if (this.props.videoId !== props.videoId) {
            this._destroyPlayer();
            this._initPlayer(props.videoId);
        }
    }

    render() {
        return (
            <div className="b-player">
                <div ref={this._onPlayerRef} />
            </div>
        );
    }

    _onPlayerRef(el: any) {
        if (el) {
            this._videoEl = el;
            this._initPlayer();

        } else {
            this._destroyPlayer();
            this._videoEl = null;
        }
    }

    _initPlayer(videoId: string = this.props.videoId) {
        this._player = new window.YT.Player(this._videoEl, {
            width:      '640',
            height:     '360',
            //videoId:    '253vLj037K4',
            //videoId:    'NZc_emXplE4',
            //videoId:    'BfwCYaVUCHM',
            //videoId:    'bCDIt50hRDs',
            //videoId:    '-OBK8k_B3Lc',
            videoId:    videoId,
            events:     {
                'onReady':       event => {
                    //event.target.playVideo();
                },
                'onStateChange': event => {
                    //event.data === YT.PlayerState.PLAYING
                    //youtubePlayer.stopVideo()
                },
            },
            playerVars: OPTIONS,
        });

        window.ppp = this._player;
    }

    _destroyPlayer() {
        if (this._player) {
            this._player.destroy();
            this._player = null;
        }
    }

}
