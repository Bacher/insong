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
    hover: ?number,
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
            hover:    null,
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
            '_onKeyDown',
            '_onHoverRange',
            '_onClickRange',
            '_onTimeStartChange',
            '_onTimeEndChange',
            '_onTitleChange',
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

        const track = selected != null ? items[selected] : null;

        return (
            <div className="b-track-parts">
                Chunks:
                <div className="b-track-parts__items">
                    {items.map((item, i) => (
                        <div key={i} className={cn('b-track-parts__item', {
                            'b-track-parts__item_active': i === selected,
                        })} data-id={i} onClick={this._onItemClick}>
                            {item.title} ({toTime(item.time.start)} - {toTime(item.time.end)})
                            <i className="fa fa-times b-track-parts__item-remove" onClick={e => this._onRemoveItem(e, i)} />
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
                {track ?
                    <div className="b-track-parts__current-track">
                        Current chunk:
                        <input className="b-track-parts__track-title" value={track.title} onChange={this._onTitleChange} />
                        <input className="b-track-parts__track-time" value={toTimeMs(track.time.start)} onChange={this._onTimeStartChange} />
                        {' - '}
                        <input className="b-track-parts__track-time" value={toTimeMs(track.time.end)} onChange={this._onTimeEndChange} />
                    </div>
                    : null
                }
                <TimeLine
                    items={items.map(item => item.time)}
                    selected={selected}
                    time={time}
                    duration={duration}
                    onHover={this._onHoverRange}
                    onClick={this._onClickRange}
                />
            </div>
        );
    }

    _onHoverRange(i: ?number) {
        this.setState({ hover: i });
    }

    _onClickRange(i: number) {
        //if (i !== this.state.selected) {
        this._onItemClick(null, i);
        //}
    }

    _onItemClick(e: ?MouseEvent, _index?: ?number) {
        const index = _index == null ? Number((e: any).currentTarget.dataset.id) : _index;

        const { items } = this.state;
        const item      = items[index];

        this.setState({
            selected: index,
        });

        this._stopPlayerOperations();
        this._repeat(item.time.start);
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

        this._saveItems();
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

        this._saveItems();

        const newSel = this.state.items.length - 1;

        this.setState({
            capture:  false,
            selected: newSel,
        });

        this._interval(10, 50, 'i3', i => {
            window.ppp.setVolume(100 - i * 10);
        }, () => {
            this._onItemClick(null, newSel);
        });
    }

    _onResetCaptureClick() {
        this.setState({
            capture: false,
        });
    }

    _repeat(start: number) {
        const player = window.ppp;
        player.setVolume(0);
        player.seekTo(start - 0.1);
        player.playVideo();
        let prevTime = Math.round(player.getCurrentTime() * 1000);

        this._interval(Infinity, 10, 'i3', (i, clear) => {
            const currentTime = Math.round(player.getCurrentTime() * 1000);

            if (prevTime === 0) {
                prevTime = currentTime;

            } else if (currentTime !== prevTime) {
                clear();

                this._interval(10, 50, 'i3', i => {
                    player.setVolume(i * 10);
                });

                this._interval(Infinity, 50, 'i3', () => {
                    const time = player.getCurrentTime();
                    const track = this._getCurrentItem();

                    if (time >= track.time.end) {
                        this._clearI('i3');

                        this._interval(10, 50, 'i3', i => {
                            player.setVolume(100 - i * 10);
                        }, () => {
                            player.pauseVideo();

                            if (this.state.repeat) {
                                this._timeout(1000, 'i3', () => {
                                    if (this.state.repeat) {
                                        this._repeat(start);
                                    }
                                });
                            }
                        });
                    }
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
                if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
                    this._onRepeatChange();
                }
                break;
            case 27: // esc
                this._clearI('i3');
                this.setState({
                    selected: null,
                });
                break;
            case 192:
                const style = (document.getElementById('root'): any).style;
                style.display = style.display === 'none' ? 'block' : 'none';
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

    _getCurrentItem(): PartInfo {
        const { items, selected } = this.state;

        if (selected == null) {
            throw new Error('INVALID_INDEX');
        }

        return items[selected];
    }

    _onTimeStartChange(e: any) {
        const secs = timeMsToSeconds(e.target.value);

        if (secs) {
            const item = this._getCurrentItem();

            item.time.start = secs;
            this.forceUpdate();

        } else {
            this.setState({
                invalidStartTime: true,
            });
        }
    }

    _onTimeEndChange(e: any) {
        const secs = timeMsToSeconds(e.target.value);

        if (secs) {
            const item = this._getCurrentItem();
            item.time.end = secs;
            this.forceUpdate();
            this._saveItems();
        }
    }

    _onTitleChange(e: any) {
        const item = this._getCurrentItem();
        item.title = e.target.value;
        this.forceUpdate();
        this._saveItems();
    }

    _saveItems() {
        store.set('parts', this.state.items);
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

function nnn(val) {
    const v = val.toString();

    if (v.length === 1) {
        return '00' + v;
    } else if (v.length === 2) {
        return '0' + v;
    } else {
        return v;
    }
}

function toTimeMs(seconds) {
    const ms       = Math.round(seconds * 1000);
    const msString = nnn(ms % 1000);
    const sec      = Math.floor(seconds);

    return Math.floor(sec / 60) + ':' + nn(sec % 60) + '.' + msString;
}

function timeMsToSeconds(string: string): ?number {
    const match = string.match(/^(\d+):(\d\d?)(?:\.(\d{1,3}))?$/);

    if (match) {
        const msS = match[3];
        let ms = parseInt(msS, 10);

        if (msS.length === 1) {
            ms *= 100;
        }

        if (msS.length === 2) {
            ms *= 10;
        }

        return parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + ms / 1000;

    } else {
        return null;
    }
}
