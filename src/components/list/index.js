
// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import store from '../../storage';

type Props = {|
    params: {|
        id: number,
    |},
|}

type State = {|
|}

export default class List extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            items: store.get('items') || [],
        };

        _.bindAll(this, [
            '_onAddClick',
        ]);
    }

    render() {
        const { items } = this.state;

        return (
            <div className="b-list">
                <div>Records list:</div>
                {items.length ?
                    <ul>
                        {items.map(item => (
                            <li className="b-list__item">
                                <a href={`#${item.id}`}>
                                    {item.id}
                                </a>
                            </li>
                        ))}
                    </ul>
                    :
                    'Пусто'
                }
                <div className="b-list__footer">
                    <input ref="input" placeholder="Enter youtube URL"/>
                    <button type="button" onClick={this._onAddClick}>Add</button>
                </div>
            </div>
        );
    }

    _onAddClick() {
        const url = this.refs.input.value;

        alert(url);
    }

}
