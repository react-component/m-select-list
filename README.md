# rmc-select-list
---

React Mobile SelectList Component


[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/rmc-select-list.svg?style=flat-square
[npm-url]: http://npmjs.org/package/rmc-select-list
[travis-image]: https://img.shields.io/travis/react-component/m-select-list.svg?style=flat-square
[travis-url]: https://travis-ci.org/react-component/m-select-list
[coveralls-image]: https://img.shields.io/coveralls/react-component/m-select-list.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/react-component/m-select-list?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/react-component/m-select-list.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/react-component/m-select-list
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/rmc-select-list.svg?style=flat-square
[download-url]: https://npmjs.org/package/rmc-select-list


## Screenshots

<img src="https://os.alipayobjects.com/rmsportal/keVOoENeYgcDGRj.png" width="288"/>


## Development

```
npm install
npm start
```

## Example

http://localhost:8000/examples/

online example: http://react-component.github.io/m-select-list/

## install

[![rmc-select-list](https://nodei.co/npm/rmc-select-list.png)](https://npmjs.org/package/rmc-select-list)

## Usage

see example

## API

### props

| name     | description    | type     | default      |
|----------|----------------|----------|--------------|
|className | additional css class of root dom node | String | '' |
|prefixCls | prefix class | String | 'rmc-ls' |
|placeholder | input placeholder | String | '搜索' |
|showQuickSearchBar | whether show quick search bar | bool | true |
|locale | the locale of area | Object | import from 'rmc-select-list/lib/locale/zh_CN' |
|data | The data of list | array  | - |
|value | current selectedItem | Object{key, value, spell}  | - |
|defaultValue | default current selectedItem | Object{key, value, spell}  | - |
|onChange | select item | Function(value{key, value, spell}) | - |

## Test Case

```
npm test
npm run chrome-test
```

## Coverage

```
npm run coverage
```

open coverage/ dir

## License

rmc-select-list is released under the MIT license.
