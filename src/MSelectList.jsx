import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import assign from 'object-assign';
import classNames from 'classnames';
import { EventManager, handleTapping, handleQuickBar } from './util';
import defaultLocale from './locale/zh_CN';

function noop() {
}

const MSelectList = React.createClass({
  propTypes: {
    children: PropTypes.any,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    placeholder: PropTypes.string,
    locale: PropTypes.object,
    dataKey: PropTypes.string,
    dataValue: PropTypes.string,
    showQuickSearchBar: PropTypes.bool,
    showInput: PropTypes.bool,
    data: PropTypes.array,
    inputValue: PropTypes.string,
    defaultInputValue: PropTypes.string,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    onInputChange: PropTypes.func,
    onChange: PropTypes.func,
    onQfSelect: PropTypes.func,
  },
  getDefaultProps() {
    return {
      prefixCls: 'rmc-select-list',
      placeholder: '搜索',
      locale: defaultLocale,
      dataKey: 'key',
      dataValue: 'value',
      showQuickSearchBar: true,
      showInput: false,
      onInputChange: noop,
      onChange: noop,
      onQfSelect: noop,
    };
  },
  getInitialState() {
    return {
      clickFeedBack: false,
      showSearch: false,
      showLighter: false,
      showQuickSearchBar: this.props.showQuickSearchBar,
      inputValue: this.props.inputValue || this.props.defaultInputValue || '',
      value: this.props.value || this.props.defaultValue,
    };
  },
  componentDidMount() {
    const { viewport, quickSearchBar } = this.refs;
    quickSearchBar.style['margin-top'] = `${-(quickSearchBar.offsetHeight / 2 + 20)}px`;

    const eventManager = new EventManager(viewport);
    handleTapping(eventManager, this);
    this.qfListEvent = handleQuickBar(this, ReactDOM.findDOMNode(this));
    this.viewportEvent = eventManager;
  },
  componentWillReceiveProps(nextProps) {
    if ('inputValue' in nextProps) {
      this.setState({
        inputValue: nextProps.inputValue,
      });
    }
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
      });
    }
  },
  componentWillUnmount() {
    this.qfListEvent.endEvent();
    this.viewportEvent.endEvent();
  },
  onQfSelect(selectedItem) {
    this.props.onQfSelect(selectedItem);
  },
  onChange(selectedItem) {
    this.props.onChange(selectedItem);
  },
  onInputChange(e) {
    this.setState({
      inputValue: e.target.value,
    });
    this.props.onInputChange(e.target.value, e);
  },
  onSearch() {
    this.setState({
      showQuickSearchBar: false,
      showSearch: true,
    });
  },
  onClear() {
    this.setState({
      inputValue: '',
      showQuickSearchBar: true,
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
    data.sort((a, b) => {
      return a.spell.localeCompare(b.spell);
    });
    const dataKey = this.props.dataKey;
    const transData = {};
    const cache = {};
    data.forEach((item) => {
      /* eslint no-param-reassign:0 */
      item.QF = item.QF || item.spell[0].toUpperCase();
      item.abbr = item.abbr || item.spell.replace(/[a-z]+/g, '');
      transData[item.QF] = transData[item.QF] || [];
      cache[`${item[dataKey]}_${item.spell}`] = item;
      transData[item.QF].push(item);
    });
    this.cache = cache;
    return transData;
  },
  renderCommonItem(data) {
    return data.map((item, index) => {
      return (<li key={index}>
        <a
          data-key={item[this.props.dataKey]}
          data-spell={item.spell}
        >{item[this.props.dataValue]}</a></li>);
    });
  },
  renderData() {
    const locale = this.props.locale;
    const data = this._initData([...this.props.data]);
    this.data = data;
    const current = this.state.value;
    let searchKey = '_J_qf_key_DQ';
    const qfHtml = [];
    const normalHtml = [];
    let keyIndex = 1;
    const getQfItem = (sk, QF) => {
      keyIndex++;
      return (<li key={keyIndex}>
        <a onClick={this.onQfSelect} data-qf-target={`.${sk}`}>{QF}</a>
      </li>);
    };
    const getSection = (sk, QF, d) => {
      return ([
        <div className={classNames(`${this.props.prefixCls}-item-order`, searchKey)}>{QF}</div>,
        <ul className={`${this.props.prefixCls}-item`}>
          {this.renderCommonItem(d)}
        </ul>,
      ]);
    };
    if (current && current[this.props.dataKey] && current[this.props.dataValue]) {
      qfHtml.push(getQfItem(searchKey, locale.currentQuickSearchText));
      normalHtml.push(getSection(searchKey, locale.currentRegion, [current]));
    }
    Object.keys(data).forEach(key => {
      const QF = data[key][0].QF;
      searchKey = `_J_qf_key_${QF}`;
      qfHtml.push(getQfItem(searchKey, QF));
      normalHtml.push(getSection(searchKey, QF, data[key]));
    });
    return {
      qfHtml,
      normalHtml,
    };
  },
  render() {
    const { className, prefixCls, placeholder, showInput } = this.props;
    const { qfHtml, normalHtml } = this.renderData();
    const quickSearchBarCls = {
      [`${prefixCls}-quick-search-bar`]: true,
      [`${prefixCls}-hide`]: !this.state.showQuickSearchBar,
      [`${prefixCls}-on`]: this.state.clickFeedBack,
    };
    const normalViewCls = {
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-hide`]: this.state.showSearch && !!this.state.inputValue.length,
    };
    const searchViewCls = {
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-hide`]: !this.state.showSearch && this.state.inputValue.length,
    };
    const lighterCls = {
      [`${prefixCls}-lighter`]: true,
      [`${prefixCls}-hide`]: !this.state.showLighter,
    };
    return (<div className={classNames(className, `${prefixCls}-playground`)}>
      <ul className={classNames(quickSearchBarCls)} ref="quickSearchBar">
        {showInput ? (<li>
          <a data-qf-target={`.${prefixCls}-search`}>
            <i className={`${prefixCls}-icon-search`}/>
          </a>
        </li>) : null}
        {qfHtml}
      </ul>
      <div className={`${prefixCls}-body`} ref="viewport">
        <div className={`${prefixCls}-scroller`} ref="container">
          <div className={classNames(`${prefixCls}-search`, `${prefixCls}-input-autoclear`)}
            style={{ display: showInput ? 'block' : 'none!important' }}
          >
            <form className={`${prefixCls}-search-input`}>
              <input
                className={`${prefixCls}-search-value`}
                type="text"
                placeholder={placeholder}
                data-cid="sinput" ref="sinput"
                value={this.state.inputValue}
                onChange={this.onInputChange}
              />
              <div
                className={`${prefixCls}-search-clear`}
                data-cid="clear"
                style={{ width: 'auto' }}
              >
                <i
                  className={`${prefixCls}-icon-clear`}
                  style={{ visibility: this.state.showSearch ? 'visible' : 'hidden' }}
                />
              </div>
            </form>
          </div>
          <div className={classNames(normalViewCls)} ref="normalView">{normalHtml}</div>
          <div className={classNames(searchViewCls)} ref="searchView">
            <ul className={`${prefixCls}-item`}>
              {this.renderCommonItem(this.getMatchData(this.state.inputValue))}
            </ul>
          </div>
        </div>
      </div>
      <div className={classNames(lighterCls)} ref="lighter"></div>
    </div>);
  },
});
export default MSelectList;
