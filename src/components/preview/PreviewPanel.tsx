'use client'

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, ChevronUp, ChevronDown, Database, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { generateSQL, generateMongoDB, generateGraphQL } from '@/engine/queryGenerator'
import { executeQuery } from '@/engine/queryExecutor'
import type { QueryFormat } from '@/types/query'

const PAGE_SIZE = 8
const MAX_VISIBLE_PAGES = 5

function highlight(code: string, fmt: QueryFormat): string {
  const esc = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  if (fmt === 'sql') {
    return esc
      .replace(/'([^']*)'/g, '<span style="color:var(--code-value)">\'$1\'</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:var(--code-value)">$1</span>')
      .replace(/\b(SELECT|FROM|WHERE|AND|OR|NOT|LIKE|IN|IS|NULL|BETWEEN|REGEXP)\b/g,
        '<span style="color:var(--code-keyword);font-weight:500">$1</span>')
  }
  if (fmt === 'mongodb') {
    return esc
      .replace(/"\$\w+"/g, m => `<span style="color:var(--code-keyword);font-weight:500">${m}</span>`)
      .replace(/"([^$][^"]*)":/g, m => `<span style="color:var(--code-field)">${m}</span>`)
      .replace(/:\s*"([^"]*)"/g, (_, v) => `: <span style="color:var(--code-value)">"${v}"</span>`)
      .replace(/:\s*(\d+\.?\d*)/g, (_, v) => `: <span style="color:var(--code-value)">${v}</span>`)
  }
  if (fmt === 'graphql') {
    return esc
      .replace(/"([^"]*)"/g, v => `<span style="color:var(--code-value)">${v}</span>`)
      .replace(/\b(query|filter|and|or)\b/g,
        '<span style="color:var(--code-keyword);font-weight:500">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, (_, v) => `: <span style="color:var(--code-value)">${v}</span>`)
  }
  return esc
}

const getColWidth = (col: string): string => {
  const key = col.toLowerCase()
  if (key === 'name') return '170px'
  if (key === 'email') return '240px'
  if (key === 'age') return '75px'
  if (key === 'country') return '130px'
  if (key === 'status') return '110px'
  if (key === 'purchases') return '110px'
  if (key === 'createdat' || key === 'created_at') return '150px'
  if (key === 'verified') return '100px'
  return '130px' 
}

interface PreviewPanelProps {
  hasRun?: boolean
}

export function PreviewPanel({ hasRun = true }: PreviewPanelProps) {
  const root     = useQueryStore(s => s.root)
  const schemaId = useQueryStore(s => s.activeSchemaId)

  const [fmt, setFmt]         = useState<QueryFormat>('sql')
  const [copied, setCopied]   = useState(false)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage]       = useState(1)

  const query = useMemo(() => {
    if (fmt === 'sql')     return generateSQL(root, schemaId)
    if (fmt === 'mongodb') return generateMongoDB(root)
    return generateGraphQL(root, schemaId)
  }, [root, schemaId, fmt])

  const results = useMemo(() => {
    if (!hasRun) return []
    return executeQuery(root, schemaId) || []
  }, [root, schemaId, hasRun])

  const sorted = useMemo(() => {
    if (!sortKey) return results
    return [...results].sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [results, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const activePage = Math.min(page, totalPages)
  
  const pageRows = useMemo(() => {
    return sorted.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)
  }, [sorted, activePage])

  const columns = useMemo(() => {
    return results.length > 0 && results[0] && typeof results[0] === 'object'
      ? Object.keys(results[0])
      : []
  }, [results])

  const visiblePages = useMemo(() => {
    const pages = []
    let startPage = Math.max(1, activePage - Math.floor(MAX_VISIBLE_PAGES / 2))
    let endPage = startPage + MAX_VISIBLE_PAGES - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }, [activePage, totalPages])

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }, [sortKey])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [query])

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans bg-[var(--bg-base)]">
      
      <div className="flex flex-col border-b border-[var(--border)] overflow-hidden h-1/2">
        <div className="flex items-center justify-between px-3 sm:px-8 h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0 select-none overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.09em] flex-shrink-0 hidden sm:inline">
              Preview
            </span>
            <span className="text-[var(--border-strong)] text-[12px] font-mono opacity-40 select-none flex-shrink-0 hidden sm:inline">//</span>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {(['sql', 'mongodb', 'graphql'] as QueryFormat[]).map(f => {
                const isActive = fmt === f
                return (
                  <button 
                    key={f} 
                    onClick={() => setFmt(f)}
                    className={cn(
                      'font-mono uppercase tracking-[0.06em] rounded-md transition-all duration-150 flex items-center justify-center h-8 px-2 sm:px-4 text-[10px] sm:text-[11px] cursor-pointer select-none shadow-sm active:scale-[0.97] border min-w-[60px] sm:min-w-[68px]',
                      isActive
                        ? 'text-[var(--brand)] bg-[var(--brand-subtle)] border-[var(--brand)] font-bold'
                        : 'text-[var(--text-muted)] bg-[var(--bg-base)] border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium',
                    )}
                  >
                    {f === 'mongodb' ? 'Mongo' : f.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          <button 
            onClick={handleCopy}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2 h-8 px-2 sm:px-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.06em] rounded-md border transition-all duration-150 min-w-[70px] sm:min-w-[96px] cursor-pointer select-none shadow-sm active:scale-[0.97] flex-shrink-0 ml-2",
              copied 
                ? "bg-[var(--success-subtle)] border-[var(--success)] text-[var(--success)] font-bold"
                : "bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium"
            )}
          >
            {copied ? <Check size={11} className="text-[var(--success)] flex-shrink-0" /> : <Copy size={11} className="flex-shrink-0 opacity-70" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--code-bg)]">
          <div 
            className="min-w-full w-max px-4 sm:px-8 font-mono text-[11px] sm:text-[12px] leading-[1.8] text-[#E8E4DC] select-text flex flex-col"
            style={{ paddingTop: '28px', paddingBottom: '28px' }}
          >
            {query.split('\n').map((line, i) => (
              <div key={i} className="flex items-start min-w-full group">
                <span className="select-none w-7 sm:w-9 text-left pr-2 sm:pr-3 tabular-nums text-[var(--code-ln)] text-[10px] sm:text-[11px] opacity-35 font-medium border-r border-[var(--border)] border-opacity-20 mr-2 sm:mr-4 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="whitespace-pre pr-8" dangerouslySetInnerHTML={{ __html: highlight(line, fmt) }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-8 h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0 select-none overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.09em] hidden sm:inline">
              Inspection
            </span>
            <span className="text-[var(--border-strong)] text-[12px] font-mono opacity-40 hidden sm:inline">//</span>
            <span className={cn(
              'text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.05em] whitespace-nowrap',
              results.length > 0 ? 'text-[var(--success)]' : 'text-[var(--text-muted)]',
            )}>
              {results.length} matched
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              <Wifi size={11} className="text-[var(--success)]" />
              <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider hidden md:block">
                Simulator
              </span>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 ml-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="h-7 w-7 flex items-center justify-center text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] bg-[var(--bg-base)] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-md transition-colors shadow-sm active:scale-[0.95]"
              >
                ←
              </button>
              {visiblePages.map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    'h-7 w-7 flex items-center justify-center text-[11px] font-mono rounded-md border transition-all cursor-pointer shadow-sm active:scale-[0.95]',
                    activePage === n
                      ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-base)] font-bold'
                      : 'bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium',
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages}
                className="h-7 w-7 flex items-center justify-center text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] bg-[var(--bg-base)] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-md transition-colors shadow-sm active:scale-[0.95]"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto relative">
          {!hasRun ? (
            <div className="flex flex-col items-center justify-center h-full gap-2.5 text-[var(--text-muted)]">
              <Database size={20} strokeWidth={1.5} className="text-[var(--text-dim)] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.08em]">Press Run to execute query</span>
            </div>
          ) : results.length === 0 || columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2.5 text-[var(--text-muted)]">
              <Database size={20} strokeWidth={1.5} className="text-[var(--text-dim)]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.08em]">No records matched</span>
            </div>
          ) : (
            <table className="table-auto border-collapse min-w-full w-max select-text">
              <thead>
                <tr className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)] z-10">
                  <th className="pl-4 sm:pl-8 pr-4 py-2.5 text-left w-14 text-[11px] font-mono text-[var(--text-dim)] font-normal uppercase tracking-[0.06em]">
                    #
                  </th>
                  {columns.map((col, i) => (
                    <th key={col}
                      onClick={() => handleSort(col)}
                      className={cn(
                        "px-4 sm:px-6 py-2.5 text-left cursor-pointer hover:bg-[var(--bg-hover)] transition-colors text-[11px] font-mono text-[var(--text-muted)] font-normal uppercase tracking-[0.06em] whitespace-nowrap select-none",
                        i === columns.length - 1 && "pr-8 sm:pr-16"
                      )}
                      style={{ minWidth: getColWidth(col) }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col}</span>
                        {sortKey === col && (
                          sortDir === 'asc'
                            ? <ChevronUp size={11} className="text-[var(--brand)]" />
                            : <ChevronDown size={11} className="text-[var(--brand)]" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {pageRows.map((row, ri) => {
                  const idx = (activePage - 1) * PAGE_SIZE + ri + 1
                  return (
                    <tr key={ri} className="hover:bg-[var(--bg-hover)] transition-colors duration-75">
                      <td className="pl-4 sm:pl-8 pr-4 py-2.5 font-mono text-[11px] text-[var(--text-dim)] tabular-nums whitespace-nowrap">
                        #{String(idx).padStart(3, '0')}
                      </td>
                      {columns.map((col, ci) => {
                        const v = row[col]
                        const isNum  = typeof v === 'number'
                        const isBool = typeof v === 'boolean'
                        return (
                          <td key={col} 
                            className={cn("px-4 sm:px-6 py-2.5 font-mono whitespace-nowrap", ci === columns.length - 1 && "pr-8 sm:pr-16")}
                            style={{ minWidth: getColWidth(col) }}
                          >
                            <span className={cn(
                              'text-[12px]',
                              isNum  && 'text-[var(--brand)] font-medium',
                              isBool && (v ? 'text-[var(--success)] font-medium' : 'text-[var(--text-muted)]'),
                              !isNum && !isBool && 'text-[var(--text-secondary)]',
                            )}>
                              {isBool ? (v ? 'true' : 'false') : String(v ?? '—')}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}