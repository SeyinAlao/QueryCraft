'use client'

import { useState, useCallback, useRef } from 'react'
import { X, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const importQuery = useQueryStore(s => s.importQuery)
  const [json, setJson]         = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    setError(null)
    const result = importQuery(json)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setJson('')
        onClose()
      }, 1000)
    } else {
      setError(result.error ?? 'Unknown error')
    }
  }, [json, importQuery, onClose])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setJson((ev.target?.result as string) ?? '')
      setError(null)
    }
    reader.readAsText(file)
  }, [])

  const handleClose = useCallback(() => {
    setJson('')
    setError(null)
    setSuccess(false)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg',
          'bg-[var(--bg-secondary)] border border-[var(--border)]',
          'rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]',
          'animate-slide-up',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileJson size={16} className="text-[var(--brand)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Import Query
            </span>
          </div>
          <button onClick={handleClose}
            className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'h-10 text-xs font-medium',
                'border border-dashed border-[var(--border)]',
                'rounded-[var(--radius-md)]',
                'text-[var(--text-muted)]',
                'hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)]',
                'transition-all duration-150',
              )}
            >
              <Upload size={13} /> Upload .json file
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">or paste JSON</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <textarea
            value={json}
            onChange={e => { setJson(e.target.value); setError(null) }}
            placeholder={'{\n  "root": { ... },\n  "schemaId": "users"\n}'}
            rows={8}
            className={cn(
              'w-full px-3 py-2.5 text-xs font-mono',
              'bg-[var(--code-bg)] border rounded-[var(--radius-md)]',
              'text-[var(--text-code)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--brand)]',
              'resize-none transition-colors',
              error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            )}
          />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--danger-bg)] border border-[var(--danger)]/30 animate-slide-down">
              <AlertCircle size={13} className="text-[var(--danger)] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-[var(--danger)]">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--success-bg)] border border-[var(--success)]/30 animate-slide-down">
              <CheckCircle size={13} className="text-[var(--success)]" />
              <span className="text-xs text-[var(--success)]">Query imported successfully!</span>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              className="h-8 px-4 text-xs rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!json.trim()}
              className={cn(
                'h-8 px-4 text-xs font-medium rounded-[var(--radius-sm)]',
                'bg-[var(--brand)] text-[var(--bg-base)]',
                'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-opacity',
              )}
            >
              Import Query
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
