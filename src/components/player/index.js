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

class Player extends Component<Props, State> {

    _youtubePlayer: any;

    constructor(props: Props) {
        super(props);

        const a = 5;

        _.bindAll(this, [
            '_onPlayerRef',
        ]);
    }

    render() {
        return (
            <div className="b-player">
                PLAYER:
                <div id="player" ref={this._onPlayerRef} />
            </div>
        );
    }

    _onPlayerRef(el: any) {
        if (el) {
            this._youtubePlayer = new window.YT.Player('player', {
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
        }
    }

}

export default Player;
