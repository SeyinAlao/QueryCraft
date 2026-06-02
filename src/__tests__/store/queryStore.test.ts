import { describe, it, expect, beforeEach } from 'vitest'
import { useQueryStore, findNode, findParentGroup, countNodes } from '@/store/queryStore'

beforeEach(() => {
  useQueryStore.getState().resetQuery()
})

describe('initial state', () => {
  it('starts with a root group', () => {
    const { root } = useQueryStore.getState()
    expect(root.type).toBe('group')
    expect(root.logic).toBe('AND')
    expect(root.collapsed).toBe(false)
  })

  it('root group starts completely empty', () => {
    const { root } = useQueryStore.getState()
    expect(root.children).toHaveLength(0)
  })

  it('defaults to users schema', () => {
    const { activeSchemaId } = useQueryStore.getState()
    expect(activeSchemaId).toBe('users')
  })
})

describe('addRule', () => {
  it('adds a rule to the root group', () => {
    const { root, addRule } = useQueryStore.getState()
    addRule(root.id)

    const newRoot = useQueryStore.getState().root
    expect(newRoot.children).toHaveLength(1)
    expect(newRoot.children[0].type).toBe('rule')
  })

  it('adds a rule to a nested group', () => {
    const { root, addGroup } = useQueryStore.getState()
    addGroup(root.id)

    const nestedGroup = useQueryStore.getState().root.children.find(
      c => c.type === 'group'
    )!

    useQueryStore.getState().addRule(nestedGroup.id)

    const updatedGroup = findNode(useQueryStore.getState().root, nestedGroup.id)
    expect(updatedGroup?.type).toBe('group')
    if (updatedGroup?.type === 'group') {
      expect(updatedGroup.children).toHaveLength(2)
    }
  })
})

describe('addGroup', () => {
  it('adds a nested group to root', () => {
    const { root, addGroup } = useQueryStore.getState()
    addGroup(root.id)

    const newRoot = useQueryStore.getState().root
    const groups = newRoot.children.filter(c => c.type === 'group')
    expect(groups).toHaveLength(1)
  })

  it('new group contains one default rule', () => {
    const { root, addGroup } = useQueryStore.getState()
    addGroup(root.id)

    const nestedGroup = useQueryStore.getState().root.children.find(
      c => c.type === 'group'
    )
    expect(nestedGroup?.type).toBe('group')
    if (nestedGroup?.type === 'group') {
      expect(nestedGroup.children).toHaveLength(1)
    }
  })
})

describe('removeNode', () => {
  it('removes a rule from the tree', () => {
    const { root, addRule, removeNode } = useQueryStore.getState()
    addRule(root.id)

    const ruleId = useQueryStore.getState().root.children[0].id
    removeNode(ruleId)

    const newRoot = useQueryStore.getState().root
    expect(newRoot.children).toHaveLength(0)
    expect(findNode(newRoot, ruleId)).toBeUndefined()
  })

  it('does not remove the root group', () => {
    const { root, removeNode } = useQueryStore.getState()
    removeNode(root.id)

    const newRoot = useQueryStore.getState().root
    expect(newRoot.id).toBe(root.id)
  })

  it('removes a nested group', () => {
    const { root, addGroup, removeNode } = useQueryStore.getState()
    addGroup(root.id)

    const nestedGroup = useQueryStore.getState().root.children.find(
      c => c.type === 'group'
    )!
    removeNode(nestedGroup.id)

    const newRoot = useQueryStore.getState().root
    expect(findNode(newRoot, nestedGroup.id)).toBeUndefined()
  })
})

describe('updateRule', () => {
  it('updates a rule field', () => {
    const { root, addRule, updateRule } = useQueryStore.getState()
    addRule(root.id) 

    const rule = useQueryStore.getState().root.children[0]
    updateRule(rule.id, { field: 'email', operator: 'contains', value: '@gmail' })

    const updated = findNode(useQueryStore.getState().root, rule.id)
    expect(updated?.type).toBe('rule')
    if (updated?.type === 'rule') {
      expect(updated.field).toBe('email')
      expect(updated.operator).toBe('contains')
      expect(updated.value).toBe('@gmail')
    }
  })
})

describe('updateGroupLogic', () => {
  it('toggles group logic to OR', () => {
    const { root, updateGroupLogic } = useQueryStore.getState()
    updateGroupLogic(root.id, 'OR')

    const newRoot = useQueryStore.getState().root
    expect(newRoot.logic).toBe('OR')
  })
})

describe('toggleGroupCollapse', () => {
  it('collapses and expands a group', () => {
    const { root, toggleGroupCollapse } = useQueryStore.getState()
    expect(root.collapsed).toBe(false)

    toggleGroupCollapse(root.id)
    expect(useQueryStore.getState().root.collapsed).toBe(true)

    toggleGroupCollapse(root.id)
    expect(useQueryStore.getState().root.collapsed).toBe(false)
  })
})

describe('exportQuery / importQuery', () => {
  it('exports valid JSON', () => {
    const json = useQueryStore.getState().exportQuery()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('imports a valid query', () => {
    const { root, addGroup, exportQuery, resetQuery, importQuery } =
      useQueryStore.getState()

    addGroup(root.id)
    const exported = exportQuery()
    resetQuery()

    const result = importQuery(exported)
    expect(result.success).toBe(true)
  })

  it('rejects invalid JSON', () => {
    const result = useQueryStore.getState().importQuery('not valid json {{{')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('rejects query with wrong root type', () => {
    const bad = JSON.stringify({ root: { type: 'rule' }, schemaId: 'users' })
    const result = useQueryStore.getState().importQuery(bad)
    expect(result.success).toBe(false)
  })
})

describe('tree utility functions', () => {
  it('findNode finds a node at any depth', () => {
    const { root, addRule } = useQueryStore.getState()
    addRule(root.id)

    const ruleId = useQueryStore.getState().root.children[0].id
    const found = findNode(useQueryStore.getState().root, ruleId)
    expect(found?.id).toBe(ruleId)
  })

  it('findParentGroup finds the parent of a rule', () => {
    const { root, addRule } = useQueryStore.getState()
    addRule(root.id)

    const ruleId = useQueryStore.getState().root.children[0].id
    const parent = findParentGroup(useQueryStore.getState().root, ruleId)
    expect(parent?.id).toBe(root.id)
  })

  it('countNodes counts all nodes correctly', () => {
    const { root } = useQueryStore.getState()
    expect(countNodes(root)).toBe(1)
  })
})

describe('setActiveSchema', () => {
  it('changes schema and resets query', () => {
    const { setActiveSchema } = useQueryStore.getState()
    setActiveSchema('orders')

    const state = useQueryStore.getState()
    expect(state.activeSchemaId).toBe('orders')
    expect(state.root.children).toHaveLength(0)
  })
})