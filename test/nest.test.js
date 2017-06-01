// @flow
import transformCode from './transform'

test('nest union type', () => {
  const input = `
    type HOGE_TYPE = 'hoge/HOGE_ACTION'
    type FOO_TYPE = 'hoge/FOO_ACTION'
    type Action = { +type: HOGE_TYPE | FOO_TYPE }
  `
  expect(transformCode(input)).toMatchSnapshot()
})

test('nest union type with args', () => {
  const input = `
    type HOGE_TYPE = 'hoge/HOGE_ACTION'
    type FOO_TYPE = 'hoge/FOO_ACTION'
    type FOO_FUGA_TYPE = 'hoge/FOO_ACTION'
    type Action =
      | { +type: HOGE_TYPE | FOO_TYPE }
      | { +type: FOO_FUGA_TYPE, id: number }
  `
  expect(transformCode(input)).toMatchSnapshot()
})

test('another type import', () => {
  const input = `
import type { ID, Text } from './types'

type FOO_TYPE = 'hoge/FOO_ACTION'
type FOO_ID_TYPE = 'hoge/FOO_ID_ACTION'

type Action =
  | { +type: FOO_TYPE }
  | { +type: FOO_ID_TYPE, id: ID, text: Text }
`
  expect(transformCode(input)).toMatchSnapshot()
})
