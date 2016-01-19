const expect = require('expect.js');
const React = require('react');
const ReactDOM = require('react-dom');
// const TestUtils = require('react-addons-test-utils');
// const Simulate = TestUtils.Simulate;
const $ = require('jquery');
const MSelectList = require('../');
import '../assets/demo.less';
import {province} from '../examples/data';

describe('simple', () => {
  let instance;
  let div;
  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  });

  it('should add css class of root dom node', () => {
    instance = ReactDOM.render(
      <MSelectList className="wrapper"
        data={province}
       />,
    div);
    expect(ReactDOM.findDOMNode(instance).className.indexOf('wrapper') !== -1).to.be(true);
  });

  it('should filter specific item', () => {
    instance = ReactDOM.render(
      <MSelectList
        data={province}
        defaultValue="bj"
       />,
    div);
    expect($(instance.refs.searchView).text()).to.be('北京市');
  });
});
