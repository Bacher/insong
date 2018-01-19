// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import Item from '../item';
import List from '../list';

export type ItemData = {|
    id: number,
    videoId: string,
    parts: Array<Part>,
|}

export type Part = {|
    title: string,
    time: {|
        start: number,
        end: number,
    |},
|}

type Props = {|
|}

type RouteInfo = {|
    route: string,
    params: any,
|}

export default class App extends Component<Props, RouteInfo> {

    constructor(props: Props) {
        super(props);

        this.state = this._parseRoute();

        _.bindAll(this, [
            '_onHashChange',
        ]);
    }

    componentDidMount() {
        window.addEventListener('hashchange', this._onHashChange);
    }

    render() {
        const { route, params } = this.state;

        let body;

        if (route === 'item') {
            body = (
                <Item key={params.id} params={params} />
            );
        } else if (route === 'index') {
            body = (
                <List params={params} />
            );
        } else {
            body = (
                <div className="b-app">
                    Bad route
                </div>
            );
        }

        return (
            <div className="b-app">
                {body}
            </div>
        );
    }

    _parseRoute(): RouteInfo {
        const hash = window.location.hash;

        if (!hash || hash === '#') {
            return {
                route:  'index',
                params: {},
            };
        }

        const itemMatch = hash.match(/^#(\d+)$/);

        if (itemMatch) {
            return {
                route: 'item',
                params: {
                    id: parseInt(itemMatch[1], 10),
                },
            }
        }

        return {
            route: 'invalid',
            params: {},
        };
    }

    _onHashChange() {
        this.setState(this._parseRoute());
    }

}
