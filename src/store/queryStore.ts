import { create } from 'zustand'
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import { SCHEMAS } from '@/schemas'
import type {
  QueryGroup,
  QueryNode,
  QueryRule,
  LogicOperator,
  QuerySnapshot,
} from '@/types/query'

interface QueryStore {
  root: QueryGroup
  executedRoot: QueryGroup | null
  activeSchemaId: string
  history: QuerySnapshot[]
  presets: QuerySnapshot[]
  selectedNodeId: string | null

  setExecutedRoot: () => void

  setActiveSchema: (schemaId: string) => void

  addRule: (groupId: string) => void
  addGroup: (groupId: string) => void
  removeNode: (nodeId: string) => void
  updateRule: (ruleId: string, patch: Partial<Omit<QueryRule, 'id' | 'type'>>) => void
  updateGroupLogic: (groupId: string, logic: LogicOperator) => void
  toggleGroupCollapse: (groupId: string) => void
  moveNode: (nodeId: string, targetGroupId: string, newIndex: number) => void

  setSelectedNode: (nodeId: string | null) => void

  saveToHistory: (name: string) => void
  savePreset: (name: string, description?: string) => void
  loadSnapshot: (snapshot: QuerySnapshot) => void
  deletePreset: (presetId: string) => void

  exportQuery: () => string
  importQuery: (json: string) => { success: boolean; error?: string }

  resetQuery: () => void
}

function createRule(fieldKey: string): QueryRule {
  return {
    id: generateId('rule'),
    type: 'rule',
    field: fieldKey,
    operator: 'equals',
    value: '',
  }
}

function createGroup(firstFieldKey: string): QueryGroup {
  return {
    id: generateId('group'),
    type: 'group',
    logic: 'AND',
    collapsed: false,
    children: [createRule(firstFieldKey)],
  }
}

function createRootGroup(): QueryGroup {
  return {
    id: generateId('group'),
    type: 'group',
    logic: 'AND',
    collapsed: false,
    children: [], 
  }
}

function mapTree(
  node: QueryNode,
  transform: (node: QueryNode) => QueryNode
): QueryNode {
  const transformed = transform(node)

  if (transformed.type === 'group') {
    return {
      ...transformed,
      children: transformed.children.map(child => mapTree(child, transform)),
    }
  }

  return transformed
}

export function findNode(root: QueryNode, id: string): QueryNode | undefined {
  if (root.id === id) return root

  if (root.type === 'group') {
    for (const child of root.children) {
      const found = findNode(child, id)
      if (found) return found
    }
  }

  return undefined
}

export function findParentGroup(
  root: QueryGroup,
  childId: string
): QueryGroup | undefined {
  for (const child of root.children) {
    if (child.id === childId) return root

    if (child.type === 'group') {
      const found = findParentGroup(child, childId)
      if (found) return found
    }
  }

  return undefined
}

function removeNodeFromTree(root: QueryGroup, nodeId: string): QueryGroup {
  return {
    ...root,
    children: root.children
      .filter(child => child.id !== nodeId)
      .map(child => {
        if (child.type === 'group') {
          return removeNodeFromTree(child, nodeId)
        }
        return child
      }),
  }
}

export function countNodes(node: QueryNode): number {
  if (node.type === 'rule') return 1
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
}

const DEFAULT_SCHEMA_ID = 'users'
const initialRoot = createRootGroup()

export const useQueryStore = create<QueryStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        root: initialRoot,
        executedRoot: null,
        activeSchemaId: DEFAULT_SCHEMA_ID,
        history: [],
        presets: [],
        selectedNodeId: null,

        setExecutedRoot: () => {
          set(
            (state) => ({ 
              executedRoot: JSON.parse(JSON.stringify(state.root)) 
            }),
            false,
            'setExecutedRoot'
          )
        },
        
        setActiveSchema: (schemaId) => {
          const schema = SCHEMAS.find(s => s.id === schemaId)
          if (!schema) return

          set(
            {
              activeSchemaId: schemaId,
              root: createRootGroup(),
              executedRoot: null, 
            },
            false,
            'setActiveSchema'
          )
        },

        addRule: (groupId) => {
          const { activeSchemaId } = get()
          const schema = SCHEMAS.find(s => s.id === activeSchemaId)
          const firstField = schema?.fields[0]?.key ?? 'name'
          const newRule = createRule(firstField)

          set(
            state => ({
              root: mapTree(state.root, node => {
                if (node.id === groupId && node.type === 'group') {
                  return { ...node, children: [...node.children, newRule] }
                }
                return node
              }) as QueryGroup,
            }),
            false,
            'addRule'
          )
        },

        addGroup: (groupId) => {
          const { activeSchemaId } = get()
          const schema = SCHEMAS.find(s => s.id === activeSchemaId)
          const firstField = schema?.fields[0]?.key ?? 'name'
          const newGroup = createGroup(firstField)

          set(
            state => ({
              root: mapTree(state.root, node => {
                if (node.id === groupId && node.type === 'group') {
                  return { ...node, children: [...node.children, newGroup] }
                }
                return node
              }) as QueryGroup,
            }),
            false,
            'addGroup'
          )
        },

        removeNode: (nodeId) => {
          if (nodeId === get().root.id) return

          set(
            state => ({
              root: removeNodeFromTree(state.root, nodeId),
              selectedNodeId:
                state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            }),
            false,
            'removeNode'
          )
        },

        updateRule: (ruleId, patch) => {
          set(
            state => ({
              root: mapTree(state.root, node => {
                if (node.id === ruleId && node.type === 'rule') {
                  return { ...node, ...patch }
                }
                return node
              }) as QueryGroup,
            }),
            false,
            'updateRule'
          )
        },

        updateGroupLogic: (groupId, logic) => {
          set(
            state => ({
              root: mapTree(state.root, node => {
                if (node.id === groupId && node.type === 'group') {
                  return { ...node, logic }
                }
                return node
              }) as QueryGroup,
            }),
            false,
            'updateGroupLogic'
          )
        },

        toggleGroupCollapse: (groupId) => {
          set(
            state => ({
              root: mapTree(state.root, node => {
                if (node.id === groupId && node.type === 'group') {
                  return { ...node, collapsed: !node.collapsed }
                }
                return node
              }) as QueryGroup,
            }),
            false,
            'toggleGroupCollapse'
          )
        },

        moveNode: (nodeId, targetGroupId, newIndex) => {
          const { root } = get()
          const nodeToMove = findNode(root, nodeId)
          if (!nodeToMove) return
          const rootWithoutNode = removeNodeFromTree(root, nodeId)
          const newRoot = mapTree(rootWithoutNode, node => {
            if (node.id === targetGroupId && node.type === 'group') {
              const children = [...node.children]
              children.splice(newIndex, 0, nodeToMove)
              return { ...node, children }
            }
            return node
          }) as QueryGroup

          set({ root: newRoot }, false, 'moveNode')
        },
        setSelectedNode: (nodeId) => {
          set({ selectedNodeId: nodeId }, false, 'setSelectedNode')
        },

        saveToHistory: (name) => {
          const { root, activeSchemaId } = get()
          const snapshot: QuerySnapshot = {
            id: generateId('group'),
            name,
            root: JSON.parse(JSON.stringify(root)) as QueryGroup,
            schemaId: activeSchemaId,
            createdAt: new Date(),
          }
          set(
            state => ({
              history: [snapshot, ...state.history].slice(0, 50), 
            }),
            false,
            'saveToHistory'
          )
        },

        savePreset: (name, description) => {
          const { root, activeSchemaId } = get()
          const preset: QuerySnapshot = {
            id: generateId('group'),
            name,
            description,
            root: JSON.parse(JSON.stringify(root)) as QueryGroup,
            schemaId: activeSchemaId,
            createdAt: new Date(),
          }
          set(
            state => ({ presets: [...state.presets, preset] }),
            false,
            'savePreset'
          )
        },

        loadSnapshot: (snapshot) => {
          set(
            {
              root: JSON.parse(JSON.stringify(snapshot.root)) as QueryGroup,
              activeSchemaId: snapshot.schemaId,
              executedRoot: null, 
            },
            false,
            'loadSnapshot'
          )
        },

        deletePreset: (presetId) => {
          set(
            state => ({
              presets: state.presets.filter(p => p.id !== presetId),
            }),
            false,
            'deletePreset'
          )
        },

        exportQuery: () => {
          const { root, activeSchemaId } = get()
          return JSON.stringify({ root, schemaId: activeSchemaId }, null, 2)
        },

        importQuery: (json) => {
          try {
            const parsed = JSON.parse(json) as { root: QueryGroup; schemaId: string }

            if (!parsed.root || parsed.root.type !== 'group') {
              return { success: false, error: 'Invalid query format: root must be a group' }
            }
            if (!parsed.schemaId || !SCHEMAS.find(s => s.id === parsed.schemaId)) {
              return { success: false, error: 'Invalid or unknown schema ID' }
            }

            set(
              {
                root: parsed.root,
                activeSchemaId: parsed.schemaId,
                executedRoot: null, 
              },
              false,
              'importQuery'
            )

            return { success: true }
          } catch {
            return { success: false, error: 'Invalid JSON — could not parse query' }
          }
        },

        resetQuery: () => {
          set(
            {
              root: createRootGroup(),
              activeSchemaId: DEFAULT_SCHEMA_ID,
              selectedNodeId: null,
              executedRoot: null, 
            },
            false,
            'resetQuery'
          )
        },
      })),
      {
        name: 'query-craft-storage', 
      }
    ),
    { name: 'QueryCraft Store' }
  )
)

export const selectRoot = (state: QueryStore) => state.root
export const selectExecutedRoot = (state: QueryStore) => state.executedRoot 
export const selectActiveSchemaId = (state: QueryStore) => state.activeSchemaId
export const selectHistory = (state: QueryStore) => state.history
export const selectPresets = (state: QueryStore) => state.presets
export const selectSelectedNodeId = (state: QueryStore) => state.selectedNodeId