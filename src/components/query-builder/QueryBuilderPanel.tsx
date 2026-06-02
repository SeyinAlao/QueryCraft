'use client'

import { useCallback } from 'react'
import {
  DndContext, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Play, RotateCcw } from 'lucide-react'
import { useQueryStore, countNodes, findParentGroup } from '@/store/queryStore'
import { ConditionGroup } from './ConditionGroup'

interface QueryBuilderPanelProps { 
  onRunQuery?: () => void 
  onQueryChange?: () => void
}

export function QueryBuilderPanel({ onRunQuery, onQueryChange }: QueryBuilderPanelProps) {
  const root          = useQueryStore(s => s.root)
  const resetQuery    = useQueryStore(s => s.resetQuery)
  const moveNode      = useQueryStore(s => s.moveNode)
  const saveToHistory = useQueryStore(s => s.saveToHistory)
  const setExecutedRoot = useQueryStore(s => s.setExecutedRoot) 

  const ruleCount = Math.max(0, countNodes(root) - 1)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const parent = findParentGroup(root, active.id as string)
    if (!parent) return
    const idx = parent.children.findIndex(c => c.id === over.id)
    if (idx === -1) return
    
    moveNode(active.id as string, parent.id, idx)
    onQueryChange?.() 
  }, [root, moveNode, onQueryChange])

  const handleReset = useCallback(() => {
    resetQuery()
    onQueryChange?.() 
  }, [resetQuery, onQueryChange])

  const handleRun = useCallback(() => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    saveToHistory(`Query at ${t}`)
    setExecutedRoot() 
    onRunQuery?.()
  }, [saveToHistory, setExecutedRoot, onRunQuery]) 

  return (
    <div className="flex flex-col h-full w-full min-w-0 font-sans bg-[var(--bg-base)]">
      
      <div className="flex items-center justify-between pl-6 pr-8 h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0 w-full min-w-0 select-none">
        
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[0.09em] flex-shrink-0">
            Builder
          </span>
          <span className="font-mono text-[var(--border-strong)] text-[12px] opacity-40 flex-shrink-0 select-none">//</span>
          <span className="font-mono text-[11px] text-[var(--brand)] uppercase tracking-[0.06em] flex-shrink-0 font-semibold">
            {ruleCount} condition{ruleCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            
            <button
              type="button"
              onClick={handleReset}
              className="font-mono uppercase tracking-[0.06em] rounded-md border cursor-pointer transition-all duration-150 h-8 min-w-[92px] px-4 bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-[0.97] text-[11px] font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw size={11} className="opacity-70 flex-shrink-0" />
              <span>Reset</span>
            </button>
            
            <button
              type="button"
              onClick={handleRun}
              className="font-mono uppercase tracking-[0.06em] rounded-md cursor-pointer transition-all duration-100 h-8 min-w-[84px] px-4 bg-[var(--text-primary)] border border-transparent text-[var(--bg-base)] hover:opacity-90 active:scale-[0.97] text-[11px] font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Play size={10} fill="currentColor" className="flex-shrink-0 translate-x-[-0.5px]" />
              <span>Run</span>
            </button>

          </div>
          
          <div className="flex items-center gap-2 hidden sm:flex">
            <span className="font-mono text-[12px] text-[var(--border-strong)] opacity-40 select-none">//</span>
            <span className="font-mono text-[11px] text-[var(--text-dim)] uppercase tracking-[0.09em] font-medium opacity-50 select-none">
              Engine.core
            </span>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-y-auto p-5">
          <ConditionGroup group={root} depth={0} isRoot />
        </div>
      </DndContext>
    </div>
  )
}