import React, {PropTypes} from 'react';
// import assign from 'object-assign';
import classNames from 'classnames';

function noop() {
}

const MSelectList = React.createClass({
  propTypes: {
    children: PropTypes.any,
    className: PropTypes.string,
    dataKey: PropTypes.string,
    dataValue: PropTypes.string,
    prefixCls: PropTypes.string,
    data: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
  },
  getDefaultProps() {
    return {
      prefixCls: 'rmc-ls',
      dataKey: 'key',
      dataValue: 'value',
      onChange: noop,
    };
  },
  getInitialState() {
    return {
      value: this.props.value,
    };
  },
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
      });
    }
  },
  onQfSelect(e) {
    e.preventDefault();
  },
  onSelect(e) {
    e.preventDefault();
  },
  onChange(value) {
    console.log('onChange', value);
  },
  _initData(data) {
    data.sort(function(a, b) {
      return a.spell.localeCompare(b.spell);
    });
    const dataKey = this.props.dataKey;
    const transData = {};
    const cache = {};
    data.forEach((item, index) => {
      item.QF = item.QF || item.spell[0].toUpperCase();
      item.abbr = item.abbr || item.spell.replace(/[a-z]+/g, '');
      transData[item.QF] = transData[item.QF] || [];
      transData[item.QF].push(cache[ item[dataKey] + '_' + item.spell ] = item);
    });
    this.cache = cache;
    return transData;
  },
  renderData() {
    const data = this._initData(this.props.data);
    const current = this.props.value;
    const dataKey = this.props.dataKey;
    const dataValue = this.props.dataValue;
    let searchKey = '_J_qf_key_DQ';
    const qfHtml = [];
    const normalHtml = [];
    let keyIndex = 1;
    const getQfItem = (sk, QF) => {
      keyIndex++;
      return <li key={keyIndex}><a onClick={this.onQfSelect} data-qf-target={sk}>{QF}</a></li>;
    };
    const getSection = (sk, QF, d) => {
      return ([
        <div className={classNames(`${this.props.prefixCls}-item-order`, `key_${searchKey}`)}>{QF}</div>,
        <ul className={`${this.props.prefixCls}-item`}>
          {d.map((item, index) => {
            return (<li key={index}><a onClick={this.onSelect}
              data-key={item[dataKey]}
              data-spell={item.spell}>{item[dataValue]}</a></li>);
          })}
        </ul>
      ])
    };
    if (current && current[dataKey] && current[dataValue]) {
      qfHtml.push(getQfItem(searchKey, '当前'));
      normalHtml.push(getSection(searchKey, '当前地区', [current]));
    }
    Object.keys(data).forEach(key => {
      const QF = data[key][0].QF;
      searchKey = '_J_qf_key_' + QF;
      qfHtml.push(getQfItem(searchKey, QF));
      normalHtml.push(getSection(searchKey, QF, data[key]));
    });
    return {qfHtml, normalHtml};
  },
  render() {
    const {className, prefixCls} = this.props;
    const {qfHtml, normalHtml} = this.renderData();
    return (<div className={classNames(className, `${prefixCls}-playground`)}>
      <ul className={`${prefixCls}-quick-search-bar`}>
          <li><a onClick={this.onSelect} data-qf-target=".ls-search"><i className={`${prefixCls}-icon-search`}></i></a></li>
          {qfHtml}
      </ul>
      <div className={`${prefixCls}-body`}>
          <div className={`${prefixCls}-scroller`}>
              <div className={classNames(`${prefixCls}-search`, `${prefixCls}-input-autoclear`)}>
                  <div className={`${prefixCls}-search-input`}>
                      <input className={`${prefixCls}-search-value`} type="text" placeholder="搜索" value="" />
                      <div className={`${prefixCls}-search-clear`}
                        style={{width: 'auto'}}><i className={`${prefixCls}-icon-clear`}
                        style={{visibility: 'hidden'}}></i></div>
                  </div>
              </div>
              <div className={`${prefixCls}-content`}>{normalHtml}</div>
              <div className="ls-content ls-hide"></div>
              <div style={{height: 60}}>&nbsp;</div>
          </div>
      </div>
      <div className="ls-lighter ls-hide"></div>
      </div>);
  },
});
export default MSelectList;
