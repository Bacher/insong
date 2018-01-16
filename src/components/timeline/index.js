// @flow

import React, { Component } from 'react';
import _ from 'lodash';

type Props = {|
    range: ?{|
        start: number,
        end: number,
    |},
    duration: number,
|}

type State = {|
|}

export default class App extends Component<Props, State> {

    constructor(props: any) {
        super(props);

        this.state = {
        };

        _.bindAll(this, [
        ]);
    }

    render() {
        const { range, duration } = this.props;

        let inner = null;

        if (range) {
            const l = range.start * 100 / duration;
            const w = range.end * 100 / duration - l;

            inner = [
                <div key="1" className="b-timeline__part" style={{
                    left:  `${l}%`,
                    width: `${w}%`,
                }} />,
                <div key="2" className="b-timeline__handler" style={{ left: `${l}%` }} />,
                <div key="3" className="b-timeline__handler" style={{ left: `${l + w}%` }} />,
            ];
        }

        return (
            <div className="b-timeline">
                <div className="b-timeline__body" />
                {inner}
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

}
