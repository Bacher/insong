// @flow

import _ from 'lodash';
import cn from 'classnames';
import React, { Component } from 'react';

type Props = {|
    selected: ?number,
    items: Array<{|
        start: number,
        end: number,
    |}>,
    time: number,
    duration: number,
    onHover: Function,
    onClick: Function,
|}

type State = {|
|}

export default class App extends Component<Props, State> {

    _hover: ?number;

    constructor(props: any) {
        super(props);

        this._hover = null;

        _.bindAll(this, [
        ]);
    }

    render() {
        const { selected, time, items, duration } = this.props;

        const container = [];
        let key = 0;

        if (duration) {
            for (let i = 0; i < items.length; i++) {
                const range = items[i];
                const l = range.start * 100 / duration;
                const w = range.end * 100 / duration - l;

                const part = (
                    <div key={++key} className={cn('b-timeline__part', {
                        'b-timeline__part_active': i === selected,
                    })} style={{
                        left:  `${l}%`,
                        width: `${w}%`,
                    }}
                         onMouseEnter={() => this._onMouseEnter(i)}
                         onMouseLeave={() => this._onMouseLeave(i)}
                         onClick={() => this._onClick(i)}
                    >
                        {i === selected ?
                            <div className="b-timeline__handler b-timeline__handler_left" />
                            : null
                        }
                        {i === selected ?
                            <div className="b-timeline__handler b-timeline__handler_right" />
                            : null
                        }
                    </div>
                );

                container.push(part);

                if (i === selected) {
                    container.push(

                    );
                }
            }
        }

        return (
            <div className="b-timeline">
                <div className="b-timeline__body" />
                {container}
                <div className="b-timeline__position" style={{ left: `${duration ? time * 100 / duration : 0}%` }} />
                <div className="b-timeline__times">
                    {!duration ? null : _.times(Math.floor(duration / 60) + 1, i => (
                        <div
                            key={i}
                            className="b-timeline__time"
                            style={{ left: `${i * 60 * 100 / duration}%` }}>
                            {i}:00
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    _onMouseEnter(i: number) {
        this._hover = i;
        this.props.onHover(i);
    }

    _onMouseLeave(i: number) {
        if (this._hover === i) {
            this._hover = null;
            this.props.onHover(null);
        }
    }

    _onClick(i: number) {
        this.props.onClick(i);
    }

}
