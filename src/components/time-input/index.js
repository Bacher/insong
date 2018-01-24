// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames'
import { toTime, toTimeMs, timeMsToSeconds } from '../../utils/time';

type Props = {|
    value: number,
    onChange: Function,
|}

type State = {|
    value: number,
    isValid: boolean,
    inputValue: string,
|}

export default class TimeInput extends Component<Props, State> {

    constructor(props: any) {
        super(props);

        this.state = {
            value:      props.value,
            isValid:    true,
            inputValue: toTimeMs(props.value),
        };

        _.bindAll(this, [
            '_onChange',
        ]);
    }

    componentWillReceiveProps(props: Props) {
        if (this.state.value === props.value && this.state.isValid) {
            return;
        }

        if (this.state.value !== props.value) {
            this.setState({
                value: props.value,
            });
        }

        if (Math.abs(timeMsToSeconds(this.state.inputValue) - props.value) > 0.005) {
            this.setState({
                inputValue: toTimeMs(props.value),
                isValid:    true,
            });
        }
    }

    render() {
        const { inputValue, isValid } = this.state;

        return (
            <input className={cn('b-time-input', {
                'b-time-input_invalid': !isValid,
            })} value={inputValue} onChange={this._onChange} />
        );
    }

    _onChange(e: any) {
        const inputValue = e.target.value;
        const secs       = timeMsToSeconds(inputValue);

        const newState: Object = {
            inputValue,
            isValid: secs != null,
        };

        if (newState.isValid) {
            newState.value = secs;
        }

        this.setState(newState, () => {
            if (newState.isValid) {
                this.props.onChange(secs);
            }
        });
    }

}

