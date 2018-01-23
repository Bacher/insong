// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import store from '../../storage';

import type { ItemData } from '../app';

type Props = {|
    params: {|
        id: number,
    |},
|}

type State = {|
    items: Array<ItemData>,
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
                            <li key={item.id} className="b-list__item">
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

        // https://www.youtube.com/watch?v=bCDIt50hRDs

        const match = url.match(/^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([^\/]+)$/);

        const { items } = this.state;

        if (!match) {
            alert('Invalid url');
        }

        const newId = items.length ? items[items.length - 1].id + 1 : 1;

        items.push({
            id:      newId,
            videoId: match[1],
            parts:   [],
        });

        store.set('items', items);

        window.location.hash = `#${newId}`;
    }

}
