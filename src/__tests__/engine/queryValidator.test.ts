
import { describe, it, expect } from 'vitest'
import { validateQuery } from '@/engine/queryValidator'
import type { QueryGroup, QueryRule } from '@/types/query'

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: 'rule_1',
    type: 'rule',
    field: 'age',
    operator: 'equals',
    value: 25,
    ...overrides,
  }
}

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return {
    id: 'group_1',
    type: 'group',
    logic: 'AND',
    collapsed: false,
    children: [],
    ...overrides,
  }
}

describe('validateQuery — valid queries', () => {
  it('passes a valid single rule', () => {
    const root = makeGroup({ children: [makeRule()] })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('passes multiple valid rules', () => {
    const root = makeGroup({
      children: [
        makeRule({ id: 'r1', field: 'age', operator: 'gt', value: 18 }),
        makeRule({ id: 'r2', field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    expect(validateQuery(root, 'users').valid).toBe(true)
  })

  it('passes an empty root group', () => {
    const root = makeGroup({ children: [] })
    expect(validateQuery(root, 'users').valid).toBe(true)
  })

  it('passes a valid nested group', () => {
    const nested = makeGroup({
      id: 'group_2',
      logic: 'OR',
      children: [makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' })],
    })
    const root = makeGroup({
      children: [makeRule({ id: 'r1' }), nested],
    })
    expect(validateQuery(root, 'users').valid).toBe(true)
  })
})

describe('validateQuery — field errors', () => {
  it('fails on unknown field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'nonexistent_field' })],
    })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('Unknown field')
  })

  it('attaches the correct nodeId to field errors', () => {
    const root = makeGroup({
      children: [makeRule({ id: 'bad_rule', field: 'nonexistent' })],
    })
    const result = validateQuery(root, 'users')
    expect(result.errors[0].nodeId).toBe('bad_rule')
  })
})

describe('validateQuery — operator/type mismatch', () => {
  it('fails when contains is used on a number field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'contains', value: '1' })],
    })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('not valid')
  })

  it('fails when regex is used on a boolean field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'verified', operator: 'regex', value: '.*' })],
    })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
  })

  it('fails when between is used on a string field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'between', value: [1, 10] })],
    })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
  })
})

describe('validateQuery — value warnings', () => {
  it('warns when a value-requiring rule has empty value', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'gt', value: '' })],
    })
    const result = validateQuery(root, 'users')
    const warnings = result.errors.filter(e => e.severity === 'warning')
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('warns when in operator has empty array', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'in', value: [] })],
    })
    const result = validateQuery(root, 'users')
    const warnings = result.errors.filter(e => e.severity === 'warning')
    expect(warnings.length).toBeGreaterThan(0)
  })
})

describe('validateQuery — range validation', () => {
  it('fails when between min > max', () => {
    const root = makeGroup({
      children: [makeRule({ operator: 'between', value: [100, 10] })],
    })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('Min value must be less than max')
  })

  it('passes when between min < max', () => {
    const root = makeGroup({
      children: [makeRule({ operator: 'between', value: [10, 100] })],
    })
    expect(validateQuery(root, 'users').valid).toBe(true)
  })
})

describe('validateQuery — empty nested groups', () => {
  it('fails when a non-root nested group is empty', () => {
    const emptyNested = makeGroup({ id: 'empty_group', children: [] })
    const root = makeGroup({ children: [emptyNested] })
    const result = validateQuery(root, 'users')
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('Empty groups')
    expect(result.errors[0].nodeId).toBe('empty_group')
  })

  it('reports errors with correct severity', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'nonexistent' })],
    })
    const result = validateQuery(root, 'users')
    expect(result.errors[0].severity).toBe('error')
  })
})
