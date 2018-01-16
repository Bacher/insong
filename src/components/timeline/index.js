// @flow

import React, { Component } from 'react';
import _ from 'lodash';

type Props = {|
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
        return (
            <div className="b-timeline">TIMELINE</div>
        );
    }

}
