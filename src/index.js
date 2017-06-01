// @flow
import * as t from 'babel-types'
import template from 'babel-template'
import syntaxFlow from 'babel-plugin-syntax-flow'
import camelCase from 'camelcase'

const CREATE_REDUX_ACTION_TYPE = Symbol('CREATE_REDUX_ACTION_TYPE')
const IMPORT_TYPES = Symbol('IMPORT_TYPE')
const ACTION = 'Action'

/* ::
type FileMap = Map<string, string>
*/

const buildActionCreater = template(
  `
  export function FUNC_NAME(PARAMS): Action {
    return RETURN_VALUE
  }
`,
  { sourceType: 'module', plugins: ['flow'] }
)

function trimType(target /* : string */) {
  if (target.endsWith('_TYPE')) {
    return target.replace(/_TYPE$/, '')
  }
  return target
}

function removeFlowComments(comments /* : Array<Object> */) {
  const FLOW_DIRECTIVE = '@flow'
  for (const comment of comments) {
    if (comment.value.indexOf(FLOW_DIRECTIVE) >= 0) {
      comment.value = comment.value.replace(FLOW_DIRECTIVE, '')
      if (!comment.value.replace(/\*/g, '').trim()) {
        comment.ignore = true
      }
    }
  }
}

function generateFunction(
  path,
  state /* : Object */,
  actionType /* : BabelNodeObjectTypeAnnotation */
) {
  if (!t.isObjectTypeAnnotation(actionType)) {
    return
  }

  const funcNames = new Set()
  const objProps = []
  const params = []

  for (const { key, value } of actionType.properties) {
    if (key.name === 'type') {
      if (t.isStringLiteralTypeAnnotation(value)) {
        // { type: 'A' }
        funcNames.add(value.value)
      } else if (t.isGenericTypeAnnotation(value)) {
        // { type: A }
        funcNames.add(trimType(value.id.name))
      } else if (t.isUnionTypeAnnotation(value)) {
        // { type: 'A' | 'B' }
        for (const x of value.types) {
          funcNames.add(trimType(x.id.name))
        }
      }
    } else {
      const param = t.identifier(key.name)
      param.typeAnnotation = t.typeAnnotation(value)
      params.push(param)
      objProps.push(t.objectProperty(param, param, false, true))
    }

    if (funcNames.size === 0) {
      return
    }

    for (const funcName of funcNames) {
      const func = buildActionCreater({
        FUNC_NAME: t.identifier(camelCase(funcName)),
        RETURN_VALUE: t.objectExpression([
          t.objectProperty(t.identifier('type'), t.identifier(funcName)),
          ...objProps,
        ]),
        PARAMS: params,
      })

      const map /* :FileMap */ = state.file.get(CREATE_REDUX_ACTION_TYPE)
      map.set(funcName, func)
    }
  }
}

function generateFunctions(path, state) {
  const { node: { id, right } } = path
  if (id.name !== ACTION) {
    return
  }

  if (t.isObjectTypeAnnotation(right)) {
    // {type: A}
    generateFunction(path, state, right)
  } else if (t.isUnionTypeAnnotation(right)) {
    // {type: A} | {type B}
    for (const actionType of right.types) {
      generateFunction(path, state, actionType)
    }
  }
}

// import { A, B, C } from './constants'
function createImports({ file, opts }) {
  const map /* :FileMap */ = file.get(CREATE_REDUX_ACTION_TYPE)
  const specifiers = []
  for (const action of map.keys()) {
    const i = t.identifier(action)
    specifiers.push(t.importSpecifier(i, i))
  }

  const constantsFile = opts.constantsFile || 'constants'
  return t.importDeclaration(specifiers, t.stringLiteral(`./${constantsFile}`))
}

// import tyep { Action } from './actionTypes'
function createActionTypeImport({ file, opts }) {
  const actionSpecifiers = [
    t.importSpecifier(t.identifier(ACTION), t.identifier(ACTION)),
  ]

  const filename = opts.filename || file.opts.filename !== 'unknown'
    ? file.opts.filename
    : 'actionTypes'
  const importAction = t.importDeclaration(
    actionSpecifiers,
    t.stringLiteral(`./${filename}`)
  )
  // $FlowFixMe
  importAction.importKind = 'type'

  // $FlowFixMe
  importAction.leadingComments = [{ type: 'CommentLine', value: ' @flow' }]

  return importAction
}

export default () => {
  return {
    inherits: syntaxFlow,
    pre(file /* : Object */) {
      if (!file.get(CREATE_REDUX_ACTION_TYPE)) {
        file.set(CREATE_REDUX_ACTION_TYPE, new Map())
        file.set(IMPORT_TYPES, new Set())
      }
    },
    visitor: {
      Program: {
        exit({ node } /* : Object */, state /* : Object */) {
          removeFlowComments(state.file.ast.comments)

          node.body = [
            createActionTypeImport(state),
            createImports(state),
            ...Array.from(state.file.get(IMPORT_TYPES).values()),
            t.noop(),
            ...Array.from(state.file.get(CREATE_REDUX_ACTION_TYPE).values()),
          ]
        },
      },
      TypeAlias(path /* : Object */, state /* : Object */) {
        generateFunctions(path, state)
      },
      ImportDeclaration(path /* : Object */, { file } /* : Object */) {
        if (path.node.importKind === 'type') {
          const imports /* :Set<*> */ = file.get(IMPORT_TYPES)
          imports.add(path.node)
        }
      },
    },
  }
}
