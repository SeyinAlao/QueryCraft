
import { describe, it, expect } from 'vitest'
import { generateSQL, generateMongoDB, generateGraphQL } from '@/engine/queryGenerator'
import type { QueryGroup, QueryRule } from '@/types/query'

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: 'rule_1',
    type: 'rule',
    field: 'age',
    operator: 'equals',
    value: 18,
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

describe('generateSQL', () => {
  it('generates basic SELECT structure', () => {
    const root = makeGroup({ children: [makeRule()] })
    const sql = generateSQL(root, 'users')
    expect(sql).toContain('SELECT *')
    expect(sql).toContain('FROM USERS')
    expect(sql).toContain('WHERE')
  })

  it('generates equals operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'equals', value: 18 })] })
    expect(generateSQL(root, 'users')).toContain('Age = 18')
  })

  it('generates not_equals operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'not_equals', value: 18 })] })
    expect(generateSQL(root, 'users')).toContain('Age != 18')
  })

  it('generates contains operator with LIKE', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' })],
    })
    expect(generateSQL(root, 'users')).toContain("LIKE '%John%'")
  })

  it('generates starts_with operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'starts_with', value: 'Jo' })],
    })
    expect(generateSQL(root, 'users')).toContain("LIKE 'Jo%'")
  })

  it('generates ends_with operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'ends_with', value: 'hn' })],
    })
    expect(generateSQL(root, 'users')).toContain("LIKE '%hn'")
  })

  it('generates gt operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'gt', value: 18 })] })
    expect(generateSQL(root, 'users')).toContain('Age > 18')
  })

  it('generates gte operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'gte', value: 21 })] })
    expect(generateSQL(root, 'users')).toContain('Age >= 21')
  })

  it('generates lt operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'lt', value: 65 })] })
    expect(generateSQL(root, 'users')).toContain('Age < 65')
  })

  it('generates lte operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'lte', value: 30 })] })
    expect(generateSQL(root, 'users')).toContain('Age <= 30')
  })

  it('generates between operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'between', value: [18, 65] })] })
    expect(generateSQL(root, 'users')).toContain('BETWEEN 18 AND 65')
  })

  it('generates in operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'in', value: ['active', 'pending'] })],
    })
    const sql = generateSQL(root, 'users')
    expect(sql).toContain('IN (')
    expect(sql).toContain("'active'")
    expect(sql).toContain("'pending'")
  })

  it('generates is_null operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'is_null', value: null })] })
    expect(generateSQL(root, 'users')).toContain('IS NULL')
  })

  it('generates is_not_null operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'is_not_null', value: null })] })
    expect(generateSQL(root, 'users')).toContain('IS NOT NULL')
  })

  it('joins multiple conditions with AND', () => {
    const root = makeGroup({
      logic: 'AND',
      children: [
        makeRule({ id: 'r1', operator: 'gt', value: 18 }),
        makeRule({ id: 'r2', field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const sql = generateSQL(root, 'users')
    expect(sql).toContain('AND')
    expect(sql).toContain('Age > 18')
    expect(sql).toContain("Account Status = 'active'")
  })

  it('joins multiple conditions with OR', () => {
    const root = makeGroup({
      logic: 'OR',
      children: [
        makeRule({ id: 'r1', operator: 'gt', value: 18 }),
        makeRule({ id: 'r2', operator: 'lt', value: 65 }),
      ],
    })
    expect(generateSQL(root, 'users')).toContain('OR')
  })

  it('handles nested groups recursively', () => {
    const nested = makeGroup({
      id: 'group_2',
      logic: 'OR',
      children: [
        makeRule({ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }),
      ],
    })
    const root = makeGroup({
      children: [
        makeRule({ id: 'r1', operator: 'gt', value: 18 }),
        nested,
      ],
    })
    const sql = generateSQL(root, 'users')
    expect(sql).toContain('Age > 18')
    expect(sql).toContain("'Nigeria'")
  })

  it('generates empty WHERE for empty root', () => {
    const root = makeGroup({ children: [] })
    const sql = generateSQL(root, 'users')
    expect(sql).toContain('SELECT *')
    expect(sql).toContain('FROM USERS')
  })
})

describe('generateMongoDB', () => {
  it('generates valid JSON structure', () => {
    const root = makeGroup({ children: [makeRule()] })
    const mongo = generateMongoDB(root)
    expect(mongo).toContain('db.collection.find(')
  })

  it('generates equals as direct field match', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'equals', value: 18 })] })
    expect(generateMongoDB(root)).toContain('"age": 18')
  })

  it('generates gt operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'gt', value: 18 })] })
    expect(generateMongoDB(root)).toContain('"$gt": 18')
  })

  it('generates and group with $and operator', () => {
    const root = makeGroup({
      logic: 'AND',
      children: [
        makeRule({ id: 'r1' }),
        makeRule({ id: 'r2', operator: 'lt', value: 65 }),
      ],
    })
    expect(generateMongoDB(root)).toContain('"$and"')
  })

  it('generates or group with $or operator', () => {
    const root = makeGroup({
      logic: 'OR',
      children: [
        makeRule({ id: 'r1' }),
        makeRule({ id: 'r2', operator: 'lt', value: 65 }),
      ],
    })
    expect(generateMongoDB(root)).toContain('"$or"')
  })

  it('generates contains with $regex', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' })],
    })
    expect(generateMongoDB(root)).toContain('"$regex"')
  })

  it('generates between with $gte and $lte', () => {
    const root = makeGroup({
      children: [makeRule({ operator: 'between', value: [18, 65] })],
    })
    const mongo = generateMongoDB(root)
    expect(mongo).toContain('"$gte": 18')
    expect(mongo).toContain('"$lte": 65')
  })

  it('generates in with $in array', () => {
    const root = makeGroup({
      children: [makeRule({ operator: 'in', value: ['active', 'pending'] })],
    })
    expect(generateMongoDB(root)).toContain('"$in"')
  })
})

describe('generateGraphQL', () => {
  it('generates query wrapper', () => {
    const root = makeGroup({ children: [makeRule()] })
    const gql = generateGraphQL(root, 'users')
    expect(gql).toContain('query {')
    expect(gql).toContain('filter:')
  })

  it('uses and: for AND logic', () => {
    const root = makeGroup({
      logic: 'AND',
      children: [makeRule({ id: 'r1' }), makeRule({ id: 'r2' })],
    })
    expect(generateGraphQL(root, 'users')).toContain('and:')
  })

  it('uses or: for OR logic', () => {
    const root = makeGroup({
      logic: 'OR',
      children: [makeRule({ id: 'r1' }), makeRule({ id: 'r2' })],
    })
    expect(generateGraphQL(root, 'users')).toContain('or:')
  })

  it('generates eq for equals operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'equals', value: 18 })] })
    expect(generateGraphQL(root, 'users')).toContain('eq:')
  })

  it('generates gt for greater than operator', () => {
    const root = makeGroup({ children: [makeRule({ operator: 'gt', value: 18 })] })
    expect(generateGraphQL(root, 'users')).toContain('gt: 18')
  })
})
