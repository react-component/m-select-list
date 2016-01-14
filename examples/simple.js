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
      selectedItem: province[0],
      value: '',
    };
  },
  onChange(value) {
    console.log('onChange', value);
  },
  onSelect(selectedItem) {
    console.log('onSelect', selectedItem);
  },
  render() {
    return (<MSelectList className="wrapper"
      data={province}
      selectedItem={this.state.selectedItem}
      defaultValue="b"
      onChange={this.onChange}
      onSelect={this.onSelect}
       />);
  },
});

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
