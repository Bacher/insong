// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames'
import store from '../../storage';
import TimeLine from '../timeline';

type TimeInterval = {|
    start: number,
    end: number,
|}

type PartInfo = {|
    time: TimeInterval,
    title: string,
|}

type State = {|
    time: number,
    duration: number,
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

        const items = store.get('parts') || [];

        this.state = {
            time:     0,
            duration: 0,
            items:    items,
            selected: items.length ? 0 : null,
            capture:  false,
            repeat:   store.get('repeat', false),
        };

        console.log(this.state.items);

        _.bindAll(this, [
            '_onItemClick',
            '_onRepeatChange',
            '_onPlayEntireClick',
            '_onStartCaptureClick',
            '_onEndCaptureClick',
            '_onResetCaptureClick',
            '_onPauseClick',
            '_onKeyDown',
        ]);
    }

    componentDidMount() {
        this._interval(Infinity, 100, 'duration', () => {
            if (window.ppp && window.ppp.getCurrentTime) {
                this.setState({
                    time: window.ppp.getCurrentTime(),
                });
            }
        });

        (document.body: any).addEventListener('keydown', this._onKeyDown);

        this._getDuration();
    }

    _getDuration() {
        if (window.ppp && window.ppp.getDuration) {
            this.setState({
                duration: window.ppp.getDuration(),
            });
        } else {
            setTimeout(() => this._getDuration(), 10);
        }
    }

    componentWillUnmount() {
        (document.body: any).removeEventListener('keydown', this._onKeyDown);

        this._stopPlayerOperations();
        this._clearI('duration');
    }

    render() {
        const { time, duration, items, repeat, capture, selected } = this.state;

        let range = null;

        if (selected != null && duration) {
            range = items[selected].time;
        }

        return (
            <div className="b-track-parts">
                <div className="b-track-parts__items">
                    {items.map((item, i) => (
                        <div key={i} className={cn('b-track-parts__item', {
                            'b-track-parts__item_active': i === selected,
                        })} data-id={i} onClick={this._onItemClick}>
                            {item.title} ({toTime(item.time.start)} - {toTime(item.time.end)})
                            <i className="b-track-parts__item-remove" onClick={e => this._onRemoveItem(e, i)}>x</i>
                        </div>
                    ))}
                </div>
                <div className="b-track-parts__controls">
                    <button type="button" className="b-track-parts__btn" title="Repeat" onClick={this._onRepeatChange}>
                        <i className={cn('fa fa-repeat', {
                            'b-track-parts__repeat_active': repeat,
                        })} />
                    </button>
                    <button type="button" className="b-track-parts__btn" title="Entire play" onClick={this._onPlayEntireClick}>
                        <i className="fa fa-youtube-play" />
                    </button>
                    <button type="button" className="b-track-parts__btn" title="Pause" onClick={this._onPauseClick}>
                        <i className="fa fa-pause" />
                    </button>
                    <button type="button" className="b-track-parts__btn" title={capture ? 'Stop' : 'Start capture'} onClick={capture ? this._onEndCaptureClick : this._onStartCaptureClick}>
                        <i className={cn('fa fa-circle', {
                            'b-track-parts__capture_active': capture,
                        })} />
                    </button>
                    {capture ?
                        <button type="button" className="b-track-parts__btn" title="Reset capture" onClick={this._onResetCaptureClick}>
                            <i className="fa fa-ban" />
                        </button>
                        : null
                    }
                    <div>{toTime(time)}</div>
                </div>
                <TimeLine range={range} time={time} duration={duration} />
            </div>
        );
    }

    _onItemClick(e: ?MouseEvent, _index?: ?number) {
        const index = _index == null ? Number((e: any).currentTarget.dataset.id) : _index;

        const { items } = this.state;
        const item      = items[index];

        this.setState({
            selected: index,
        });

        this._stopPlayerOperations();
        this._repeat(item.time.start, Math.round((item.time.end - item.time.start) * 1000));
    }

    _onRemoveItem(e: any, i: number) {
        if (e) {
            e.stopPropagation();
        }
        const { items, selected } = this.state;

        items.splice(i, 1);

        if (selected != null && selected === i && selected === items.length) {
            let newSel = selected - 1;

            if (newSel < 0) {
                newSel = null;
            }

            this.setState({
                selected: newSel,
            });
        } else {
            this.forceUpdate();
        }

        store.set('parts', this.state.items);
    }

    _onRepeatChange() {
        const checked = !this.state.repeat;

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
            selected: null,
            capture:  true,
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
            capture:  false,
            selected: this.state.items.length - 1,
        });
    }

    _onResetCaptureClick() {
        this.setState({
            capture: false,
        });
    }

    _repeat(start: number, interval: number) {
        const player = window.ppp;
        player.seekTo(start - 0.1);
        player.playVideo();
        let prevTime = player.getCurrentTime();

        const end = start + interval / 1000;

        this._interval(Infinity, 10, 'i3', (i, clear) => {
            const currentTime = player.getCurrentTime();

            if (prevTime === 0) {
                prevTime = currentTime;

            } else if (currentTime !== prevTime) {
                clear();

                this._interval(Infinity, 50, 'i3', () => {
                    const time = player.getCurrentTime();
                    const delta = time - end;

                    if (delta > -0.05 && delta < 0.1) {
                        this._clearI('i3');

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
                    }
                });

                this._interval(10, 50, 'i3', i => {
                    player.setVolume(i * 10);
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

    _onKeyDown(e: KeyboardEvent) {
        if (!window.ppp) {
            return;
        }

        switch (e.which) {
            case 32: // space
                //this._onStartCaptureClick();
                if (window.ppp.getPlayerState() === 1) {
                    this._onPauseClick();
                } else if (this.state.selected != null) {
                    this._onItemClick(null, this.state.selected);
                } else {
                    this._onPlayEntireClick();
                }
                break;
            case 37:
                this._seek(2 * (e.altKey ? 0.5 : e.shiftKey ? 5 : 1));
                break;
            case 39:
                this._seek(-2 * (e.altKey ? 0.5 : e.shiftKey ? 5 : 1));
                break;
            case 38: // up
                this._selectPrev();
                break;
            case 40: // up
                this._selectNext();
                break;
            case 8: // backspace
                if (this.state.selected != null && window.confirm('Are you sure?')) {
                    this._onRemoveItem(null, this.state.selected);
                }
                break;
            case 49: // 1
                if (this.state.capture) {
                    this._onEndCaptureClick();
                } else {
                    this._onStartCaptureClick();
                }
                break;
            case 82: // r
                this._onRepeatChange();
                break;
            default:
                // fallback
        }

        console.log(e.which);
    }

    _seek(sec: number) {
        const player = window.ppp;

        if (player.getPlayerState() !== 1) {
            return;
        }

        player.seekTo(player.getCurrentTime() - sec);
    }

    _selectPrev() {
        const { items, selected } = this.state;

        let newSel;

        if (items) {
            if (selected == null) {
                newSel = 0;
            } else {
                newSel = selected - 1;

                if (newSel < 0) {
                    newSel = items.length - 1;
                }
            }
        }

        this.setState({
            selected: newSel,
        });
    }

    _selectNext() {
        const { items, selected } = this.state;

        let newSel;

        if (items) {
            if (selected == null) {
                newSel = 0;
            } else {
                newSel = selected + 1;

                if (newSel >= items.length) {
                    newSel = 0;
                }
            }
        }

        this.setState({
            selected: newSel,
        });
    }

}

function toTime(_seconds) {
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
