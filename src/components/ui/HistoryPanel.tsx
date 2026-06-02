'use client'

import { useCallback } from 'react'
import { X, Clock, RotateCcw, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore, countNodes } from '@/store/queryStore'
import { SCHEMA_MAP } from '@/schemas'
import { Badge } from './Badge'
import type { QuerySnapshot } from '@/types/query'

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const history      = useQueryStore(s => s.history)
  const loadSnapshot = useQueryStore(s => s.loadSnapshot)

  const handleLoad = useCallback((snapshot: QuerySnapshot) => {
    loadSnapshot(snapshot)
    onClose()
  }, [loadSnapshot, onClose])

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    return isToday ? 'Today' : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed right-0 top-0 h-full z-50',
          'w-80 flex flex-col',
          'bg-[var(--bg-secondary)] border-l border-[var(--border)]',
          'shadow-[var(--shadow-lg)]',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div 
          className="flex items-center justify-between border-b border-[var(--border)] flex-shrink-0"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--brand)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Query History
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <p 
          className="text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] flex-shrink-0"
          style={{ padding: '12px 20px' }}
        >
          Last {history.length} queries. Click any to restore.
        </p>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)] px-6">
              <Inbox size={32} strokeWidth={1.5} />
              <p className="text-xs text-center leading-relaxed">
                No history yet. Run a query to start recording.
              </p>
            </div>
          ) : (
            <ul style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((snapshot, index) => {
                const schema = SCHEMA_MAP[snapshot.schemaId]
                const nodeCount = countNodes(snapshot.root) - 1 
                const isAnd = snapshot.root.logic === 'AND'

                return (
                  <li key={snapshot.id}>
                    <button
                      onClick={() => handleLoad(snapshot)}
                      className={cn(
                        'w-full text-left transition-all duration-150 group',
                        index === 0 ? 'bg-[var(--bg-elevated)] border-[var(--border)]' : 'border-transparent hover:bg-[var(--bg-elevated)] hover:border-[var(--border)]'
                      )}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '8px',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2 min-w-0">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {snapshot.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                              {schema?.name ?? snapshot.schemaId}
                            </Badge>
                            <Badge variant={isAnd ? 'and' : 'or'} className="text-[10px] px-1.5 py-0">
                              {snapshot.root.logic}
                            </Badge>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono ml-1">
                              {nodeCount} rule{nodeCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            {formatTime(snapshot.createdAt)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {formatDate(snapshot.createdAt)}
                          </span>
                          <RotateCcw
                            size={12}
                            className="text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                          />
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}