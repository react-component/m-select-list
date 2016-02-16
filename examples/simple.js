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
      value: '12',
    };
  },
  onChange(value) {
    console.log(value);
    this.setState({
      value,
    });
  },
  render() {
    let label = '';
    province.forEach(item => {
      if (item.value === this.state.value) {
        label = item.label;
      }
    });
    return (<div>
      <h3>simple demo</h3>
      <p style={{ marginTop: '30' }}>选择的城市是：{label}</p>
      <MSelectList
        className="wrapper"
        data={province}
        locale={enUS}
        value={this.state.value}
        onChange={this.onChange}
      />
     </div>);
  },
});

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
