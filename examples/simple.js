// use jsx to render html, do not modify simple.html

import 'rmc-select-list/assets/index.less';
import './demo.less';
import MSelectList from 'rmc-select-list';
import React from 'react';
import ReactDOM from 'react-dom';
import { province } from './data';
import enUS from 'rmc-select-list/src/locale/en_US';

const Demo = React.createClass({
  getInitialState() {
    return {
      selectedItem: province[0],
      value: 'b',
    };
  },
  onChange(value) {
    console.log('onChange', value);
    this.setState({
      value,
    });
  },
  onSelect(selectedItem) {
    console.log('onSelect', selectedItem);
    this.setState({
      selectedItem,
    });
  },
  render() {
    return (<div>
      <h3>simple demo</h3>
      <p style={{ marginTop: '30' }}>选择的城市是：{this.state.selectedItem.value}</p>
      <MSelectList
        className="wrapper"
        data={province}
        locale={enUS}
        selectedItem={this.state.selectedItem}
        defaultValue={this.state.value}
        onChange={this.onChange}
        onSelect={this.onSelect}
      />
     </div>);
  },
});

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
