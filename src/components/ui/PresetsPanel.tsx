'use client'

import { useState, useCallback } from 'react'
import { X, Bookmark, Trash2, Plus, Inbox, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { countNodes } from '@/store/queryStore'
import { SCHEMA_MAP } from '@/schemas'
import type { QuerySnapshot } from '@/types/query'

interface PresetsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PresetsPanel({ isOpen, onClose }: PresetsPanelProps) {
  const presets       = useQueryStore(s => s.presets)
  const savePreset    = useQueryStore(s => s.savePreset)
  const loadSnapshot  = useQueryStore(s => s.loadSnapshot)
  const deletePreset  = useQueryStore(s => s.deletePreset)

  const [isSaving, setIsSaving]   = useState(false)
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [saved, setSaved]         = useState(false)

  const handleSave = useCallback(() => {
    if (!name.trim()) return
    savePreset(name.trim(), description.trim() || undefined)
    setName('')
    setDesc('')
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [name, description, savePreset])

  const handleLoad = useCallback((snapshot: QuerySnapshot) => {
    loadSnapshot(snapshot)
    onClose()
  }, [loadSnapshot, onClose])

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={14} className="text-[var(--brand)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Saved Presets
            </span>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-[var(--success)] animate-fade-in">
                <Check size={11} /> Saved
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-3 border-b border-[var(--border)] flex-shrink-0">
          {isSaving ? (
            <div className="flex flex-col gap-2 animate-slide-down">
              <input
                type="text"
                placeholder="Preset name (required)"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setIsSaving(false)
                }}
                autoFocus
                className={cn(
                  'w-full h-8 px-3 text-xs',
                  'bg-[var(--bg-elevated)] border border-[var(--border)]',
                  'rounded-[var(--radius-sm)] text-[var(--text-primary)]',
                  'placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:border-[var(--brand)]',
                  'transition-colors',
                )}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDesc(e.target.value)}
                className={cn(
                  'w-full h-8 px-3 text-xs',
                  'bg-[var(--bg-elevated)] border border-[var(--border)]',
                  'rounded-[var(--radius-sm)] text-[var(--text-primary)]',
                  'placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:border-[var(--brand)]',
                  'transition-colors',
                )}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className={cn(
                    'flex-1 h-7 text-xs font-medium rounded-[var(--radius-sm)]',
                    'bg-[var(--brand)] text-[var(--bg-base)]',
                    'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
                    'transition-opacity',
                  )}
                >
                  Save Preset
                </button>
                <button
                  onClick={() => setIsSaving(false)}
                  className="h-7 px-3 text-xs rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsSaving(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'h-8 text-xs font-medium',
                'border border-dashed border-[var(--border)]',
                'rounded-[var(--radius-sm)]',
                'text-[var(--text-muted)]',
                'hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)]',
                'transition-all duration-150',
              )}
            >
              <Plus size={12} /> Save current query as preset
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {presets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)] px-6">
              <Inbox size={32} strokeWidth={1.5} />
              <p className="text-xs text-center leading-relaxed">
                No presets saved yet. Save your current query to reuse it later.
              </p>
            </div>
          ) : (
            <ul className="p-2 flex flex-col gap-1">
              {presets.map(preset => {
                const schema = SCHEMA_MAP[preset.schemaId]
                const nodeCount = countNodes(preset.root) - 1
                return (
                  <li key={preset.id}>
                    <div
                      className={cn(
                        'p-3 rounded-[var(--radius-md)]',
                        'border border-[var(--border)]',
                        'bg-[var(--bg-elevated)]',
                        'group',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                            {preset.name}
                          </p>
                          {preset.description && (
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                              {preset.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Delete preset"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{
                            backgroundColor: 'var(--brand-subtle)',
                            color: 'var(--brand)',
                          }}
                        >
                          {schema?.name ?? preset.schemaId}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {nodeCount} rule{nodeCount !== 1 ? 's' : ''}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{
                            backgroundColor: preset.root.logic === 'AND'
                              ? 'var(--logic-and-bg)'
                              : 'var(--logic-or-bg)',
                            color: preset.root.logic === 'AND'
                              ? 'var(--logic-and)'
                              : 'var(--logic-or)',
                          }}
                        >
                          {preset.root.logic}
                        </span>
                      </div>

                      <button
                        onClick={() => handleLoad(preset)}
                        className={cn(
                          'w-full h-6 text-[10px] font-medium',
                          'rounded-[var(--radius-sm)]',
                          'bg-[var(--brand-subtle)] text-[var(--brand)]',
                          'hover:bg-[var(--brand)] hover:text-[var(--bg-base)]',
                          'transition-all duration-150',
                        )}
                      >
                        Load Preset
                      </button>
                    </div>
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
