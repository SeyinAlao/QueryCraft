'use client'

import {
  History, Bookmark, Upload, Download,
  Sun, Moon, Database,
} from 'lucide-react'
import { Logo } from './Logo'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { SCHEMAS } from '@/schemas'
import { useQueryStore } from '@/store/queryStore'

interface NavbarProps {
  isDark: boolean
  onThemeToggle: () => void
  onHistoryOpen: () => void
  onPresetsOpen: () => void
  onImport: () => void
  onExport: () => void
}

export function Navbar({
  isDark,
  onThemeToggle,
  onHistoryOpen,
  onPresetsOpen,
  onImport,
  onExport,
}: NavbarProps) {
  const activeSchemaId = useQueryStore(s => s.activeSchemaId)
  const setActiveSchema = useQueryStore(s => s.setActiveSchema)

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between px-5',
        'border-b border-[var(--border)]',
        'bg-[var(--bg-secondary)]',
        // Subtle backdrop — gives depth to the nav
        'backdrop-blur-sm',
        'sticky top-0 z-50',
      )}
    >
      {/* ── Left: Logo ── */}
      <Logo size="md" />

      {/* ── Center: Schema tabs ── */}
      <nav className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {SCHEMAS.map(schema => {
          const isActive = schema.id === activeSchemaId
          return (
            <button
              key={schema.id}
              onClick={() => setActiveSchema(schema.id)}
              className={cn(
                'flex items-center gap-1.5 h-8 px-4',
                'text-sm font-medium',
                'rounded-[var(--radius-md)]',
                'transition-all duration-150',
                'cursor-pointer',
                isActive
                  ? [
                      'bg-[var(--brand-subtle)]',
                      'text-[var(--brand)]',
                      'border border-[rgba(6,182,212,0.25)]',
                      // bottom glow line — our signature active indicator
                      'shadow-[0_2px_8px_var(--brand-glow)]',
                    ]
                  : [
                      'text-[var(--text-muted)]',
                      'hover:text-[var(--text-secondary)]',
                      'hover:bg-[var(--bg-elevated)]',
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

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<History size={14} />}
          onClick={onHistoryOpen}
        >
          History
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<Bookmark size={14} />}
          onClick={onPresetsOpen}
        >
          Presets
        </Button>

        {/* Divider */}
        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <Button
          variant="ghost"
          size="sm"
          icon={<Upload size={14} />}
          onClick={onImport}
        >
          Import
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<Download size={14} />}
          onClick={onExport}
        >
          Export
        </Button>

        {/* Divider */}
        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className={cn(
            'h-8 w-8 rounded-[var(--radius-md)]',
            'flex items-center justify-center',
            'text-[var(--text-muted)]',
            'hover:text-[var(--text-secondary)]',
            'hover:bg-[var(--bg-elevated)]',
            'transition-all duration-150',
          )}
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun size={15} />
            : <Moon size={15} />
          }
        </button>
      </div>
    </header>
  )
}
