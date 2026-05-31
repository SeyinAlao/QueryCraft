
import { describe, it, expect } from 'vitest'
import { executeQuery } from '@/engine/queryExecutor'
import type { QueryGroup, QueryRule } from '@/types/query'

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: 'rule_1',
    type: 'rule',
    field: 'age',
    operator: 'equals',
    value: 28,
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

describe('executeQuery — basic operators', () => {
  it('equals — matches exact value', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'equals', value: 28 })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => r.age === 28)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('not_equals — excludes exact value', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'country', operator: 'not_equals', value: 'Nigeria' })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => r.country !== 'Nigeria')).toBe(true)
  })

  it('gt — filters rows where age > 30', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'gt', value: 30 })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) > 30)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('gte — filters rows where age >= 28', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'gte', value: 28 })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) >= 28)).toBe(true)
  })

  it('lt — filters rows where age < 25', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'lt', value: 25 })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) < 25)).toBe(true)
  })

  it('lte — filters rows where age <= 22', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'lte', value: 22 })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) <= 22)).toBe(true)
  })

  it('between — filters rows in range 25-35', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'between', value: [25, 35] })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) >= 25 && Number(r.age) <= 35)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('contains — matches partial string', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'Okafor' })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => String(r.name).toLowerCase().includes('okafor'))).toBe(true)
  })

  it('starts_with — matches prefix', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'starts_with', value: 'Am' })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => String(r.name).toLowerCase().startsWith('am'))).toBe(true)
  })

  it('ends_with — matches suffix', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'email', operator: 'ends_with', value: '.com' })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => String(r.email).endsWith('.com'))).toBe(true)
  })

  it('in — matches any value in array', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'country', operator: 'in', value: ['Nigeria', 'Ghana'] })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => r.country === 'Nigeria' || r.country === 'Ghana')).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('not_in — excludes values in array', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'not_in', value: ['suspended', 'inactive'] })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => r.status !== 'suspended' && r.status !== 'inactive')).toBe(true)
  })

  it('is_null — matches null or empty values', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'is_null', value: null })],
    })
    const results = executeQuery(root, 'users')
    expect(results).toHaveLength(0)
  })

  it('is_not_null — excludes null values', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'is_not_null', value: null })],
    })
    const results = executeQuery(root, 'users')
    expect(results.length).toBeGreaterThan(0)
  })

  it('regex — matches pattern', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'email', operator: 'regex', value: '^amara' })],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => /^amara/i.test(String(r.email)))).toBe(true)
  })
})

describe('executeQuery — logic operators', () => {
  it('AND — both conditions must match', () => {
    const root = makeGroup({
      logic: 'AND',
      children: [
        makeRule({ id: 'r1', field: 'age', operator: 'gt', value: 18 }),
        makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }),
      ],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => Number(r.age) > 18 && r.country === 'Nigeria')).toBe(true)
  })

  it('OR — at least one condition must match', () => {
    const root = makeGroup({
      logic: 'OR',
      children: [
        makeRule({ id: 'r1', field: 'country', operator: 'equals', value: 'Nigeria' }),
        makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Ghana' }),
      ],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r => r.country === 'Nigeria' || r.country === 'Ghana')).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('AND with 0 results when no match', () => {
    const root = makeGroup({
      logic: 'AND',
      children: [
        makeRule({ id: 'r1', field: 'age', operator: 'gt', value: 100 }),
        makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }),
      ],
    })
    expect(executeQuery(root, 'users')).toHaveLength(0)
  })
})

describe('executeQuery — nested groups', () => {
  it('evaluates nested OR inside AND correctly', () => {
    const innerGroup = makeGroup({
      id: 'group_inner',
      logic: 'OR',
      children: [
        makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }),
        makeRule({ id: 'r3', field: 'country', operator: 'equals', value: 'Ghana' }),
      ],
    })
    const root = makeGroup({
      children: [
        makeRule({ id: 'r1', field: 'age', operator: 'gt', value: 18 }),
        innerGroup,
      ],
    })
    const results = executeQuery(root, 'users')
    expect(results.every(r =>
      Number(r.age) > 18 && (r.country === 'Nigeria' || r.country === 'Ghana')
    )).toBe(true)
  })

  it('returns all rows when root group is empty', () => {
    const root = makeGroup({ children: [] })
    const results = executeQuery(root, 'users')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('executeQuery — schema switching', () => {
  it('filters orders dataset', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'amount', operator: 'gt', value: 100 })],
    })
    const results = executeQuery(root, 'orders')
    expect(results.every(r => Number(r.amount) > 100)).toBe(true)
  })

  it('filters products dataset', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'inStock', operator: 'equals', value: true })],
    })
    const results = executeQuery(root, 'products')
    expect(results.every(r => r.inStock === true)).toBe(true)
  })

  it('returns empty array for unknown schema', () => {
    const root = makeGroup({ children: [makeRule()] })
    const results = executeQuery(root, 'nonexistent_schema')
    expect(results).toHaveLength(0)
  })
})
