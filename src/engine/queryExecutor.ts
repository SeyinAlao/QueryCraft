import type { QueryGroup, QueryNode, QueryRule } from '@/types/query'
import { MOCK_DATA_MAP } from '@/lib/mockData'

export function executeQuery(
  root: QueryGroup,
  schemaId: string
): Record<string, unknown>[] {
  const dataset = MOCK_DATA_MAP[schemaId] ?? []
  return dataset.filter(row => evaluateGroup(root, row))
}

function evaluateGroup(group: QueryGroup, row: Record<string, unknown>): boolean {
  if (group.children.length === 0) return true

  if (group.logic === 'AND') {
    return group.children.every(child => evaluateNode(child, row))
  }
  return group.children.some(child => evaluateNode(child, row))
}

function evaluateNode(node: QueryNode, row: Record<string, unknown>): boolean {
  if (node.type === 'rule') return evaluateRule(node, row)
  return evaluateGroup(node, row)
}

function evaluateRule(rule: QueryRule, row: Record<string, unknown>): boolean {
  const rowVal = row[rule.field]
  const ruleVal = rule.value

  switch (rule.operator) {
    case 'equals':      return String(rowVal).toLowerCase() === String(ruleVal).toLowerCase()
    case 'not_equals':  return String(rowVal).toLowerCase() !== String(ruleVal).toLowerCase()
    case 'contains':    return String(rowVal).toLowerCase().includes(String(ruleVal).toLowerCase())
    case 'not_contains':return !String(rowVal).toLowerCase().includes(String(ruleVal).toLowerCase())
    case 'starts_with': return String(rowVal).toLowerCase().startsWith(String(ruleVal).toLowerCase())
    case 'ends_with':   return String(rowVal).toLowerCase().endsWith(String(ruleVal).toLowerCase())
    case 'gt':          return Number(rowVal) > Number(ruleVal)
    case 'gte':         return Number(rowVal) >= Number(ruleVal)
    case 'lt':          return Number(rowVal) < Number(ruleVal)
    case 'lte':         return Number(rowVal) <= Number(ruleVal)
    case 'between': {
      const [a, b] = ruleVal as [number, number]
      return Number(rowVal) >= a && Number(rowVal) <= b
    }
    case 'in':      return (ruleVal as string[]).some(v => String(rowVal).toLowerCase() === String(v).toLowerCase())
    case 'not_in':  return !(ruleVal as string[]).some(v => String(rowVal).toLowerCase() === String(v).toLowerCase())
    case 'is_null':     return rowVal == null || rowVal === ''
    case 'is_not_null': return rowVal != null && rowVal !== ''
    case 'regex': {
      try { return new RegExp(String(ruleVal), 'i').test(String(rowVal)) }
      catch { return false }
    }
    default: return true
  }
}
