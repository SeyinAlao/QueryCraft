'use client'

import { useCallback } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { ConditionGroup } from './ConditionGroup'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { countNodes } from '@/store/queryStore'

interface QueryBuilderPanelProps {
  onRunQuery?: () => void
}

export function QueryBuilderPanel({ onRunQuery }: QueryBuilderPanelProps) {
  const root = useQueryStore(s => s.root)
  const resetQuery = useQueryStore(s => s.resetQuery)

  const conditionCount = root.children.filter(c => c.type === 'rule').length
    + root.children
        .filter(c => c.type === 'group')
        .reduce((sum, g) => sum + (g.type === 'group' ? countNodes(g) - 1 : 0), 0)

  const handleReset = useCallback(() => {
    if (window.confirm('Reset query? All conditions will be cleared.')) {
      resetQuery()
    }
  }, [resetQuery])

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          'flex items-center justify-between',
          'px-5 py-3',
          'border-b border-[var(--border)]',
          'bg-[var(--bg-secondary)]',
          'flex-shrink-0',
        )}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Query Builder
          </h2>
          <Badge variant="default">
            {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Play size={12} />}
            onClick={onRunQuery}
          >
            Run Query
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ConditionGroup
          group={root}
          depth={0}
          isRoot
        />
        <div className="mt-6 flex items-center gap-3 px-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Nesting depth
          </span>
          {['var(--depth-0)', 'var(--depth-1)', 'var(--depth-2)', 'var(--depth-3)', 'var(--depth-4)'].map(
            (_, i) => (
              <div
                key={i}
                className="flex items-center gap-1"
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: `var(--depth-${i})`, opacity: 0.8 }}
                />
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {i === 0 ? 'root' : `L${i}`}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
