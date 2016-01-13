// use jsx to render html, do not modify simple.html

import 'rmc-select-list/assets/index.less';
import 'rmc-select-list/assets/demo.less';
import MSelectList from 'rmc-select-list';
import React from 'react';
import ReactDOM from 'react-dom';
import {province} from './data';

const Demo = React.createClass({
  getInitialState() {
    return {
      value: province[0],
    };
  },
  onChange(value) {
    console.log('onChange', value);
  },
  render() {
    return <MSelectList className="wrapper" data={province} value={this.state.value} onChange={this.onChange} />;
  },
});

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
