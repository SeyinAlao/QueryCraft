'use client'

import { memo, useCallback } from 'react'
import { ChevronDown, ChevronRight, Plus, Layers, Trash2 } from 'lucide-react'
import { cn, getDepthBorderClass } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { QueryRule } from './QueryRule'
import type { QueryGroup, QueryNode } from '@/types/query'

interface ConditionGroupProps {
  group: QueryGroup
  depth: number
  isRoot?: boolean
}

const DEPTH_GLOW = ['depth-0-glow','depth-1-glow','depth-2-glow','depth-3-glow','depth-4-glow']
const DEPTH_BG   = [
  'bg-[var(--bg-secondary)]',
  'bg-[var(--bg-tertiary)]',
  'bg-[var(--bg-elevated)]',
  'bg-[var(--bg-elevated)]',
  'bg-[var(--bg-elevated)]',
]

export const ConditionGroup = memo(function ConditionGroup({
  group, depth, isRoot = false,
}: ConditionGroupProps) {
  const addRule          = useQueryStore(s => s.addRule)
  const addGroup         = useQueryStore(s => s.addGroup)
  const removeNode       = useQueryStore(s => s.removeNode)
  const updateGroupLogic = useQueryStore(s => s.updateGroupLogic)
  const toggleCollapse   = useQueryStore(s => s.toggleGroupCollapse)

  const depthIndex = depth % 5
  const depthClass = getDepthBorderClass(depth)
  const glowClass  = DEPTH_GLOW[depthIndex]
  const bgClass    = DEPTH_BG[depthIndex]

  const handleAddRule         = useCallback(() => addRule(group.id),          [addRule, group.id])
  const handleAddGroup        = useCallback(() => addGroup(group.id),         [addGroup, group.id])
  const handleRemove          = useCallback(() => removeNode(group.id),       [removeNode, group.id])
  const handleToggleCollapse  = useCallback(() => toggleCollapse(group.id),   [toggleCollapse, group.id])
  const handleSetAnd          = useCallback(() => updateGroupLogic(group.id, 'AND'), [updateGroupLogic, group.id])
  const handleSetOr           = useCallback(() => updateGroupLogic(group.id, 'OR'),  [updateGroupLogic, group.id])

  const ruleCount  = group.children.filter(c => c.type === 'rule').length
  const groupCount = group.children.filter(c => c.type === 'group').length

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)]',
        'border-l-[3px]',
        'border border-[var(--border)]',
        bgClass, depthClass, glowClass,
        'transition-all duration-200',
        depth > 0 ? 'ml-4' : '',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'border-b',
          group.collapsed ? 'border-transparent' : 'border-[var(--border-subtle)]',
        )}
      >
        <button
          onClick={handleToggleCollapse}
          className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded transition-colors duration-150"
          aria-label={group.collapsed ? 'Expand group' : 'Collapse group'}
        >
          {group.collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>

        <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
          Match
        </span>

        <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden">
          <button
            onClick={handleSetAnd}
            className={cn(
              'h-6 px-3 text-xs font-mono font-semibold transition-all duration-150',
              group.logic === 'AND'
                ? 'bg-[var(--logic-and-bg)] text-[var(--logic-and)] border-r border-[var(--logic-and-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border-r border-[var(--border)]',
            )}
          >AND</button>
          <button
            onClick={handleSetOr}
            className={cn(
              'h-6 px-3 text-xs font-mono font-semibold transition-all duration-150',
              group.logic === 'OR'
                ? 'bg-[var(--logic-or-bg)] text-[var(--logic-or)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >OR</button>
        </div>

        {group.collapsed && (
          <span className="text-xs text-[var(--text-muted)] font-mono animate-fade-in">
            {ruleCount} condition{ruleCount !== 1 ? 's' : ''}
            {groupCount > 0 && `, ${groupCount} group${groupCount !== 1 ? 's' : ''}`}
            {' '}({group.logic})
          </span>
        )}

        <div className="flex-1" />

        {!isRoot && (
          <button
            onClick={handleRemove}
            className="h-6 w-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all duration-150"
            aria-label="Remove group"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {!group.collapsed && (
        <div className="p-2 flex flex-col gap-2">
          {group.children.map((child: QueryNode) =>
            child.type === 'rule' ? (
              <QueryRule key={child.id} rule={child} />
            ) : (
              <ConditionGroup key={child.id} group={child} depth={depth + 1} />
            )
          )}

          <div className="flex items-center gap-2 pt-1 pl-1">
            <button
              onClick={handleAddRule}
              className={cn(
                'flex items-center gap-1.5 h-7 px-3 text-xs text-[var(--text-muted)]',
                'rounded-[var(--radius-sm)] border border-dashed border-[var(--border)]',
                'hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)]',
                'transition-all duration-150',
              )}
            >
              <Plus size={11} /> Add Condition
            </button>
            <button
              onClick={handleAddGroup}
              className={cn(
                'flex items-center gap-1.5 h-7 px-3 text-xs text-[var(--text-muted)]',
                'rounded-[var(--radius-sm)] border border-dashed border-[var(--border)]',
                'hover:border-[#8b5cf6] hover:text-[#8b5cf6] hover:bg-[rgba(139,92,246,0.06)]',
                'transition-all duration-150',
              )}
            >
              <Layers size={11} /> Add Group
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
