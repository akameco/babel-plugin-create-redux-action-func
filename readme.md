# babel-plugin-create-redux-action-func [![Build Status](https://travis-ci.org/akameco/babel-plugin-create-redux-action-func.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-create-redux-action-func)

> create redux action creater from action type

Auto Generate redux actionCreater from flowtype.


## Install

### npm
```
$ npm install --save-dev babel-plugin-create-redux-action-func
```

### yarn
```
$ yarn add --dev babel-plugin-create-redux-action-func
```

## Example

In:

```js
type ADD_HOGE_TYPE = 'hoge/ADD_HOGE'
type DELETE_HOGE_TYPE = 'hoge/DELETE_HOGE'
type Action = { +type: ADD_HOGE_TYPE } | { +type: DELETE_HOGE_TYPE, +id: number }
```

Out:

```js
import type { Action } from './actionTypes';
import { ADD_HOGE, DELETE_HOGE } from './constants';

export function addHoge(): Action {
  return {
    type: ADD_HOGE
  };
}

export function deleteHoge(id: number): Action {
  return {
    type: DELETE_HOGE,
    id
  };
}
```

## Usage

```json
{
  "plugins": [
    "create-redux-action-func"
  ]
}
```

## License

MIT © [akameco](http://akameco.github.io)
