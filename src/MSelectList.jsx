import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
// import assign from 'object-assign';
import classNames from 'classnames';
import {EventManager, handleTapping, handleScrolling, handleQuickBar} from './util';

function noop() {
}

const MSelectList = React.createClass({
  propTypes: {
    children: PropTypes.any,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    placeholder: PropTypes.string,
    dataKey: PropTypes.string,
    dataValue: PropTypes.string,
    showQfList: PropTypes.bool,
    data: PropTypes.array,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    selectedItem: PropTypes.object,
    defaultSelectedItem: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
  },
  getDefaultProps() {
    return {
      prefixCls: 'rmc-ls',
      clickFeedBackCls: 'rmc-ls-on',
      placeholder: '搜索',
      dataKey: 'key',
      dataValue: 'value',
      showQfList: true,
      onChange: noop,
      onSelect: noop,
    };
  },
  getInitialState() {
    return {
      showSearch: false,
      showLighter: false,
      showQfList: this.props.showQfList,
      value: this.props.value || this.props.defaultValue || '',
      selectedItem: this.props.selectedItem || this.props.defaultSelectedItem,
    };
  },
  componentDidMount() {
    const {viewport, qfList} = this.refs;
    qfList.style['margin-top'] = -(qfList.offsetHeight / 2 + 20) + 'px';

    const eventManager = new EventManager(viewport);
    handleTapping(eventManager, this);
    handleScrolling(eventManager, this);
    handleQuickBar(this, ReactDOM.findDOMNode(this));
  },
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
      });
    }
    if ('selectedItem' in nextProps) {
      this.setState({
        selectedItem: nextProps.selectedItem,
      });
    }
  },
  componentWillUnmount() {
    const {viewport} = this.refs;
    console.log(viewport);
  },
  onQfSelect(e) {
    e.preventDefault();
  },
  onSelect(e) {
    e.preventDefault();
  },
  onChange(e) {
    this.setState({
      value: e.target.value,
    });
  },
  onSearch() {
    this.setState({
      showQfList: false,
      showSearch: true,
    });
  },
  onClear() {
    this.setState({
      value: '',
      showQfList: true,
      showSearch: false,
    }, () => {
      this.refs.sinput.blur();
    });
  },
  getMatchData(v) {
    const data = this.data;
    const found = [];
    const val = v.trim().toLowerCase();
    Object.keys(data).forEach(key => {
      data[key].forEach(d => {
        if (d[this.props.dataValue].indexOf(val) > -1 ||
          d[this.props.dataKey].indexOf(val) > -1 ||
          d.spell.toLowerCase().indexOf(val) > -1 ||
          d.abbr.toLowerCase().indexOf(val) > -1) {
          found.push(d);
        }
      });
    });
    return found;
  },
  _initData(data) {
    data.sort(function(a, b) {
      return a.spell.localeCompare(b.spell);
    });
    const dataKey = this.props.dataKey;
    const transData = {};
    const cache = {};
    data.forEach((item) => {
      item.QF = item.QF || item.spell[0].toUpperCase();
      item.abbr = item.abbr || item.spell.replace(/[a-z]+/g, '');
      transData[item.QF] = transData[item.QF] || [];
      transData[item.QF].push(cache[item[dataKey] + '_' + item.spell] = item);
    });
    this.cache = cache;
    return transData;
  },
  renderCommonItem(data) {
    return data.map((item, index) => {
      return (<li key={index}><a onClick={this.onSelect}
        data-key={item[this.props.dataKey]}
        data-spell={item.spell}>{item[this.props.dataValue]}</a></li>);
    });
  },
  renderData() {
    const data = this._initData([...this.props.data]);
    this.data = data;
    const current = this.props.selectedItem;
    let searchKey = '_J_qf_key_DQ';
    const qfHtml = [];
    const normalHtml = [];
    let keyIndex = 1;
    const getQfItem = (sk, QF) => {
      keyIndex++;
      return <li key={keyIndex}><a onClick={this.onQfSelect} data-qf-target={'.' + sk}>{QF}</a></li>;
    };
    const getSection = (sk, QF, d) => {
      return ([
        <div className={classNames(`${this.props.prefixCls}-item-order`, `key_${searchKey}`)}>{QF}</div>,
        <ul className={`${this.props.prefixCls}-item`}>
          {this.renderCommonItem(d)}
        </ul>,
      ]);
    };
    if (current && current[this.props.dataKey] && current[this.props.dataValue]) {
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
    const {className, prefixCls, placeholder} = this.props;
    const {qfHtml, normalHtml} = this.renderData();
    const inputProps = {
      value: this.state.value,
      onChange: this.onChange,
    };
    const qfListCls = {
      [`${prefixCls}-quick-search-bar`]: true,
      [`${prefixCls}-hide`]: !this.state.showQfList,
    };
    const normalViewCls = {
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-hide`]: this.state.showSearch,
    };
    const searchViewCls = {
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-hide`]: !this.state.showSearch,
    };
    const lighterCls = {
      [`${prefixCls}-lighter`]: true,
      [`${prefixCls}-hide`]: !this.state.showLighter,
    };
    return (<div className={classNames(className, `${prefixCls}-playground`)}>
      <ul className={classNames(qfListCls)} ref="qfList">
          <li><a onClick={this.onSelect} data-qf-target=".ls-search"><i className={`${prefixCls}-icon-search`}></i></a></li>
          {qfHtml}
      </ul>
      <div className={`${prefixCls}-body`} ref="viewport">
        <div className={`${prefixCls}-scroller`} ref="container">
          <div className={classNames(`${prefixCls}-search`, `${prefixCls}-input-autoclear`)}>
              <div className={`${prefixCls}-search-input`}>
                  <input className={`${prefixCls}-search-value`}
                    type="text" placeholder={placeholder}
                    data-cid="sinput" ref="sinput" {...inputProps} />
                  <div className={`${prefixCls}-search-clear`}
                    data-cid="clear"
                    style={{width: 'auto'}}><i className={`${prefixCls}-icon-clear`}
                    style={{visibility: this.state.showSearch ? 'visible' : 'hidden'}}></i></div>
              </div>
          </div>
          <div className={classNames(normalViewCls)}>{normalHtml}</div>
          <div className={classNames(searchViewCls)}>
            <ul className={`${prefixCls}-item`}>
              {this.renderCommonItem(this.getMatchData(this.state.value))}
            </ul>
          </div>
        </div>
      </div>
      <div className={classNames(lighterCls)} ref="lighter"></div>
    </div>);
  },
});
export default MSelectList;
