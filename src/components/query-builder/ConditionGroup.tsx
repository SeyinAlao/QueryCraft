'use client'

import { memo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, Plus, Layers, Trash2, FolderPlus } from 'lucide-react'
import { cn, getDepthBorderClass } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { QueryRule } from './QueryRule'
import { SortableNode } from './SortableNode'
import { AnimatedRule } from './AnimatedRule'
import { AnimatedGroupEntry, AnimatedGroupChildren } from './AnimatedGroup'
import type { QueryGroup, QueryNode } from '@/types/query'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const DEPTH_BG = [
  'bg-[var(--bg-secondary)]',
  'bg-[var(--bg-tertiary)]',
  'bg-[var(--bg-elevated)]',
  'bg-[var(--bg-elevated)]',
  'bg-[var(--bg-elevated)]',
]

export const ConditionGroup = memo(function ConditionGroup({
  group, depth, isRoot = false,
}: {
  group: QueryGroup
  depth: number
  isRoot?: boolean
}) {
  const addRule          = useQueryStore(s => s.addRule)
  const addGroup         = useQueryStore(s => s.addGroup)
  const removeNode       = useQueryStore(s => s.removeNode)
  const updateGroupLogic = useQueryStore(s => s.updateGroupLogic)
  const toggleCollapse   = useQueryStore(s => s.toggleGroupCollapse)

  const depthClass = getDepthBorderClass(depth)
  const bgClass    = DEPTH_BG[depth % 5]
  const childIds   = group.children.map(c => c.id)

  const ruleCount  = group.children.filter(c => c.type === 'rule').length
  const groupCount = group.children.filter(c => c.type === 'group').length

  const handleAddRule  = useCallback(() => addRule(group.id),                [addRule, group.id])
  const handleAddGroup = useCallback(() => addGroup(group.id),               [addGroup, group.id])
  const handleRemove   = useCallback(() => removeNode(group.id),             [removeNode, group.id])
  const handleCollapse = useCallback(() => toggleCollapse(group.id),         [toggleCollapse, group.id])
  const handleAnd      = useCallback(() => updateGroupLogic(group.id, 'AND'), [updateGroupLogic, group.id])
  const handleOr       = useCallback(() => updateGroupLogic(group.id, 'OR'),  [updateGroupLogic, group.id])

  return (
    <div 
      className={cn(
        'rounded-[var(--radius-xl)]',
        'border-l-[3px] border border-[var(--border)]',
        bgClass, depthClass,
        'shadow-sm transition-all duration-200',
        depth > 0 && 'ml-6 mt-3', 
      )}
      style={{
        marginLeft: isRoot ? '24px' : undefined,
        marginRight: '24px',
        marginTop: isRoot ? '24px' : undefined,
        marginBottom: isRoot ? '24px' : undefined
      }}
    >
      <div className={cn(
        'flex items-center gap-4 pl-6 pr-5 h-12', 
        'border-b',
        group.collapsed ? 'border-transparent' : 'border-[var(--border-subtle)]',
      )}>
        <button
          type="button"
          onClick={handleCollapse}
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer p-1 rounded-md hover:bg-[var(--bg-hover)]" // Removed the -ml-1 negative margin here
          aria-label={group.collapsed ? 'Expand' : 'Collapse'}
        >
          {group.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <span style={MONO} className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em]">
          Match
        </span>

        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)', padding: '4px', borderRadius: '8px', gap: '4px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <button 
            type="button"
            onClick={handleAnd} 
            style={{
              ...MONO,
              padding: '6px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
              background: group.logic === 'AND' ? 'var(--logic-and-bg, rgba(16,185,129,0.12))' : 'transparent',
              color: group.logic === 'AND' ? 'var(--logic-and, #10b981)' : 'var(--text-dim)',
              border: group.logic === 'AND' ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
              boxShadow: group.logic === 'AND' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            AND
          </button>
          <button 
            type="button"
            onClick={handleOr} 
            style={{
              ...MONO,
              padding: '6px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
              background: group.logic === 'OR' ? 'var(--logic-or-bg, rgba(245,158,11,0.12))' : 'transparent',
              color: group.logic === 'OR' ? 'var(--logic-or, #f59e0b)' : 'var(--text-dim)',
              border: group.logic === 'OR' ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
              boxShadow: group.logic === 'OR' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            OR
          </button>
        </div>

        <AnimatePresence>
          {group.collapsed && (
            <AnimatedRule id={`${group.id}-summary`}>
              <span style={MONO} className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
                {groupCount > 0 && ` · ${groupCount} group${groupCount !== 1 ? 's' : ''}`}
              </span>
            </AnimatedRule>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {!isRoot && (
          <button 
            type="button"
            onClick={handleRemove}
            className="h-7 w-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all rounded-[var(--radius-md)] cursor-pointer border border-transparent hover:border-[var(--danger-border)]"
            aria-label="Remove group"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <AnimatedGroupChildren isVisible={!group.collapsed}>
        <div className="p-5 flex flex-col gap-3">
          
          {group.children.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px', margin: '4px 0',
              border: '1px dashed var(--border-strong, rgba(255,255,255,0.15))',
              borderRadius: '8px',
              backgroundColor: 'transparent'
            }}>
              <span style={{
                ...MONO,
                fontSize: '11px', color: 'var(--text-dim, rgba(255,255,255,0.25))',
                textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: '12px', fontWeight: 600, userSelect: 'none'
              }}>
                Empty Logical Group
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddRule}
                  style={{
                    ...MONO,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-secondary, rgba(255,255,255,0.5))', background: 'transparent',
                    border: '1px solid var(--border-strong, rgba(255,255,255,0.15))', borderRadius: '6px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary, #ffffff)'; e.currentTarget.style.borderColor = 'var(--border-heavy, rgba(255,255,255,0.3))' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary, rgba(255,255,255,0.5))'; e.currentTarget.style.borderColor = 'var(--border-strong, rgba(255,255,255,0.15))' }}
                >
                  <Plus size={12} className="opacity-70" /> Add Rule
                </button>
                
                <button
                  type="button"
                  onClick={handleAddGroup}
                  style={{
                    ...MONO,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-secondary, rgba(255,255,255,0.5))', background: 'transparent',
                    border: '1px solid var(--border-strong, rgba(255,255,255,0.15))', borderRadius: '6px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary, #ffffff)'; e.currentTarget.style.borderColor = 'var(--border-heavy, rgba(255,255,255,0.3))' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary, rgba(255,255,255,0.5))'; e.currentTarget.style.borderColor = 'var(--border-strong, rgba(255,255,255,0.15))' }}
                >
                  <FolderPlus size={12} className="opacity-70" /> Add Group
                </button>
              </div>
            </div>
          )}

          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence initial={false}>
              {group.children.map((child: QueryNode) =>
                child.type === 'rule' ? (
                  <AnimatedRule key={child.id} id={child.id}>
                    <SortableNode id={child.id}>
                      <QueryRule rule={child} />
                    </SortableNode>
                  </AnimatedRule>
                ) : (
                  <AnimatedGroupEntry key={child.id} id={child.id}>
                    <SortableNode id={child.id}>
                      <ConditionGroup group={child} depth={depth + 1} />
                    </SortableNode>
                  </AnimatedGroupEntry>
                )
              )}
            </AnimatePresence>
          </SortableContext>

          {group.children.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginTop: '16px', 
              paddingTop: '20px', 
              paddingBottom: '8px', 
              paddingLeft: '24px',  
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <button 
                type="button"
                onClick={handleAddRule} 
                style={{
                  ...MONO,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-secondary)', background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)', borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-border)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              >
                <Plus size={14} className="stroke-[2.5px]" /> Rule
              </button>
              <button 
                type="button"
                onClick={handleAddGroup} 
                style={{
                  ...MONO,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-secondary)', background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)', borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-heavy, #ffffff)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              >
                <Layers size={14} /> Group
              </button>
            </div>
          )}
        </div>
      </AnimatedGroupChildren>
    </div>
  )
})