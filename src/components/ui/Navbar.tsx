'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { History, Bookmark, Upload, Download, Sun, Moon, Database } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { SCHEMAS } from '@/schemas'
import { useQueryStore } from '@/store/queryStore'

interface NavbarProps {
  onHistoryOpen: () => void
  onPresetsOpen: () => void
  onImport: () => void
  onExport: () => void
}

export function Navbar({ onHistoryOpen, onPresetsOpen, onImport, onExport }: NavbarProps) {
  const activeSchemaId  = useQueryStore(s => s.activeSchemaId)
  const setActiveSchema = useQueryStore(s => s.setActiveSchema)
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = theme !== 'light'

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between px-5',
        'border-b border-[var(--border)]',
        'bg-[var(--bg-secondary)]',
        'backdrop-blur-sm sticky top-0 z-50',
      )}
    >
      <Logo size="md" />

      <nav className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {SCHEMAS.map(schema => {
          const isActive = schema.id === activeSchemaId
          return (
            <button
              key={schema.id}
              onClick={() => setActiveSchema(schema.id)}
              className={cn(
                'flex items-center gap-1.5 h-8 px-4 text-sm font-medium',
                'rounded-[var(--radius-md)] transition-all duration-150 cursor-pointer',
                isActive
                  ? [
                      'bg-[var(--brand-subtle)] text-[var(--brand)]',
                      'border border-[rgba(6,182,212,0.25)]',
                      'shadow-[0_2px_8px_var(--brand-glow)]',
                    ]
                  : [
                      'text-[var(--text-muted)]',
                      'hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
                    ]
              )}
            >
              <Database
                size={13}
                className={isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}
              />
              {schema.name}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" icon={<History size={14} />} onClick={onHistoryOpen}>
          History
        </Button>
        <Button variant="ghost" size="sm" icon={<Bookmark size={14} />} onClick={onPresetsOpen}>
          Presets
        </Button>

        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <Button variant="ghost" size="sm" icon={<Upload size={14} />} onClick={onImport}>
          Import
        </Button>
        <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={onExport}>
          Export
        </Button>

        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            'h-8 w-8 rounded-[var(--radius-md)]',
            'flex items-center justify-center',
            'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            'hover:bg-[var(--bg-elevated)] transition-all duration-150',
          )}
          aria-label="Toggle theme"
        >
          {mounted
            ? isDark ? <Sun size={15} /> : <Moon size={15} />
            : <span className="w-[15px] h-[15px]" /> 
          }
        </button>
      </div>
    </header>
  )
}
