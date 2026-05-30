// ─────────────────────────────────────────────────────────────────────────────
// Query Generator Engine
// Converts the recursive QueryNode tree into SQL, MongoDB, and GraphQL strings.
// All three generators share the same recursive traversal pattern.
// ─────────────────────────────────────────────────────────────────────────────

import type { QueryGroup, QueryNode, QueryRule } from '@/types/query'
import { SCHEMA_MAP } from '@/schemas'

// ── SQL Generator ─────────────────────────────────────────────────────────────

function ruleToSQL(rule: QueryRule, schemaId: string): string {
  const field = SCHEMA_MAP[schemaId]?.fields.find(f => f.key === rule.field)
  const label = field?.label ?? rule.field
  const val = rule.value

  switch (rule.operator) {
    case 'equals':      return `${label} = ${formatSQLValue(val, field?.type)}`
    case 'not_equals':  return `${label} != ${formatSQLValue(val, field?.type)}`
    case 'contains':    return `${label} LIKE '%${val}%'`
    case 'not_contains':return `${label} NOT LIKE '%${val}%'`
    case 'starts_with': return `${label} LIKE '${val}%'`
    case 'ends_with':   return `${label} LIKE '%${val}'`
    case 'gt':          return `${label} > ${val}`
    case 'gte':         return `${label} >= ${val}`
    case 'lt':          return `${label} < ${val}`
    case 'lte':         return `${label} <= ${val}`
    case 'between': {
      const [a, b] = val as [number, number]
      return `${label} BETWEEN ${a} AND ${b}`
    }
    case 'in': {
      const items = (val as string[]).map(v => formatSQLValue(v, field?.type)).join(', ')
      return `${label} IN (${items})`
    }
    case 'not_in': {
      const items = (val as string[]).map(v => formatSQLValue(v, field?.type)).join(', ')
      return `${label} NOT IN (${items})`
    }
    case 'is_null':     return `${label} IS NULL`
    case 'is_not_null': return `${label} IS NOT NULL`
    case 'regex':       return `${label} REGEXP '${val}'`
    default:            return `${label} = ${formatSQLValue(val, field?.type)}`
  }
}

function formatSQLValue(val: unknown, type?: string): string {
  if (val === null || val === undefined || val === '') return 'NULL'
  if (type === 'number') return String(val)
  if (type === 'boolean') return String(val).toUpperCase()
  return `'${val}'`
}

function groupToSQL(group: QueryGroup, schemaId: string, indent = 2): string {
  const joiner = `\n${' '.repeat(indent)}${group.logic} `
  const parts = group.children.map(child => nodeToSQL(child, schemaId, indent + 2))
  if (parts.length === 1) return parts[0]
  return `(\n${' '.repeat(indent)}${parts.join(joiner)}\n${' '.repeat(indent - 2)})`
}

function nodeToSQL(node: QueryNode, schemaId: string, indent: number): string {
  if (node.type === 'rule') return ruleToSQL(node, schemaId)
  return groupToSQL(node, schemaId, indent)
}

export function generateSQL(root: QueryGroup, schemaId: string): string {
  const tableName = schemaId.toUpperCase()
  const parts = root.children.map(child => nodeToSQL(child, schemaId, 4))
  const joiner = `\n  ${root.logic} `
  const where = parts.length > 0
    ? `WHERE\n  ${parts.join(joiner)}`
    : ''
  return `SELECT *\nFROM ${tableName}\n${where};`
}

// ── MongoDB Generator ─────────────────────────────────────────────────────────

function ruleToMongo(rule: QueryRule): Record<string, unknown> {
  const field = rule.field
  const val = rule.value

  switch (rule.operator) {
    case 'equals':      return { [field]: val }
    case 'not_equals':  return { [field]: { $ne: val } }
    case 'contains':    return { [field]: { $regex: val, $options: 'i' } }
    case 'not_contains':return { [field]: { $not: { $regex: val } } }
    case 'starts_with': return { [field]: { $regex: `^${val}` } }
    case 'ends_with':   return { [field]: { $regex: `${val}$` } }
    case 'gt':          return { [field]: { $gt: val } }
    case 'gte':         return { [field]: { $gte: val } }
    case 'lt':          return { [field]: { $lt: val } }
    case 'lte':         return { [field]: { $lte: val } }
    case 'between': {
      const [a, b] = val as [number, number]
      return { [field]: { $gte: a, $lte: b } }
    }
    case 'in':      return { [field]: { $in: val } }
    case 'not_in':  return { [field]: { $nin: val } }
    case 'is_null':     return { [field]: null }
    case 'is_not_null': return { [field]: { $ne: null } }
    case 'regex':   return { [field]: { $regex: val } }
    default:        return { [field]: val }
  }
}

function groupToMongo(group: QueryGroup): Record<string, unknown> {
  const op = group.logic === 'AND' ? '$and' : '$or'
  return { [op]: group.children.map(nodeToMongo) }
}

function nodeToMongo(node: QueryNode): Record<string, unknown> {
  if (node.type === 'rule') return ruleToMongo(node)
  return groupToMongo(node)
}

export function generateMongoDB(root: QueryGroup): string {
  const result = root.children.length === 1
    ? nodeToMongo(root.children[0])
    : groupToMongo(root)
  return `db.collection.find(${JSON.stringify(result, null, 2)})`
}

// ── GraphQL Generator ─────────────────────────────────────────────────────────

function ruleToGraphQL(rule: QueryRule, schemaId: string, indent: number): string {
  const field = SCHEMA_MAP[schemaId]?.fields.find(f => f.key === rule.field)
  const label = field?.label?.replace(/\s+/g, '_').toLowerCase() ?? rule.field
  const pad = ' '.repeat(indent)
  const val = rule.value

  switch (rule.operator) {
    case 'equals':      return `${pad}${label}: { eq: ${formatGQLValue(val)} }`
    case 'not_equals':  return `${pad}${label}: { neq: ${formatGQLValue(val)} }`
    case 'contains':    return `${pad}${label}: { contains: ${formatGQLValue(val)} }`
    case 'starts_with': return `${pad}${label}: { startsWith: ${formatGQLValue(val)} }`
    case 'ends_with':   return `${pad}${label}: { endsWith: ${formatGQLValue(val)} }`
    case 'gt':          return `${pad}${label}: { gt: ${val} }`
    case 'gte':         return `${pad}${label}: { gte: ${val} }`
    case 'lt':          return `${pad}${label}: { lt: ${val} }`
    case 'lte':         return `${pad}${label}: { lte: ${val} }`
    case 'in':          return `${pad}${label}: { in: [${(val as string[]).map(formatGQLValue).join(', ')}] }`
    case 'is_null':     return `${pad}${label}: { isNull: true }`
    case 'is_not_null': return `${pad}${label}: { isNull: false }`
    default:            return `${pad}${label}: { eq: ${formatGQLValue(val)} }`
  }
}

function formatGQLValue(val: unknown): string {
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'boolean') return String(val)
  return String(val)
}

function groupToGraphQL(group: QueryGroup, schemaId: string, indent: number): string {
  const pad = ' '.repeat(indent)
  const op = group.logic === 'AND' ? 'and' : 'or'
  const children = group.children
    .map(c => nodeToGraphQL(c, schemaId, indent + 2))
    .join('\n')
  return `${pad}${op}: {\n${children}\n${pad}}`
}

function nodeToGraphQL(node: QueryNode, schemaId: string, indent: number): string {
  if (node.type === 'rule') return ruleToGraphQL(node, schemaId, indent)
  return groupToGraphQL(node, schemaId, indent)
}

export function generateGraphQL(root: QueryGroup, schemaId: string): string {
  const children = root.children
    .map(c => nodeToGraphQL(c, schemaId, 6))
    .join('\n')
  const op = root.logic === 'AND' ? 'and' : 'or'
  return `query {\n  ${schemaId}(\n    filter: {\n      ${op}: {\n${children}\n      }\n    }\n  ) {\n    id\n    # ... fields\n  }\n}`
}
