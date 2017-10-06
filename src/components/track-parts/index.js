// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames'
import store from '../../storage';

type TimeInterval = {|
    start: number,
    end: number,
|}

type PartInfo = {|
    time: TimeInterval,
    title: string,
|}

type State = {|
    items: Array<PartInfo>,
    selected: ?number,
    repeat: boolean,
    capture: boolean,
|}

export default class TrackParts extends Component<any, State> {

    _i: Map<string,any>;
    _startCaptureTime: ?number;

    constructor(props: any) {
        super(props);

        this._i = new Map();

        this.state = {
            items:    store.get('parts') || [],
            selected: null,
            capture:  false,
            repeat:   store.get('repeat', false),
        };

        _.bindAll(this, [
            '_onItemClick',
            '_onRepeatChange',
            '_onPlayEntireClick',
            '_onStartCaptureClick',
            '_onEndCaptureClick',
            '_onResetCaptureClick',
            '_onPauseClick',
        ]);
    }

    componentWillMount() {
        this._interval(Infinity, 100, 'duration', () => {
            if (this.refs.duration && window.ppp && window.ppp.getCurrentTime) {
                this.refs.duration.innerHTML = time(window.ppp.getCurrentTime());
            }
        });
    }

    componentWillUnmount() {
        this._stopPlayerOperations();
        this._clearI('duration');
    }

    render() {
        const { items, repeat, capture, selected } = this.state;

        return (
            <div className="b-track-parts">
                <div className="b-track-parts__items">
                    {items.map((item, i) => (
                        <div key={i} className={cn('b-track-parts__item', {
                            'b-track-parts__item_active': i === selected,
                        })} data-id={i} onClick={this._onItemClick}>
                            {item.title} ({time(item.time.start)} - {time(item.time.end)})
                        </div>
                    ))}
                </div>
                <div className="b-track-parts__controls">
                    <label>
                        <input type="checkbox" checked={repeat} onChange={this._onRepeatChange} />
                        repeat
                    </label>
                    <button type="button" onClick={this._onPlayEntireClick}>Play entire</button>
                    <button type="button" onClick={this._onPauseClick}>Pause</button>
                    <button type="button" disabled={capture} onClick={this._onStartCaptureClick}>Start capture</button>
                    <button type="button" disabled={!capture} onClick={this._onEndCaptureClick}>End capture</button>
                    <button type="button" disabled={!capture} onClick={this._onResetCaptureClick}>Reset capture</button>
                    <div ref="duration">0:00</div>
                </div>
            </div>
        );
    }

    _onItemClick(e: MouseEvent) {
        const { items } = this.state;
        const index     = Number((e: any).currentTarget.dataset.id);
        const item      = items[index];

        this.setState({
            selected: index,
        });

        this._stopPlayerOperations();
        this._repeat(item.time.start, Math.round((item.time.end - item.time.start) * 1000));
    }

    _onRepeatChange(e: Event) {
        const checked = (e.currentTarget: any).checked;

        store.set('repeat', checked);
        this.setState({
            repeat: checked,
        });
    }

    _onPauseClick() {
        this._stopPlayerOperations();
        window.ppp.pauseVideo();
    }

    _onPlayEntireClick() {
        this._stopPlayerOperations();
        const player = window.ppp;

        player.seekTo(0);
        player.setVolume(100);
        player.playVideo();

        this.setState({
            selected: null,
        });
    }

    _stopPlayerOperations() {
        this._clearI('i3');
    }

    _clearI(label: string) {
        const store = this._i.get(label);

        if (store) {
            for (let i of store.i) {
                clearInterval(i);
            }
            for (let t of store.t) {
                clearTimeout(t);
            }

            this._i.delete(label);
        }
    }

    _onStartCaptureClick() {
        this._startCaptureTime = window.ppp.getCurrentTime();

        this.setState({
            capture: true,
        });
    }

    _onEndCaptureClick() {
        this.state.items.push({
            title: 'New capture',
            time: {
                start: this._startCaptureTime || 0,
                end:   window.ppp.getCurrentTime(),
            }
        });

        store.set('parts', this.state.items);

        this.setState({
            capture: false,
        });
    }

    _onResetCaptureClick() {
        this.setState({
            capture: true,
        });
    }

    _repeat(start: number, interval: number) {
        const player = window.ppp;
        player.seekTo(start - 0.1);
        player.playVideo();
        let prevTime = player.getCurrentTime();

        this._interval(Infinity, 10, 'i3', (i, clear) => {
            const currentTime = player.getCurrentTime();

            if (prevTime === 0) {
                prevTime = currentTime;

            } else if (currentTime !== prevTime) {
                clear();

                this._interval(10, 50, 'i3', i => {
                    player.setVolume(i * 10);
                }, () => {
                    this._timeout(interval, 'i3', () => {
                        this._interval(10, 50, 'i3', i => {
                            player.setVolume(100 - i * 10);
                        }, () => {
                            player.pauseVideo();

                            if (this.state.repeat) {
                                this._timeout(1000, 'i3', () => {
                                    if (this.state.repeat) {
                                        this._repeat(start, interval);
                                    }
                                });
                            }
                        });
                    });
                });
            }
        });
    }

    _getLabel(label: string) {
        let store = this._i.get(label);

        if (!store) {
            store = ({ i: new Set(), t: new Set() }: any);
            this._i.set(label, store);
        }

        return store;
    }

    _timeout(interval: number, label: string, tick: Function) {
        const store = this._getLabel(label);

        const timeoutId = setTimeout(() => {
            store.t.delete(timeoutId);
            tick();
        }, interval);

        store.t.add(timeoutId);
    }

    _interval(count: number, interval: number, label: string, tick: Function, end?: ?Function) {
        const store = this._getLabel(label);

        let i = 0;
        let isClear = false;

        const intervalId = setInterval(() => {
            i++;

            try {
                tick(i, clear);
            } catch(err) {
                console.error(err);
                clear();
                return;
            }

            if (i === count && !isClear) {
                clear();

                if (end) {
                    end();
                }
            }
        }, interval);

        store.i.add(intervalId);

        function clear() {
            isClear = true;
            clearInterval(intervalId);
            store.i.delete(intervalId);
        }
    }

}

function time(_seconds) {
    const seconds = Math.round(_seconds);

    return Math.floor(seconds / 60) + ':' + nn(seconds % 60);
}

function nn(val) {
    const v = val.toString();

    if (v.length === 1) {
        return '0' + v;
    } else {
        return v;
    }
}
