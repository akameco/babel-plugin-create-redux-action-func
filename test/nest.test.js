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
