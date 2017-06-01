// @flow
import transformCode from './transform'

test('basic', () => {
  const input = `
    type HOGE_TYPE = 'hoge/HOGE_ACTION'
    type Action = { +type: HOGE_TYPE }
  `
  expect(transformCode(input)).toMatchSnapshot()
})

test('with args', () => {
  const input = `
    type HOGE_TYPE = 'hoge/HOGE_ACTION'
    type Action = { +type: HOGE_TYPE, id: number }
  `
  expect(transformCode(input)).toMatchSnapshot()
})

test('two func with args', () => {
  const input = `
    type HOGE_TYPE = 'hoge/HOGE_ACTION'
    type HOGE_FOO_TYPE = 'hoge/FOO_ACTION'
    type Action = { +type: HOGE_TYPE, +id: number } | { +type: HOGE_FOO_TYPE }
  `
  expect(transformCode(input)).toMatchSnapshot()
})
