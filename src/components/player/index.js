// @flow

import React, { Component } from 'react';
import _ from 'lodash';

type Props = {|

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

    _youtubePlayer: any;

    constructor(props: Props) {
        super(props);

        _.bindAll(this, [
            '_onPlayerRef',
        ]);
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
            window.ppp = this._youtubePlayer = new window.YT.Player(el, {
                width:      '640',
                height:     '360',
                videoId:    '253vLj037K4',
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
        } else {
            this._youtubePlayer.destroy();
        }
    }

}
