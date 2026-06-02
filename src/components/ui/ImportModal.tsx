'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Upload, FileJson, AlertCircle, CheckCircle, FileUp } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const importQuery = useQueryStore(s => s.importQuery)
  const [json, setJson]         = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setJson(''); setError(null); setSuccess(false); setFileName(null)
    }
  }, [isOpen])

  const handleImport = useCallback(() => {
    setError(null)
    const result = importQuery(json)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setJson(''); onClose() }, 1200)
    } else {
      setError(result.error ?? 'Unknown error')
    }
  }, [json, importQuery, onClose])

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) { setError('Please upload a valid .json file'); return }
    setFileName(file.name); setError(null)
    const reader = new FileReader()
    reader.onload = ev => setJson((ev.target?.result as string) ?? '')
    reader.readAsText(file)
  }, [])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }, [processFile])

  const handleClose = useCallback(() => {
    setJson(''); setError(null); setSuccess(false); setFileName(null); onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={handleClose} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '520px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: '14px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)',
              borderRadius: '8px',
              flexShrink: 0,
            }}>
              <FileJson size={18} color="var(--brand)" />
            </div>
            <div>
              <p style={{ ...MONO, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Query Transfer
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Import your query configuration via JSON
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg-base)',
        }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={json}
              onChange={e => { setJson(e.target.value); setError(null); setFileName(null) }}
              placeholder={`{\n  "root": { ... },\n  "schemaId": "users"\n}`}
              spellCheck={false}
              rows={8}
              style={{
                ...MONO,
                width: '100%',
                padding: '16px 20px',
                fontSize: '13px',
                lineHeight: '1.7',
                background: 'var(--bg-elevated)',
                border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
                borderLeft: `3px solid ${error ? 'var(--danger)' : 'var(--brand)'}`,
                borderRadius: '8px',
                color: 'var(--text-primary)',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {json.length > 0 && (
              <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '10px', color: 'var(--text-dim)', ...MONO }}>
                {json.length.toLocaleString()} chars
              </span>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 20px',
              background: isDragOver ? 'var(--brand-subtle)' : 'var(--bg-secondary)',
              border: `1px dashed ${isDragOver ? 'var(--brand)' : 'var(--border-strong)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: '40px', height: '40px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', borderRadius: '8px',
              color: 'var(--text-muted)',
            }}>
              {fileName ? <FileUp size={16} /> : <Upload size={16} />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ ...MONO, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {fileName ?? 'Import from file'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                {fileName ? 'File loaded — click to change' : 'Select a .json from your device or drag & drop'}
              </p>
            </div>
          </button>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 16px',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(155,69,32,0.3)',
              borderRadius: '8px',
            }}>
              <AlertCircle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px',
              background: 'var(--success-bg)',
              border: '1px solid rgba(61,122,82,0.3)',
              borderRadius: '8px',
            }}>
              <CheckCircle size={14} color="var(--success)" />
              <span style={{ fontSize: '13px', color: 'var(--success)' }}>Query imported successfully!</span>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <span style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            {json.trim() && !error ? (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={11} /> Ready to import
              </span>
            ) : 'Paste JSON or select a file'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleClose}
              style={{
                ...MONO,
                height: '40px', padding: '0 24px',
                fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: '5px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!json.trim() || !!error}
              style={{
                ...MONO,
                height: '40px', padding: '0 32px',
                fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
                background: (!json.trim() || !!error) ? 'rgba(200,164,85,0.4)' : 'var(--brand)',
                border: 'none',
                borderRadius: '5px',
                color: 'var(--bg-base)',
                cursor: (!json.trim() || !!error) ? 'not-allowed' : 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}