'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { generateSQL, generateMongoDB, generateGraphQL } from '@/engine/queryGenerator'
import { executeQuery } from '@/engine/queryExecutor'
import type { QueryFormat } from '@/types/query'

type SortDir = 'asc' | 'desc'

export function PreviewPanel() {
  const root          = useQueryStore(s => s.root)
  const schemaId      = useQueryStore(s => s.activeSchemaId)
  const [format, setFormat] = useState<QueryFormat>('sql')
  const [copied, setCopied] = useState(false)
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>('asc')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 5

  const generatedQuery = useMemo(() => {
    switch (format) {
      case 'sql':     return generateSQL(root, schemaId)
      case 'mongodb': return generateMongoDB(root)
      case 'graphql': return generateGraphQL(root, schemaId)
    }
  }, [root, schemaId, format])

  const results = useMemo(() => executeQuery(root, schemaId), [root, schemaId])

  const sorted = useMemo(() => {
    if (!sortKey) return results
    return [...results].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [results, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageRows   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const columns    = results.length > 0 ? Object.keys(results[0]) : []

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlight = (code: string, fmt: QueryFormat) => {
    const esc = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (fmt === 'sql') {
      return esc
        .replace(/'([^']*)'/g, '<span style="color:var(--code-value)">\'$1\'</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:var(--code-value)">$1</span>')
        .replace(
          /\b(SELECT|FROM|WHERE|AND|OR|NOT|LIKE|IN|IS|NULL|BETWEEN|REGEXP)\b/g,
          '<span style="color:var(--code-keyword);font-weight:600">$1</span>'
        )
    }

    if (fmt === 'mongodb') {
      return esc
        .replace(/"\$\w+"/g, m => `<span style="color:var(--code-keyword);font-weight:600">${m}</span>`)
        .replace(/"([^$][^"]*)":/g, m => `<span style="color:var(--code-field)">${m}</span>`)
        .replace(/:\s*"([^"]*)"/g, (_, v) => `: <span style="color:var(--code-value)">"${v}"</span>`)
        .replace(/:\s*(\d+\.?\d*)/g, (_, v) => `: <span style="color:var(--code-value)">${v}</span>`)
    }

    if (fmt === 'graphql') {
      return esc
        .replace(/"([^"]*)"/g, v => `<span style="color:var(--code-value)">${v}</span>`)
        .replace(/\b(query|filter|and|or)\b/g,
          '<span style="color:var(--code-keyword);font-weight:600">$1</span>')
        .replace(/:\s*(\d+\.?\d*)/g, (_, v) => `: <span style="color:var(--code-value)">${v}</span>`)
    }

    return esc
  }

  const TABS: { key: QueryFormat; label: string }[] = [
    { key: 'sql',     label: 'SQL' },
    { key: 'mongodb', label: 'MongoDB' },
    { key: 'graphql', label: 'GraphQL' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col border-b border-[var(--border)]" style={{ height: '50%' }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-0 flex-shrink-0">
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFormat(tab.key)}
                className={cn(
                  'h-7 px-3 text-xs font-mono font-medium rounded-t',
                  'transition-all duration-150',
                  'border-b-2',
                  format === tab.key
                    ? 'text-[var(--brand)] border-[var(--brand)] bg-[var(--brand-subtle)]'
                    : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 h-7 px-2.5 text-xs rounded',
              'transition-all duration-150',
              copied
                ? 'text-[var(--success)] bg-[var(--success-bg)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
            )}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div
          className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed"
          style={{ background: 'var(--code-bg)', color: 'var(--text-code)' }}
        >
          <div className="flex gap-4">
            <div className="select-none text-right" style={{ color: 'var(--text-muted)', minWidth: '1.5rem' }}>
              {generatedQuery.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre
              className="flex-1 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: highlight(generatedQuery, format) }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden" style={{ height: '50%' }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] flex-shrink-0">
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Results
          </span>
          <span
            className={cn(
              'text-xs font-mono px-2 py-0.5 rounded',
              results.length > 0
                ? 'bg-[var(--success-bg)] text-[var(--success)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
            )}
          >
            {results.length} record{results.length !== 1 ? 's' : ''} matched
          </span>
        </div>

        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
            <div className="text-2xl opacity-30">∅</div>
            <p className="text-xs">No records matched</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[var(--bg-secondary)]">
                  <tr>
                    {columns.map(col => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className={cn(
                          'px-3 py-2 text-left font-medium uppercase tracking-wider cursor-pointer',
                          'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                          'border-b border-[var(--border)] whitespace-nowrap',
                          'transition-colors duration-150 select-none',
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {col}
                          {sortKey === col && (
                            sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={cn(
                        'border-b border-[var(--border-subtle)]',
                        'hover:bg-[var(--bg-elevated)]',
                        'transition-colors duration-100',
                      )}
                    >
                      {columns.map(col => (
                        <td key={col} className="px-3 py-2 text-[var(--text-secondary)] whitespace-nowrap max-w-[140px] truncate">
                          {typeof row[col] === 'boolean' ? (
                            <span className={row[col] ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                              {String(row[col])}
                            </span>
                          ) : col === 'country' || col === 'status' || col === 'category' || col === 'paymentMethod' ? (
                            <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--brand)] font-mono text-[10px]">
                              {String(row[col])}
                            </span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-2 border-t border-[var(--border)] flex-shrink-0">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-6 w-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'h-6 w-6 flex items-center justify-center rounded text-xs font-mono transition-all',
                      p === page
                        ? 'bg-[var(--brand)] text-[#080c14] font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
                    )}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-6 w-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}