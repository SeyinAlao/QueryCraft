import type { QueryGroup, QueryNode, QueryRule, ValidationResult, ValidationError } from '@/types/query'
import { getOperatorOption } from './operatorConfig'
import { SCHEMA_MAP } from '@/schemas'

export function validateQuery(root: QueryGroup, schemaId: string): ValidationResult {
  const errors: ValidationError[] = []
  validateNode(root, schemaId, errors, true)
  return { valid: errors.filter(e => e.severity === 'error').length === 0, errors }
}

function validateNode(node: QueryNode, schemaId: string, errors: ValidationError[], isRoot = false) {
  if (node.type === 'rule') {
    validateRule(node, schemaId, errors)
  } else {
    validateGroup(node, schemaId, errors, isRoot)
  }
}

function validateRule(rule: QueryRule, schemaId: string, errors: ValidationError[]) {
  const schema = SCHEMA_MAP[schemaId]
  const field = schema?.fields.find(f => f.key === rule.field)

  if (!field) {
    errors.push({ nodeId: rule.id, message: `Unknown field: "${rule.field}"`, severity: 'error' })
    return
  }

  const opOption = getOperatorOption(field.type, rule.operator)
  if (!opOption) {
    errors.push({ nodeId: rule.id, message: `Operator "${rule.operator}" is not valid for ${field.type} fields`, severity: 'error' })
    return
  }

  if (opOption.requiresValue && (rule.value === null || rule.value === '' || rule.value === undefined)) {
    errors.push({ nodeId: rule.id, message: `"${field.label}" requires a value`, severity: 'warning' })
  }

  if (opOption.requiresRange) {
    const range = rule.value as [number, number]
    if (!Array.isArray(range) || range.length !== 2) {
      errors.push({ nodeId: rule.id, message: 'Between operator requires a min and max value', severity: 'error' })
    } else if (range[0] > range[1]) {
      errors.push({ nodeId: rule.id, message: 'Min value must be less than max value', severity: 'error' })
    }
  }

  if (opOption.requiresArray) {
    const arr = rule.value as unknown[]
    if (!Array.isArray(arr) || arr.length === 0) {
      errors.push({ nodeId: rule.id, message: `"${field.label}" requires at least one value`, severity: 'warning' })
    }
  }
}

function validateGroup(group: QueryGroup, schemaId: string, errors: ValidationError[], isRoot: boolean) {
  if (group.children.length === 0 && !isRoot) {
    errors.push({ nodeId: group.id, message: 'Empty groups are not allowed', severity: 'error' })
    return
  }
  group.children.forEach(child => validateNode(child, schemaId, errors))
}
